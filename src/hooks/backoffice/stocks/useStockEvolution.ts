import { useEffect, useMemo, useState } from 'react';
import { listProducts } from '../../../resources/products/products.service';
import { listCombinations } from '../../../resources/combinations/combinations.service';
import { listProductOptions } from '../../../resources/product_options/product_options.service';
import { listProductOptionValues } from '../../../resources/product_option_values/product_option_values.service';
import { listStocks } from '../../../resources/stocks/stocks.service';
import { listStockMovements } from '../../../resources/stock_movements/stock_movements.service';
import type { ProductOutput } from '../../../resources/products/products.types';
import type { CombinationOutput } from '../../../resources/combinations/combinations.types';
import type { ProductOptionOutput } from '../../../resources/product_options/product_options.types';
import type { ProductOptionValueOutput } from '../../../resources/product_option_values/product_option_values.types';
import type { StockMovement } from '../../../resources/stock_movements/stock_movements.types';
import type { StockOutput } from '../../../resources/stocks/stocks.types';

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

const sumStockQuantity = (stocks: StockOutput[]): number =>
  stocks.reduce((total, stock) => total + (stock.real_quantity ?? stock.physical_quantity ?? 0), 0);

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
  const [stocks, setStocks] = useState<StockOutput[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
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
        const [productsResult, combinationsResult, productOptionsResult, productOptionValuesResult, stocksResult, movementsResult] = await Promise.all([
          listProducts(),
          listCombinations(),
          listProductOptions(),
          listProductOptionValues(),
          listStocks(),
          listStockMovements(),
        ]);

        if (!isActive) {
          return;
        }

        setProducts(productsResult);
        setCombinations(combinationsResult);
        setProductOptions(productOptionsResult);
        setProductOptionValues(productOptionValuesResult);
        setStocks(stocksResult);
        setMovements(movementsResult);

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

  const selectedMovements = useMemo(() => {
    if (!selectedProductId) {
      return [];
    }

    return movements
      .filter(movement => movement.id_product === selectedProductId)
      .filter(movement => {
        if (selectedCombinationId === null) {
          return true;
        }

        return (movement.id_product_attribute ?? 0) === selectedCombinationId;
      })
      .sort((a, b) => {
        if (a.date_add !== b.date_add) return a.date_add.localeCompare(b.date_add);
        return a.id - b.id;
      });
  }, [movements, selectedCombinationId, selectedProductId]);

  const currentStock = useMemo(() => {
    if (!selectedProductId) {
      return 0;
    }

    const filteredStocks = stocks
      .filter(stock => stock.id_product === selectedProductId)
      .filter(stock => {
        if (selectedCombinationId === null) {
          return true;
        }

        return stock.id_product_attribute === selectedCombinationId;
      });

    return sumStockQuantity(filteredStocks);
  }, [stocks, selectedCombinationId, selectedProductId]);

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