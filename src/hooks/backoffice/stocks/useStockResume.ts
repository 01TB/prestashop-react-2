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
import { listCategories } from '../../../resources/categories/categories.service';
import type { ProductOutput } from '../../../resources/products/products.types';
import type { CombinationOutput } from '../../../resources/combinations/combinations.types';
import type { ProductOptionOutput } from '../../../resources/product_options/product_options.types';
import type { ProductOptionValueOutput } from '../../../resources/product_option_values/product_option_values.types';
import type { StockAvailableOutput } from '../../../resources/stock_availables/stock_availables.types';
import type { StockMovement } from '../../../resources/stock_movements/stock_movements.types';
import type { OrderOutput } from '../../../resources/orders/orders.types';
import type { OrderDetailOutput } from '../../../resources/order_details/order_details.types';
import type { OrderStateOutput } from '../../../resources/order_states/order_states.types';
import type { CategoryOutput } from '../../../resources/categories/categories.types';

export interface CategoryStockSummary {
  id: number;
  label: string;
  physicalQuantity: number;
  reservedQuantity: number;
  availableQuantity: number;
}

const getLangValue = (map: Record<number, string> | undefined, preferred = 1): string =>
  map?.[preferred] ?? Object.values(map ?? {})[0] ?? '';

const getCategoryLabel = (category: CategoryOutput | undefined): string => {
  if (!category) return 'Categorie inconnue';
  return getLangValue(category.name) || `Categorie #${category.id}`;
};

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

export function useStockResume() {
  const [products, setProducts] = useState<ProductOutput[]>([]);
  const [combinations, setCombinations] = useState<CombinationOutput[]>([]);
  const [productOptions, setProductOptions] = useState<ProductOptionOutput[]>([]);
  const [productOptionValues, setProductOptionValues] = useState<ProductOptionValueOutput[]>([]);
  const [stockAvailables, setStockAvailables] = useState<StockAvailableOutput[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [orders, setOrders] = useState<OrderOutput[]>([]);
  const [orderDetails, setOrderDetails] = useState<OrderDetailOutput[]>([]);
  const [orderStates, setOrderStates] = useState<OrderStateOutput[]>([]);
  const [categories, setCategories] = useState<CategoryOutput[]>([]);
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
          categoriesResult,
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
          listCategories(),
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
        setCategories(categoriesResult);
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

  const categoryById = useMemo(
    () => new Map(categories.map(category => [category.id, category])),
    [categories]
  );

  const optionGroupsById = useMemo(
    () => new Map(productOptions.map(option => [option.id, option])),
    [productOptions]
  );

  const optionValuesById = useMemo(
    () => new Map(productOptionValues.map(value => [value.id, value])),
    [productOptionValues]
  );

  const productHasCombinations = useMemo(() => {
    const map = new Map<number, boolean>();

    for (const combination of combinations) {
      const productId = combination.id_product;
      const hasValidValue = combination.product_option_values.some(valueId => {
        const value = optionValuesById.get(valueId);
        return value ? optionGroupsById.has(value.id_attribute_group) : false;
      });

      if (hasValidValue) {
        map.set(productId, true);
      }
    }

    return map;
  }, [combinations, optionGroupsById, optionValuesById]);

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

  const movementTotalsByStockId = useMemo(() => {
    const totals = new Map<number, number>();

    for (const movement of movements) {
      const quantity = movement.physical_quantity ?? 0;
      const signed = movement.sign >= 0 ? quantity : -quantity;
      totals.set(movement.id_stock, (totals.get(movement.id_stock) ?? 0) + signed);
    }

    return totals;
  }, [movements]);

  const summaries = useMemo<CategoryStockSummary[]>(() => {
    const totalsByCategory = new Map<number, { physical: number; reserved: number; available: number }>();

    const addToCategory = (categoryId: number, physical: number, reserved: number, available: number) => {
      const current = totalsByCategory.get(categoryId) ?? { physical: 0, reserved: 0, available: 0 };
      totalsByCategory.set(categoryId, {
        physical: current.physical + physical,
        reserved: current.reserved + reserved,
        available: current.available + available,
      });
    };

    const getReserved = (productId: number, attributeId: number) =>
      reservedByProductAttribute.get(`${productId}:${attributeId}`) ?? 0;

    for (const product of products) {
      const productStockAvailables = stockAvailables.filter(stock => stock.id_product === product.id);
      if (productStockAvailables.length === 0) continue;

      const hasStockCombinations = productStockAvailables.some(stock => stock.id_product_attribute !== 0);
      const hasSummaryLine = productStockAvailables.some(stock => stock.id_product_attribute === 0);
      const hasCombinations = hasStockCombinations || (productHasCombinations.get(product.id) ?? false);

      const summaryLine = productStockAvailables.find(stock => stock.id_product_attribute === 0);
      const combinationLines = productStockAvailables.filter(stock => stock.id_product_attribute !== 0);
      const hasCombinationLines = combinationLines.length > 0;

      const computePhysical = (stock: StockAvailableOutput) => {
        const movementTotal = movementTotalsByStockId.get(stock.id);
        if (movementTotal !== undefined) return movementTotal;
        return (stock.quantity ?? 0) + getReserved(product.id, stock.id_product_attribute);
      };

      let availableQuantity = 0;
      let reservedQuantity = 0;
      let physicalQuantity = 0;

      if (hasCombinationLines && hasSummaryLine) {
        availableQuantity = summaryLine?.quantity ?? 0;
        reservedQuantity = combinationLines.reduce(
          (total, stock) => total + getReserved(product.id, stock.id_product_attribute),
          0
        );
        physicalQuantity = combinationLines.reduce((total, stock) => total + computePhysical(stock), 0);
      } else if (hasCombinationLines) {
        availableQuantity = combinationLines.reduce((total, stock) => total + (stock.quantity ?? 0), 0);
        reservedQuantity = combinationLines.reduce(
          (total, stock) => total + getReserved(product.id, stock.id_product_attribute),
          0
        );
        physicalQuantity = combinationLines.reduce((total, stock) => total + computePhysical(stock), 0);
      } else if (hasCombinations && summaryLine) {
        availableQuantity = summaryLine.quantity ?? 0;
        reservedQuantity = getReserved(product.id, 0);
        physicalQuantity = computePhysical(summaryLine);
      } else {
        availableQuantity = productStockAvailables.reduce((total, stock) => total + (stock.quantity ?? 0), 0);
        reservedQuantity = productStockAvailables.reduce(
          (total, stock) => total + getReserved(product.id, stock.id_product_attribute),
          0
        );
        physicalQuantity = productStockAvailables.reduce((total, stock) => total + computePhysical(stock), 0);
      }

      const categoryId = product.id_category_default || product.categories[0] || 0;
      addToCategory(categoryId, physicalQuantity, reservedQuantity, availableQuantity);
    }

    return Array.from(totalsByCategory.entries())
      .map(([categoryId, totals]) => ({
        id: categoryId,
        label: getCategoryLabel(categoryById.get(categoryId)),
        physicalQuantity: totals.physical,
        reservedQuantity: totals.reserved,
        availableQuantity: totals.available,
      }))
      .sort((a, b) => a.label.localeCompare(b.label, 'fr'));
  }, [categoryById, movementTotalsByStockId, productHasCombinations, products, reservedByProductAttribute, stockAvailables]);

  const totals = useMemo(() => {
    return summaries.reduce(
      (acc, item) => ({
        physicalQuantity: acc.physicalQuantity + item.physicalQuantity,
        reservedQuantity: acc.reservedQuantity + item.reservedQuantity,
        availableQuantity: acc.availableQuantity + item.availableQuantity,
      }),
      { physicalQuantity: 0, reservedQuantity: 0, availableQuantity: 0 }
    );
  }, [summaries]);

  return {
    loading,
    error,
    summaries,
    totals,
  };
}
