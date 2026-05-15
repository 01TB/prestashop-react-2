import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProduct, getProductMyPrice } from '../../../resources/products/products.service';
import { listCombinations } from '../../../resources/combinations/combinations.service';
import { listProductOptionValues } from '../../../resources/product_option_values/product_option_values.service';
import { listProductOptions } from '../../../resources/product_options/product_options.service';
import type { ProductOutput } from '../../../resources/products/products.types';
import type { CombinationOutput } from '../../../resources/combinations/combinations.types';
import type { ProductOptionValueOutput } from '../../../resources/product_option_values/product_option_values.types';
import type { ProductOptionOutput } from '../../../resources/product_options/product_options.types';
import type { TaxOutput } from '../../../resources/taxes/taxes.types';
import { listTaxRules } from '../../../resources/tax_rules/tax_rules.service';
import type { TaxRuleOutput } from '../../../resources/tax_rules/tax_rules.types';
import { getTax } from '../../../resources/taxes/taxes.service';
import { addToCart } from '../../../services/frontoffice/carts/cartService.ts';
import {listStockAvailables} from "../../../resources/stock_availables/stock_availables.service.ts";

export interface UseProductDetailsResult {
  product: ProductOutput | null;
  productQuantity: number;
  tax: TaxOutput | null;
  combinations: CombinationOutput[];
  optionValues: ProductOptionValueOutput[];
  optionGroups: ProductOptionOutput[];
  selectedValues: Record<number, number>;
  quantity: number;
  loading: boolean;
  adding: boolean;
  error: string | null;
  setSelectedValues: (values: Record<number, number>) => void;
  setQuantity: (quantity: number) => void;
  unitPriceHt: number;
  unitPriceTtc: number;
  releaseBadge: 'HOT' | 'NEW' | null;
  imageId: number;
  imageUrl: string | null;
  selectedCombination: CombinationOutput | undefined;
  missingSelection: boolean;
  optionValuesByGroup: Record<number, ProductOptionValueOutput[]>;
  handleSelectChange: (groupId: number, valueId: number) => void;
  handleAddToCart: () => Promise<void>;
}

const buildIdFilter = (values: number[]): string => `[${values.join('|')}]`;

const getReleaseBadge = (availableDate: string): 'HOT' | 'NEW' | null => {
  if (!availableDate || availableDate === '0000-00-00') return null;

  const parsed = new Date(`${availableDate}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffMs = today.getTime() - parsed.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 1) return 'HOT';
  if (diffDays >= 2 && diffDays <= 7) return 'NEW';
  return null;
};

export function useProductDetails(
  productId: string | undefined,
  customerId?: number,
  secureKey?: string
): UseProductDetailsResult {
  const navigate = useNavigate();

  const [product, setProduct] = useState<ProductOutput | null>(null);
  const [productQuantity, setProductQuantity] = useState(0);
  const [tax, setTax] = useState<TaxOutput | null>(null);
  const [combinations, setCombinations] = useState<CombinationOutput[]>([]);
  const [optionValues, setOptionValues] = useState<ProductOptionValueOutput[]>([]);
  const [optionGroups, setOptionGroups] = useState<ProductOptionOutput[]>([]);
  const [selectedValues, setSelectedValues] = useState<Record<number, number>>({});
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unitPriceHt, setUnitPriceHt] = useState(0);
  const [unitPriceTtc, setUnitPriceTtc] = useState(0);

  useEffect(() => {
    let isActive = true;

    const load = async () => {
      const parsedId = parseInt(productId ?? '', 10);
      if (!parsedId) {
        setError('Produit invalide.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const [productData] = await Promise.all([getProduct(parsedId)]);
        if (!isActive) return;
        setProduct(productData);

        let selectedTaxRule: TaxRuleOutput | null = null;
        if (productData.id_tax_rules_group > 0) {
          const taxRules = await listTaxRules({
            'filter[id_tax_rules_group]': `[${productData.id_tax_rules_group}]`,
            'filter[id_country]': '8',
            display: 'full',
          });

          selectedTaxRule = taxRules[0] ?? null;
        }
        if (selectedTaxRule?.id_tax) {
          setTax(await getTax(selectedTaxRule.id_tax));
        } else {
          setTax(null);
        }
        if (!isActive) return;

        const combinationList = await listCombinations({
          'filter[id_product]': `[${parsedId}]`,
        });
        if (!isActive) return;
        setCombinations(combinationList);

        const optionValueIds = Array.from(new Set(
          combinationList.flatMap(combination => combination.product_option_values)
        ));

        const optionValueList = optionValueIds.length
          ? await listProductOptionValues({
              'filter[id]': buildIdFilter(optionValueIds),
            })
          : [];
        if (!isActive) return;
        setOptionValues(optionValueList);

        const optionGroupIds = Array.from(
          new Set(optionValueList.map(value => value.id_attribute_group))
        );
        const optionGroupList = optionGroupIds.length
          ? await listProductOptions({
              'filter[id]': buildIdFilter(optionGroupIds),
            })
          : [];
        if (!isActive) return;
        setOptionGroups(optionGroupList);

        const groupedValues: Record<number, ProductOptionValueOutput[]> = {};
        for (const value of optionValueList) {
          groupedValues[value.id_attribute_group] = groupedValues[value.id_attribute_group] || [];
          groupedValues[value.id_attribute_group].push(value);
        }

        const optionValueById = new Map(optionValueList.map(value => [value.id, value]));
        const initialSelection: Record<number, number> = {};
        const defaultCombination =
          combinationList.find(combination => combination.id === productData.id_default_combination) ||
          combinationList.find(combination => combination.default_on) ||
          combinationList[0];

        if (defaultCombination) {
          for (const valueId of defaultCombination.product_option_values) {
            const optionValue = optionValueById.get(valueId);
            if (optionValue) {
              initialSelection[optionValue.id_attribute_group] = valueId;
            }
          }
        }

        for (const group of optionGroupList) {
          if (!initialSelection[group.id]) {
            const firstValue = groupedValues[group.id]?.[0];
            if (firstValue) initialSelection[group.id] = firstValue.id;
          }
        }

        if (isActive) setSelectedValues(initialSelection);
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
  }, [productId]);

  const optionValuesByGroup = useMemo(() => {
    const grouped: Record<number, ProductOptionValueOutput[]> = {};
    for (const value of optionValues) {
      grouped[value.id_attribute_group] = grouped[value.id_attribute_group] || [];
      grouped[value.id_attribute_group].push(value);
    }
    return grouped;
  }, [optionValues]);

  const combinationsById = useMemo(
    () => Object.fromEntries(combinations.map(combination => [combination.id, combination])),
    [combinations]
  );

  const combinationKeyMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const combination of combinations) {
      const key = [...combination.product_option_values].sort((a, b) => a - b).join('-');
      map.set(key, combination.id);
    }
    return map;
  }, [combinations]);

  const selectionKey = Object.values(selectedValues).sort((a, b) => a - b).join('-');
  const selectedCombinationId = combinationKeyMap.get(selectionKey);
  const selectedCombination = selectedCombinationId
    ? combinationsById[selectedCombinationId]
    : undefined;

  const missingSelection = optionGroups.some(group => !selectedValues[group.id]);

  useEffect(() => {
    let isActive = true;

    const loadUnitPrices = async () => {
      if (!product) {
        if (isActive) {
          setUnitPriceHt(0);
          setUnitPriceTtc(0);
        }
        return;
      }

      const selectedCombinationId = selectedCombination?.id ?? 0;

      try {

          const stockAvailable = await listStockAvailables({
              'filter[id_product]': '['+String(product.id)+']',
              'filter[id_product_attribute]': '['+String(selectedCombinationId)+']'
          });

          setProductQuantity(stockAvailable[0].quantity);

        const [htData, ttcData] = await Promise.all([
          getProductMyPrice(product.id, {
              'price[my_price][use_tax]': '0',
              'price[my_price][use_reduction]':'0',
              'price[my_price][product_attribute]': String(selectedCombinationId),
              'price[my_price][id_country]': '[8]',
          }),
          getProductMyPrice(product.id, {
              'price[my_price][use_tax]': '1',
              'price[my_price][use_reduction]':'0',
              'price[my_price][product_attribute]': String(selectedCombinationId),
              'price[my_price][id_country]': '[8]',
          }),
        ]);

        if (!isActive) return;
        setUnitPriceHt(htData.my_price ?? 0);
        setUnitPriceTtc(ttcData.my_price ?? 0);
      } catch {
        if (!isActive) return;
        let fallbackHt = product.price ?? 0;
        if (selectedCombination?.price && selectedCombination.price > 0) {
          fallbackHt = selectedCombination.price;
        }
        setUnitPriceHt(fallbackHt);
        setUnitPriceTtc(fallbackHt * (1 + (tax?.rate ?? 0) / 100));
      }
    };

    loadUnitPrices();
    return () => {
      isActive = false;
    };
  }, [product, selectedCombination?.id, selectedCombination?.price, tax?.rate]);

  const releaseBadge = product ? getReleaseBadge(product.available_date) : null;

  const imageId = selectedCombination?.images?.[0] ?? product?.id_default_image ?? 0;
  const imageUrl = imageId && product ? `/api/images/products/${product.id}/${imageId}` : null;

  const handleSelectChange = (groupId: number, valueId: number) => {
    setSelectedValues(current => ({ ...current, [groupId]: valueId }));
  };

  const handleAddToCart = async () => {
    if (!product) return;
    if (optionGroups.length > 0 && (missingSelection || !selectedCombination)) {
      setError('Veuillez choisir une combinaison valide.');
      return;
    }

    setAdding(true);
    setError(null);
    try {
      await addToCart({
        productId: product.id,
        productAttributeId: selectedCombination?.id ?? 0,
        quantity,
        customerId,
        secureKey,
      });
      navigate('/frontoffice/panier');
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'message' in err) {
        setError(String((err as { message?: string }).message ?? 'Erreur inconnue'));
      } else {
        setError('Erreur inconnue');
      }
    } finally {
      setAdding(false);
    }
  };

  return {
    product,
    productQuantity,
    tax,
    combinations,
    optionValues,
    optionGroups,
    selectedValues,
    quantity,
    loading,
    adding,
    error,
    setSelectedValues,
    setQuantity,
    unitPriceHt,
    unitPriceTtc,
    releaseBadge,
    imageId,
    imageUrl,
    selectedCombination,
    missingSelection,
    optionValuesByGroup,
    handleSelectChange,
    handleAddToCart,
  };
}
