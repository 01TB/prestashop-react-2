import { useEffect, useMemo, useState } from 'react';
import { listProducts } from '../../../resources/products/products.service';
import { listCombinations } from '../../../resources/combinations/combinations.service';
import { listProductOptions } from '../../../resources/product_options/product_options.service';
import { listProductOptionValues } from '../../../resources/product_option_values/product_option_values.service';
import { listStockAvailables } from '../../../resources/stock_availables/stock_availables.service';
import { listStockMovements } from '../../../resources/stock_movements/stock_movements.service';
import { listOrders } from '../../../resources/orders/orders.service';
import { listOrderDetails } from '../../../resources/order_details/order_details.service';
import { listOrderStates } from '../../../resources/order_states/order_states.service';
import type { ProductOutput } from '../../../resources/products/products.types';
import type { CombinationOutput } from '../../../resources/combinations/combinations.types';
import type { ProductOptionOutput } from '../../../resources/product_options/product_options.types';
import type { ProductOptionValueOutput } from '../../../resources/product_option_values/product_option_values.types';
import type { StockMovement } from '../../../resources/stock_movements/stock_movements.types';
import type { StockAvailableOutput } from '../../../resources/stock_availables/stock_availables.types';
import type { OrderOutput } from '../../../resources/orders/orders.types';
import type { OrderDetailOutput } from '../../../resources/order_details/order_details.types';
import type { OrderStateOutput } from '../../../resources/order_states/order_states.types';

export interface StockProductChoice {
  id: number;
  label: string;
  product: ProductOutput;
}

export interface StockCombinationChoice {
  id: number | null;
  label: string;
}

export interface StockEvolutionRow {
  dateKey: string;
  dateLabel: string;
  stockStart: number;
  entries: number;
  exits: number;
  stockEnd: number;
}

const getLangValue = (map: Record<number, string> | undefined, preferred = 1): string =>
  map?.[preferred] ?? Object.values(map ?? {})[0] ?? '';

const normalizeDateKey = (value: string): string => value.slice(0, 10);

const formatDateKey = (dateKey: string): string => {
  const [year, month, day] = dateKey.split('-');
  if (!year || !month || !day) return dateKey;
  return `${day}/${month}/${year}`;
};

const buildDateRange = (startKey: string, endKey: string): string[] => {
  const result: string[] = [];
  const current = new Date(`${startKey}T00:00:00`);
  const end = new Date(`${endKey}T00:00:00`);

  if (Number.isNaN(current.getTime()) || Number.isNaN(end.getTime())) {
    return result;
  }

  while (current <= end) {
    const year = current.getFullYear();
    const month = String(current.getMonth() + 1).padStart(2, '0');
    const day = String(current.getDate()).padStart(2, '0');
    result.push(`${year}-${month}-${day}`);
    current.setDate(current.getDate() + 1);
  }

  return result;
};

const getProductLabel = (product: ProductOutput): string => getLangValue(product.name) || `Produit #${product.id}`;

const getCombinationLabel = (
  combination: CombinationOutput,
  optionGroups: Map<number, ProductOptionOutput>,
  optionValues: Map<number, ProductOptionValueOutput>
): string => {
  const parts = combination.product_option_values
    .map(valueId => {
      const value = optionValues.get(valueId);
      if (!value) return null;

      const group = optionGroups.get(value.id_attribute_group);
      return {
        groupPosition: group?.position ?? 0,
        valuePosition: value.position,
        label: getLangValue(value.name) || `#${value.id}`,
      };
    })
    .filter((part): part is { groupPosition: number; valuePosition: number; label: string } => part !== null)
    .sort((a, b) => {
      if (a.groupPosition !== b.groupPosition) return a.groupPosition - b.groupPosition;
      if (a.valuePosition !== b.valuePosition) return a.valuePosition - b.valuePosition;
      return a.label.localeCompare(b.label, 'fr');
    })
    .map(part => part.label);

  if (parts.length === 0) {
    return `Déclinaison #${combination.id}`;
  }

  return parts.join(' / ');
};

const sumStockAvailableQuantity = (stockAvailables: StockAvailableOutput[]): number =>
  stockAvailables.reduce((total, stockAvailable) => total + (stockAvailable.quantity ?? 0), 0);

const getOrderDetailReservedQuantity = (detail: OrderDetailOutput): number => {
  const ordered = detail.product_quantity ?? 0;
  const refunded = detail.product_quantity_refunded ?? 0;
  const returned = detail.product_quantity_return ?? 0;
  const reinjected = detail.product_quantity_reinjected ?? 0;
  return Math.max(ordered - refunded - returned - reinjected, 0);
};

const isReservedOrderState = (order: OrderOutput, state?: OrderStateOutput): boolean => {
  if (!order.valid) return false;
  if (!state) return true;
  if (state.deleted) return false;
  if (state.delivery || state.shipped) return false;
  return true;
};

const computeDailyRows = (
  movements: StockMovement[],
  currentStock: number
): StockEvolutionRow[] => {
  if (movements.length === 0) {
    return [];
  }

  const dailyMap = new Map<string, { entries: number; exits: number; net: number }>();

  for (const movement of movements) {
    const dateKey = normalizeDateKey(movement.date_add);
    const bucket = dailyMap.get(dateKey) ?? { entries: 0, exits: 0, net: 0 };
    const quantity = movement.physical_quantity ?? 0;
    const isEntry = movement.sign >= 0;

    if (isEntry) {
      bucket.entries += quantity;
    } else {
      bucket.exits += quantity;
    }

    bucket.net += isEntry ? quantity : -quantity;
    dailyMap.set(dateKey, bucket);
  }

  const sortedKeys = Array.from(dailyMap.keys()).sort();
  const dateRange = buildDateRange(sortedKeys[0], sortedKeys[sortedKeys.length - 1]);
  const rowsDesc: StockEvolutionRow[] = [];
  let closingStock = currentStock;

  for (let index = dateRange.length - 1; index >= 0; index -= 1) {
    const dateKey = dateRange[index];
    const bucket = dailyMap.get(dateKey) ?? { entries: 0, exits: 0, net: 0 };
    const stockEnd = closingStock;
    const stockStart = stockEnd - bucket.net;

    rowsDesc.push({
      dateKey,
      dateLabel: formatDateKey(dateKey),
      stockStart,
      entries: bucket.entries,
      exits: bucket.exits,
      stockEnd,
    });

    closingStock = stockStart;
  }

  return rowsDesc.reverse();
};

export function useStockEvolution() {
  const [products, setProducts] = useState<ProductOutput[]>([]);
  const [combinations, setCombinations] = useState<CombinationOutput[]>([]);
  const [productOptions, setProductOptions] = useState<ProductOptionOutput[]>([]);
  const [productOptionValues, setProductOptionValues] = useState<ProductOptionValueOutput[]>([]);
  const [stockAvailables, setStockAvailables] = useState<StockAvailableOutput[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [orders, setOrders] = useState<OrderOutput[]>([]);
  const [orderDetails, setOrderDetails] = useState<OrderDetailOutput[]>([]);
  const [orderStates, setOrderStates] = useState<OrderStateOutput[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [selectedCombinationId, setSelectedCombinationId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const [
          productsResult,
          combinationsResult,
          productOptionsResult,
          productOptionValuesResult,
          stockAvailablesResult,
          movementsResult,
          ordersResult,
          orderDetailsResult,
          orderStatesResult,
        ] = await Promise.all([
          listProducts(),
          listCombinations(),
          listProductOptions(),
          listProductOptionValues(),
          listStockAvailables(),
          listStockMovements(),
          listOrders(),
          listOrderDetails(),
          listOrderStates(),
        ]);

        if (!isActive) {
          return;
        }

        setProducts(productsResult);
        setCombinations(combinationsResult);
        setProductOptions(productOptionsResult);
        setProductOptionValues(productOptionValuesResult);
        setStockAvailables(stockAvailablesResult);
        setMovements(movementsResult);
        setOrders(ordersResult);
        setOrderDetails(orderDetailsResult);
        setOrderStates(orderStatesResult);

        if (productsResult.length > 0) {
          setSelectedProductId(prev => prev ?? productsResult[0].id);
        }
      } catch (err: unknown) {
        if (!isActive) return;
        if (err && typeof err === 'object' && 'message' in err) {
          setError(String((err as { message?: string }).message ?? 'Erreur inconnue'));
        } else {
          setError('Erreur inconnue');
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      isActive = false;
    };
  }, []);

  const productChoices = useMemo<StockProductChoice[]>(() => {
    return products
      .map(product => ({
        id: product.id,
        label: getProductLabel(product),
        product,
      }))
      .sort((a, b) => a.label.localeCompare(b.label, 'fr'));
  }, [products]);

  const selectedProduct = useMemo(
    () => products.find(product => product.id === selectedProductId) ?? null,
    [products, selectedProductId]
  );

  const optionGroupsById = useMemo(() => new Map(productOptions.map(option => [option.id, option])), [productOptions]);
  const optionValuesById = useMemo(() => new Map(productOptionValues.map(value => [value.id, value])), [productOptionValues]);

  const combinationChoices = useMemo<StockCombinationChoice[]>(() => {
    if (!selectedProduct) {
      return [];
    }

    const productCombinations = combinations
      .filter(combination => combination.id_product === selectedProduct.id)
      .map(combination => ({
        id: combination.id,
        label: getCombinationLabel(combination, optionGroupsById, optionValuesById),
      }))
      .sort((a, b) => a.label.localeCompare(b.label, 'fr'));

    return [
      { id: null, label: 'Toutes les déclinaisons' },
      ...productCombinations,
    ];
  }, [combinations, optionGroupsById, optionValuesById, selectedProduct]);

  useEffect(() => {
    if (selectedCombinationId === null) {
      return;
    }

    if (!combinationChoices.some(choice => choice.id === selectedCombinationId)) {
      setSelectedCombinationId(null);
    }
  }, [combinationChoices, selectedCombinationId]);

  const selectedCombination = useMemo(
    () => combinations.find(combination => combination.id === selectedCombinationId) ?? null,
    [combinations, selectedCombinationId]
  );

  const reservedByProductAttribute = useMemo(() => {
    const totals = new Map<string, number>();

    if (orderDetails.length === 0 || orders.length === 0) {
      return totals;
    }

    const orderStateMap = new Map(orderStates.map(state => [state.id, state]));
    const orderMap = new Map(orders.map(order => [order.id, order]));

    for (const detail of orderDetails) {
      const order = orderMap.get(detail.id_order);
      if (!order) continue;

      const state = order.current_state ? orderStateMap.get(order.current_state) : undefined;
      if (!isReservedOrderState(order, state)) continue;

      const productId = detail.product_id ?? 0;
      if (!productId) continue;

      const attributeId = detail.product_attribute_id ?? 0;
      const reservedQty = getOrderDetailReservedQuantity(detail);
      if (reservedQty <= 0) continue;

      const key = `${productId}:${attributeId}`;
      totals.set(key, (totals.get(key) ?? 0) + reservedQty);
    }

    return totals;
  }, [orderDetails, orderStates, orders]);

  const productStockAvailables = useMemo(() => {
    if (!selectedProductId) {
      return [];
    }

    return stockAvailables.filter(stockAvailable => stockAvailable.id_product === selectedProductId);
  }, [stockAvailables, selectedProductId]);

  const hasProductCombinations = useMemo(
    () => productStockAvailables.some(stockAvailable => stockAvailable.id_product_attribute !== 0),
    [productStockAvailables]
  );

  const hasSummaryStockAvailable = useMemo(
    () => productStockAvailables.some(stockAvailable => stockAvailable.id_product_attribute === 0),
    [productStockAvailables]
  );

  const currentStockAvailables = useMemo(() => {
    if (!selectedProductId) {
      return [];
    }

    if (selectedCombinationId !== null) {
      return productStockAvailables.filter(
        stockAvailable => stockAvailable.id_product_attribute === selectedCombinationId
      );
    }

    if (hasProductCombinations && hasSummaryStockAvailable) {
      return productStockAvailables.filter(stockAvailable => stockAvailable.id_product_attribute === 0);
    }

    return productStockAvailables;
  }, [hasProductCombinations, hasSummaryStockAvailable, productStockAvailables, selectedCombinationId, selectedProductId]);

  const movementStockAvailables = useMemo(() => {
    if (!selectedProductId) {
      return [];
    }

    if (selectedCombinationId !== null) {
      return productStockAvailables.filter(
        stockAvailable => stockAvailable.id_product_attribute === selectedCombinationId
      );
    }

    if (hasProductCombinations && hasSummaryStockAvailable) {
      return productStockAvailables.filter(stockAvailable => stockAvailable.id_product_attribute !== 0);
    }

    return productStockAvailables;
  }, [hasProductCombinations, hasSummaryStockAvailable, productStockAvailables, selectedCombinationId, selectedProductId]);

  const reservedQuantity = useMemo(() => {
    if (!selectedProductId) {
      return 0;
    }

    const getReserved = (attributeId: number) =>
      reservedByProductAttribute.get(`${selectedProductId}:${attributeId}`) ?? 0;

    if (selectedCombinationId !== null) {
      return getReserved(selectedCombinationId);
    }

    if (hasProductCombinations) {
      return productStockAvailables
        .filter(stockAvailable => stockAvailable.id_product_attribute !== 0)
        .reduce((total, stockAvailable) => total + getReserved(stockAvailable.id_product_attribute), 0);
    }

    return getReserved(0);
  }, [hasProductCombinations, productStockAvailables, reservedByProductAttribute, selectedCombinationId, selectedProductId]);

  const movementStockAvailableIds = useMemo(
    () => new Set(movementStockAvailables.map(stockAvailable => stockAvailable.id)),
    [movementStockAvailables]
  );

  const selectedMovements = useMemo(() => {
    if (movementStockAvailableIds.size === 0) {
      return [];
    }

    return movements
      .filter(movement => movementStockAvailableIds.has(movement.id_stock))
      .sort((a, b) => {
        if (a.date_add !== b.date_add) return a.date_add.localeCompare(b.date_add);
        return a.id - b.id;
      });
  }, [movements, movementStockAvailableIds]);

  const currentStock = useMemo(() => {
    return sumStockAvailableQuantity(currentStockAvailables) + reservedQuantity;
  }, [currentStockAvailables, reservedQuantity]);

  const dailyRows = useMemo(
    () => computeDailyRows(selectedMovements, currentStock),
    [currentStock, selectedMovements]
  );

  const selectedProductLabel = selectedProduct ? getProductLabel(selectedProduct) : '';
  const selectedCombinationLabel = selectedCombination
    ? getCombinationLabel(selectedCombination, optionGroupsById, optionValuesById)
    : 'Toutes les déclinaisons';

  const summary = useMemo(() => {
    const totalEntries = dailyRows.reduce((total, row) => total + row.entries, 0);
    const totalExits = dailyRows.reduce((total, row) => total + row.exits, 0);

    return {
      totalEntries,
      totalExits,
      movementsCount: selectedMovements.length,
      periodStart: dailyRows[0]?.dateLabel ?? '-',
      periodEnd: dailyRows[dailyRows.length - 1]?.dateLabel ?? '-',
    };
  }, [dailyRows, selectedMovements.length]);

  return {
    loading,
    error,
    productChoices,
    combinationChoices,
    selectedProductId,
    selectedCombinationId,
    setSelectedProductId,
    setSelectedCombinationId,
    selectedProduct,
    selectedProductLabel,
    selectedCombinationLabel,
    currentStock,
    dailyRows,
    summary,
  };
}