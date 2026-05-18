import { useEffect, useMemo, useState } from 'react';
import { listOrders } from '../../../resources/orders/orders.service';
import { listProducts } from '../../../resources/products/products.service';
import { listCategories } from '../../../resources/categories/categories.service';
import { listStockMovements } from '../../../resources/stock_movements/stock_movements.service';
import { listStockAvailables } from '../../../resources/stock_availables/stock_availables.service';
import type { OrderOutput } from '../../../resources/orders/orders.types';
import type { ProductOutput } from '../../../resources/products/products.types';
import type { CategoryOutput } from '../../../resources/categories/categories.types';
import type { StockMovement } from '../../../resources/stock_movements/stock_movements.types';
import type { StockAvailableOutput } from '../../../resources/stock_availables/stock_availables.types';

export interface CategoryProfitRow {
  id: number;
  label: string;
  salesHt: number;
  purchasesHt: number;
  profitHt: number;
}

const getLangValue = (map: Record<number, string> | undefined, preferred = 1): string =>
  map?.[preferred] ?? Object.values(map ?? {})[0] ?? '';

const getCategoryLabel = (category: CategoryOutput | undefined): string => {
  if (!category) return 'Categorie inconnue';
  return getLangValue(category.name) || `Categorie #${category.id}`;
};

const resolveMovementProductId = (
  movement: StockMovement,
  stockById: Map<number, StockAvailableOutput>
): number => {
  if (movement.id_product && movement.id_product > 0) return movement.id_product;
  const stock = stockById.get(movement.id_stock);
  return stock?.id_product ?? 0;
};

export function useSalesStats() {
  const [orders, setOrders] = useState<OrderOutput[]>([]);
  const [products, setProducts] = useState<ProductOutput[]>([]);
  const [categories, setCategories] = useState<CategoryOutput[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [stockAvailables, setStockAvailables] = useState<StockAvailableOutput[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const [
          ordersResult,
          productsResult,
          categoriesResult,
          movementsResult,
          stockAvailablesResult,
        ] = await Promise.all([
          listOrders({
            'filter[current_state]': '![6]',
          }),
          listProducts(),
          listCategories({ display: '[id,name]' }),
          listStockMovements(),
          listStockAvailables(),
        ]);

        if (!isActive) return;

        setOrders(ordersResult);
        setProducts(productsResult);
        setCategories(categoriesResult);
        setMovements(movementsResult);
        setStockAvailables(stockAvailablesResult);
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

  const stockById = useMemo(
    () => new Map(stockAvailables.map(stock => [stock.id, stock])),
    [stockAvailables]
  );

  const productById = useMemo(
    () => new Map(products.map(product => [product.id, product])),
    [products]
  );

  const salesByProduct = useMemo(() => {
    const totals = new Map<number, number>();

    for (const order of orders) {
      for (const row of order.order_rows ?? []) {
        const productId = row.product_id ?? 0;
        if (!productId) continue;
        const quantity = row.product_quantity ?? 0;
        const unitPrice = row.unit_price_tax_excl ?? 0;
        totals.set(productId, (totals.get(productId) ?? 0) + unitPrice * quantity);
      }
    }

    return totals;
  }, [orders]);

  const purchasesByProduct = useMemo(() => {
    const totals = new Map<number, number>();

    for (const movement of movements) {
      if ((movement.sign ?? 0) < 0) continue;
      const quantity = movement.physical_quantity ?? 0;
      if (quantity <= 0) continue;

      const productId = resolveMovementProductId(movement, stockById);
      if (!productId) continue;

      const product = productById.get(productId);
      const unitPrice = product?.wholesale_price ?? 0;
      totals.set(productId, (totals.get(productId) ?? 0) + unitPrice * quantity);
    }

    return totals;
  }, [movements, productById, stockById]);

  const totalSalesHt = useMemo(
    () => orders.reduce((sum, order) => sum + (order.total_paid_tax_excl ?? 0), 0),
    [orders]
  );

  const totalPurchasesHt = useMemo(() => {
    let total = 0;
    purchasesByProduct.forEach(value => {
      total += value;
    });
    return total;
  }, [purchasesByProduct]);

  const totalProfitHt = useMemo(() => totalSalesHt - totalPurchasesHt, [totalSalesHt, totalPurchasesHt]);

  const categoryRows = useMemo<CategoryProfitRow[]>(() => {
    const totalsByCategory = new Map<number, { salesHt: number; purchasesHt: number }>();

    for (const product of products) {
      const categoryId = product.id_category_default ?? 0;
      const sales = salesByProduct.get(product.id) ?? 0;
      const purchases = purchasesByProduct.get(product.id) ?? 0;

      const current = totalsByCategory.get(categoryId) ?? { salesHt: 0, purchasesHt: 0 };
      totalsByCategory.set(categoryId, {
        salesHt: current.salesHt + sales,
        purchasesHt: current.purchasesHt + purchases,
      });
    }

    return Array.from(totalsByCategory.entries())
      .map(([categoryId, totals]) => {
        const label = categoryId === 0 ? 'Sans categorie' : getCategoryLabel(categoryById.get(categoryId));
        const profit = totals.salesHt - totals.purchasesHt;
        return {
          id: categoryId,
          label,
          salesHt: totals.salesHt,
          purchasesHt: totals.purchasesHt,
          profitHt: profit,
        };
      })
      .sort((a, b) => b.profitHt - a.profitHt);
  }, [products, salesByProduct, purchasesByProduct, categoryById]);

  return {
    loading,
    error,
    totalSalesHt,
    totalPurchasesHt,
    totalProfitHt,
    categoryRows,
  };
}
