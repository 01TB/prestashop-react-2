import { useEffect, useMemo, useState } from 'react';
import { createStockMovement, listStockMovements } from '../../../resources/stock_movements/stock_movements.service';
import { listStockMovementReasons } from '../../../resources/stock_movement_reasons/stock_movement_reasons.service';
import { listProducts } from '../../../resources/products/products.service';
import { listCombinations } from '../../../resources/combinations/combinations.service';
import { listProductOptions } from '../../../resources/product_options/product_options.service';
import { listProductOptionValues } from '../../../resources/product_option_values/product_option_values.service';
import { listStockAvailables, updateStockAvailable } from '../../../resources/stock_availables/stock_availables.service';
import { listOrders } from '../../../resources/orders/orders.service';
import { listOrderDetails } from '../../../resources/order_details/order_details.service';
import { listOrderStates } from '../../../resources/order_states/order_states.service';
import type { ProductOutput } from '../../../resources/products/products.types';
import type { CombinationOutput } from '../../../resources/combinations/combinations.types';
import type { ProductOptionOutput } from '../../../resources/product_options/product_options.types';
import type { ProductOptionValueOutput } from '../../../resources/product_option_values/product_option_values.types';
import type { StockMovement, StockMovementCreateInput } from '../../../resources/stock_movements/stock_movements.types';
import type { StockMovementReasonOutput } from '../../../resources/stock_movement_reasons/stock_movement_reasons.types';
import type { StockAvailableOutput } from '../../../resources/stock_availables/stock_availables.types';
import type { OrderOutput } from '../../../resources/orders/orders.types';
import type { OrderDetailOutput } from '../../../resources/order_details/order_details.types';
import type { OrderStateOutput } from '../../../resources/order_states/order_states.types';
import { parseDateToStringWithHour } from '../../../utils/date-utils';

export interface StockProductChoice {
  id: number;
  label: string;
  product: ProductOutput;
}

export interface StockCombinationChoice {
  id: number | null;
  label: string;
}

const getLangValue = (map: Record<number, string> | undefined, preferred = 1): string =>
  map?.[preferred] ?? Object.values(map ?? {})[0] ?? '';

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

  return parts.length > 0 ? parts.join(' / ') : `Déclinaison #${combination.id}`;
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

const getSelectedStockAvailable = (
  stockAvailables: StockAvailableOutput[],
  productId: number | null,
  combinationId: number | null
): StockAvailableOutput | null => {
  if (!productId) return null;

  return stockAvailables.find(stockAvailable => {
    if (stockAvailable.id_product !== productId) return false;
    const stockAttributeId = stockAvailable.id_product_attribute ?? 0;
    const targetAttributeId = combinationId ?? 0;
    return stockAttributeId === targetAttributeId;
  }) ?? null;
};

export function useAddStock() {
  const [products, setProducts] = useState<ProductOutput[]>([]);
  const [combinations, setCombinations] = useState<CombinationOutput[]>([]);
  const [productOptions, setProductOptions] = useState<ProductOptionOutput[]>([]);
  const [productOptionValues, setProductOptionValues] = useState<ProductOptionValueOutput[]>([]);
  const [stockAvailables, setStockAvailables] = useState<StockAvailableOutput[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [reasons, setReasons] = useState<StockMovementReasonOutput[]>([]);
  const [orders, setOrders] = useState<OrderOutput[]>([]);
  const [orderDetails, setOrderDetails] = useState<OrderDetailOutput[]>([]);
  const [orderStates, setOrderStates] = useState<OrderStateOutput[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [selectedCombinationId, setSelectedCombinationId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState<string>('1');
  const [reasonId, setReasonId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
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
          reasonsResult,
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
          listStockMovementReasons(),
          listOrders(),
          listOrderDetails(),
          listOrderStates(),
        ]);

        if (!isActive) return;

        setProducts(productsResult);
        setCombinations(combinationsResult);
        setProductOptions(productOptionsResult);
        setProductOptionValues(productOptionValuesResult);
        setStockAvailables(stockAvailablesResult);
        setMovements(movementsResult);
        setOrders(ordersResult);
        setOrderDetails(orderDetailsResult);
        setOrderStates(orderStatesResult);

        const positiveReasons = reasonsResult.filter(reason => reason.sign > 0 && !reason.deleted);
        setReasons(positiveReasons.length > 0 ? positiveReasons : reasonsResult.filter(reason => !reason.deleted));

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
        if (isActive) setLoading(false);
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
    if (!selectedProduct) return [];

    const productCombinations = combinations
      .filter(combination => combination.id_product === selectedProduct.id)
      .map(combination => ({
        id: combination.id,
        label: getCombinationLabel(combination, optionGroupsById, optionValuesById),
      }))
      .sort((a, b) => a.label.localeCompare(b.label, 'fr'));

    return [
      { id: null, label: 'Produit général' },
      ...productCombinations,
    ];
  }, [combinations, optionGroupsById, optionValuesById, selectedProduct]);

  useEffect(() => {
    if (selectedCombinationId === null) return;
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
    if (!selectedProductId) return [];
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

  const movementStockAvailableIds = useMemo(
    () => new Set(movementStockAvailables.map(stockAvailable => stockAvailable.id)),
    [movementStockAvailables]
  );

  const selectedStock = useMemo(
    () => getSelectedStockAvailable(stockAvailables, selectedProductId, selectedCombinationId),
    [selectedCombinationId, selectedProductId, stockAvailables]
  );

  const selectedMovements = useMemo(() => {
    return movements
      .filter(movement => movementStockAvailableIds.has(movement.id_stock))
      .sort((a, b) => {
        if (a.date_add !== b.date_add) return a.date_add.localeCompare(b.date_add);
        return a.id - b.id;
      });
  }, [movements, movementStockAvailableIds]);

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

  const currentStock = sumStockAvailableQuantity(currentStockAvailables) + reservedQuantity;
  const selectedProductLabel = selectedProduct ? getProductLabel(selectedProduct) : '';
  const selectedCombinationLabel = selectedCombination
    ? getCombinationLabel(selectedCombination, optionGroupsById, optionValuesById)
    : 'Produit général';

  const lastMovement = selectedMovements[selectedMovements.length - 1] ?? null;

  const canSubmit = Boolean(selectedProduct && selectedStock && reasonId && Number(quantity) > 0 && !submitting);

  const increaseStock = async () => {
    if (!selectedProduct || !selectedStock) {
      setError('Sélectionnez un produit disposant déjà d un stock.');
      return;
    }

    const parsedQuantity = Number(quantity);
    if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
      setError('La quantité doit être supérieure à 0.');
      return;
    }

    if (!reasonId) {
      setError('Aucun motif de stock positif disponible.');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const nextAvailableQuantity = selectedStock.quantity + parsedQuantity;
      const movementPriceTe = selectedProduct.wholesale_price > 0
        ? selectedProduct.wholesale_price
        : selectedProduct.price;

      await createStockMovement({
        id_employee: 1,
        id_stock: selectedStock.id,
        id_stock_mvt_reason: reasonId,
        physical_quantity: parsedQuantity,
        sign: 1,
        price_te: movementPriceTe,
        date_add: parseDateToStringWithHour(new Date()),
        id_product: selectedStock.id_product,
        id_product_attribute: selectedStock.id_product_attribute,
        reference: selectedProduct.reference,
        ean13: selectedProduct.ean13,
        upc: selectedProduct.upc,
        mpn: selectedProduct.mpn,
      } as StockMovementCreateInput);

      const stockAvailablesForProduct = await listStockAvailables({
        'filter[id_product]': `[${selectedStock.id_product}]`,
      });

      const updatedStockAvailables = stockAvailablesForProduct.map(stockAvailable => (
        stockAvailable.id === selectedStock.id
          ? { ...stockAvailable, quantity: nextAvailableQuantity }
          : stockAvailable
      ));

      await updateStockAvailable(selectedStock.id, {
        quantity: nextAvailableQuantity,
      });

      const summaryStockAvailable = updatedStockAvailables.find(
        stockAvailable => stockAvailable.id_product_attribute === 0
      );
      const hasCombinations = updatedStockAvailables.some(
        stockAvailable => stockAvailable.id_product_attribute !== 0
      );

      if (selectedStock.id_product_attribute !== 0 && summaryStockAvailable && hasCombinations) {
        const combinationsTotal = updatedStockAvailables
          .filter(stockAvailable => stockAvailable.id_product_attribute !== 0)
          .reduce((total, stockAvailable) => total + (stockAvailable.quantity ?? 0), 0);

        if (summaryStockAvailable.quantity !== combinationsTotal) {
          await updateStockAvailable(summaryStockAvailable.id, {
            quantity: combinationsTotal,
          });
          summaryStockAvailable.quantity = combinationsTotal;
        }
      }

      const updatedById = new Map(updatedStockAvailables.map(stockAvailable => [stockAvailable.id, stockAvailable]));
      setStockAvailables(prev => prev.map(stockAvailable => updatedById.get(stockAvailable.id) ?? stockAvailable));

      const newMovementId = Date.now();
      setMovements(prev => [
        ...prev,
        {
          id: newMovementId,
          id_product: selectedStock.id_product,
          id_product_attribute: selectedStock.id_product_attribute,
          id_warehouse: undefined,
          id_currency: undefined,
          management_type: undefined,
          id_employee: 1,
          id_stock: selectedStock.id,
          id_stock_mvt_reason: reasonId,
          id_order: undefined,
          id_supply_order: undefined,
          product_name: selectedProduct.name,
          ean13: selectedProduct.ean13,
          upc: selectedProduct.upc,
          reference: selectedProduct.reference,
          mpn: selectedProduct.mpn,
          physical_quantity: parsedQuantity,
          sign: 1,
          last_wa: undefined,
          current_wa: undefined,
          price_te: movementPriceTe,
          date_add: parseDateToStringWithHour(new Date()),
        },
      ]);

      setSuccess(`Stock augmenté de ${parsedQuantity} unité(s).`);
      setQuantity('1');
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'message' in err) {
        setError(String((err as { message?: string }).message ?? 'Erreur inconnue'));
      } else {
        setError('Erreur inconnue');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const reasonLabel = reasons.find(reason => reason.id === reasonId)
    ? getLangValue(reasons.find(reason => reason.id === reasonId)?.name)
    : '';

  useEffect(() => {
    if (reasonId !== null) return;
    if (reasons.length > 0) {
      setReasonId(reasons[0].id);
    }
  }, [reasonId, reasons]);

  return {
    loading,
    submitting,
    error,
    success,
    productChoices,
    combinationChoices,
    reasons,
    selectedProductId,
    selectedCombinationId,
    selectedProductLabel,
    selectedCombinationLabel,
    selectedStock,
    selectedMovements,
    currentStock,
    lastMovement,
    quantity,
    reasonId,
    reasonLabel,
    canSubmit,
    setSelectedProductId,
    setSelectedCombinationId,
    setQuantity,
    setReasonId,
    increaseStock,
  };
}