import { useEffect, useMemo, useState } from 'react';
import { createStockMovement, listStockMovements } from '../../../resources/stock_movements/stock_movements.service';
import { listStockMovementReasons } from '../../../resources/stock_movement_reasons/stock_movement_reasons.service';
import { listProducts } from '../../../resources/products/products.service';
import { listCombinations } from '../../../resources/combinations/combinations.service';
import { listProductOptions } from '../../../resources/product_options/product_options.service';
import { listProductOptionValues } from '../../../resources/product_option_values/product_option_values.service';
import { listStocks, updateStock } from '../../../resources/stocks/stocks.service';
import type { ProductOutput } from '../../../resources/products/products.types';
import type { CombinationOutput } from '../../../resources/combinations/combinations.types';
import type { ProductOptionOutput } from '../../../resources/product_options/product_options.types';
import type { ProductOptionValueOutput } from '../../../resources/product_option_values/product_option_values.types';
import type { StockMovement, StockMovementCreateInput } from '../../../resources/stock_movements/stock_movements.types';
import type { StockMovementReasonOutput } from '../../../resources/stock_movement_reasons/stock_movement_reasons.types';
import type { StockOutput } from '../../../resources/stocks/stocks.types';
import { parseDateToStringWithHour } from '../../../utils/date-utils';
import {listStockAvailables, updateStockAvailable} from "../../../resources/stock_availables/stock_availables.service.ts";

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

const getSelectedStock = (
  stocks: StockOutput[],
  productId: number | null,
  combinationId: number | null
): StockOutput | null => {
  if (!productId) return null;

  return stocks.find(stock => {
    if (stock.id_product !== productId) return false;
    const stockAttributeId = stock.id_product_attribute ?? 0;
    const targetAttributeId = combinationId ?? 0;
    return stockAttributeId === targetAttributeId;
  }) ?? null;
};

export function useAddStock() {
  const [products, setProducts] = useState<ProductOutput[]>([]);
  const [combinations, setCombinations] = useState<CombinationOutput[]>([]);
  const [productOptions, setProductOptions] = useState<ProductOptionOutput[]>([]);
  const [productOptionValues, setProductOptionValues] = useState<ProductOptionValueOutput[]>([]);
  const [stocks, setStocks] = useState<StockOutput[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [reasons, setReasons] = useState<StockMovementReasonOutput[]>([]);
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
        const [productsResult, combinationsResult, productOptionsResult, productOptionValuesResult, stocksResult, movementsResult, reasonsResult] = await Promise.all([
          listProducts(),
          listCombinations(),
          listProductOptions(),
          listProductOptionValues(),
          listStocks(),
          listStockMovements(),
          listStockMovementReasons(),
        ]);

        if (!isActive) return;

        setProducts(productsResult);
        setCombinations(combinationsResult);
        setProductOptions(productOptionsResult);
        setProductOptionValues(productOptionValuesResult);
        setStocks(stocksResult);
        setMovements(movementsResult);

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

  const selectedStock = useMemo(
    () => getSelectedStock(stocks, selectedProductId, selectedCombinationId),
    [selectedCombinationId, selectedProductId, stocks]
  );

  const selectedMovements = useMemo(() => {
    if (!selectedProductId) return [];

    return movements
      .filter(movement => movement.id_product === selectedProductId)
      .filter(movement => {
        if (selectedCombinationId === null) return true;
        return (movement.id_product_attribute ?? 0) === selectedCombinationId;
      })
      .sort((a, b) => {
        if (a.date_add !== b.date_add) return a.date_add.localeCompare(b.date_add);
        return a.id - b.id;
      });
  }, [movements, selectedCombinationId, selectedProductId]);

  const currentStock = selectedStock?.physical_quantity ?? 0;
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
      const nextPhysicalQuantity = selectedStock.physical_quantity + parsedQuantity;
      const nextUsableQuantity = selectedStock.usable_quantity + parsedQuantity;

      await createStockMovement({
        id_employee: 1,
        id_stock: selectedStock.id,
        id_stock_mvt_reason: reasonId,
        physical_quantity: parsedQuantity,
        sign: 1,
        price_te: selectedStock.price_te,
        date_add: parseDateToStringWithHour(new Date()),
        id_product: selectedStock.id_product,
        id_product_attribute: selectedStock.id_product_attribute,
        id_warehouse: selectedStock.id_warehouse,
        reference: selectedStock.reference || selectedProduct.reference,
        ean13: selectedStock.ean13 || selectedProduct.ean13,
        upc: selectedStock.upc || selectedProduct.upc,
        mpn: selectedStock.mpn || selectedProduct.mpn,
      } as StockMovementCreateInput);

      const stockAvailables = await listStockAvailables({
          'filter[id_product]': '['+ String(selectedStock.id_product) +']',
          'filter[id_product_attribute]': '['+ String(selectedStock.id_product_attribute) +']',
      });

      await updateStockAvailable(stockAvailables[0].id, {
            quantity: nextPhysicalQuantity,
      });

      await updateStock(selectedStock.id, {
        physical_quantity: nextPhysicalQuantity,
        usable_quantity: nextUsableQuantity,
      });

      setStocks(prev => prev.map(stock => (
        stock.id === selectedStock.id
          ? {
              ...stock,
              physical_quantity: nextPhysicalQuantity,
              usable_quantity: nextUsableQuantity,
              real_quantity: nextPhysicalQuantity,
            }
          : stock
      )));

      const newMovementId = Date.now();
      setMovements(prev => [
        ...prev,
        {
          id: newMovementId,
          id_product: selectedStock.id_product,
          id_product_attribute: selectedStock.id_product_attribute,
          id_warehouse: selectedStock.id_warehouse,
          id_currency: undefined,
          management_type: undefined,
          id_employee: 1,
          id_stock: selectedStock.id,
          id_stock_mvt_reason: reasonId,
          id_order: undefined,
          id_supply_order: undefined,
          product_name: selectedProduct.name,
          ean13: selectedStock.ean13 || selectedProduct.ean13,
          upc: selectedStock.upc || selectedProduct.upc,
          reference: selectedStock.reference || selectedProduct.reference,
          mpn: selectedStock.mpn || selectedProduct.mpn,
          physical_quantity: parsedQuantity,
          sign: 1,
          last_wa: undefined,
          current_wa: undefined,
          price_te: selectedStock.price_te,
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