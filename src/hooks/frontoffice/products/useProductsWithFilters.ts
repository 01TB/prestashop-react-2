import { useEffect, useState } from 'react';
import { listProducts } from '../../../resources/products/products.service';
import { listTaxRules } from '../../../resources/tax_rules/tax_rules.service';
import { listTaxes } from '../../../resources/taxes/taxes.service';
import { listCategories } from '../../../resources/categories/categories.service';
import type { ProductOutput } from '../../../resources/products/products.types';
import type { CategoryOutput } from '../../../resources/categories/categories.types';

export interface UseProductsWithFiltersResult {
  products: ProductOutput[];
  filteredProducts: ProductOutput[];
  categories: CategoryOutput[];
  taxRateByGroup: Record<number, number>;
  loading: boolean;
  error: string | null;
  searchName: string;
  setSearchName: (value: string) => void;
  selectedCategoryId: string;
  setSelectedCategoryId: (value: string) => void;
  priceMin: string;
  setPriceMin: (value: string) => void;
  priceMax: string;
  setPriceMax: (value: string) => void;
  resetFilters: () => void;
}

export function useProductsWithFilters(): UseProductsWithFiltersResult {
  // --- State for products and taxes
  const [products, setProducts] = useState<ProductOutput[]>([]);
  const [taxRateByGroup, setTaxRateByGroup] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- State for search filters
  const [searchName, setSearchName] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [priceMin, setPriceMin] = useState<string>('');
  const [priceMax, setPriceMax] = useState<string>('');

  // --- State for categories list
  const [categories, setCategories] = useState<CategoryOutput[]>([]);

  // --- Load categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await listCategories({
          display: '[id,name]',
          'filter[active]': '1',
        });
        setCategories(cats);
      } catch (err) {
        console.error('Erreur chargement catégories', err);
      }
    };
    loadCategories();
  }, []);

  // --- Load products and compute taxes when filters change
  useEffect(() => {
    let isActive = true;

    const loadProducts = async () => {
      setLoading(true);
      setError(null);

      try {
        // 1. Build PrestaShop filter parameters (HT prices)
        const params: Record<string, string> = {
          display: '[id,name,price,active,id_default_image,id_default_combination,id_tax_rules_group]',
          'filter[active]': '1',
        };

        // Text filter (partial search)
        if (searchName.trim()) {
          params['filter[name]'] = `%[${searchName.trim()}]%`;
        }

        // Category filter
        if (selectedCategoryId && parseInt(selectedCategoryId, 10) > 0) {
          params['filter[id_category_default]'] = `[${selectedCategoryId}]`;
        }

        // Price range filter (HT)
        if (priceMin && priceMax && parseFloat(priceMin) >= 0 && parseFloat(priceMax) > 0) {
          const min = parseFloat(priceMin).toFixed(2);
          const max = parseFloat(priceMax).toFixed(2);
          params['filter[price]'] = `[${min},${max}]`;
        } else if (priceMin && parseFloat(priceMin) >= 0) {
          const min = parseFloat(priceMin).toFixed(2);
          params['filter[price]'] = `[${min},1000000]`;
        } else if (priceMax && parseFloat(priceMax) > 0) {
          const max = parseFloat(priceMax).toFixed(2);
          params['filter[price]'] = `[0,${max}]`;
        }

        // 2. Fetch filtered products
        const result = await listProducts(params);

        // 3. Compute tax rates mapping
        const taxGroups = Array.from(
          new Set(result.map(item => item.id_tax_rules_group).filter(id => id > 0))
        );
        const rateMap: Record<number, number> = {};

        if (taxGroups.length > 0) {
          const taxRules = await listTaxRules({
            'filter[id_tax_rules_group]': `[${taxGroups.join('|')}]`,
            'filter[id_country]': '8',
            display: '[id,id_tax_rules_group,id_tax,id_country,id_state,zipcode_from,zipcode_to]',
          });

          const taxIds = Array.from(
            new Set(taxRules.map(rule => rule.id_tax).filter(id => id > 0))
          );

          if (taxIds.length > 0) {
            const taxes = await listTaxes({
              'filter[id]': `[${taxIds.join('|')}]`,
              display: '[id,rate]',
            });

            const rateByTaxId = new Map(taxes.map(tax => [tax.id, tax.rate]));
            const rulesByGroup = new Map<number, typeof taxRules>();

            for (const rule of taxRules) {
              const list = rulesByGroup.get(rule.id_tax_rules_group) ?? [];
              list.push(rule);
              rulesByGroup.set(rule.id_tax_rules_group, list);
            }

            for (const [groupId, rules] of rulesByGroup.entries()) {
              const preferred =
                rules.find(rule => rule.id_state === 0 && !rule.zipcode_from && !rule.zipcode_to) ??
                rules.find(rule => rule.id_state === 0) ??
                rules[0];
              const rate = preferred ? rateByTaxId.get(preferred.id_tax) ?? 0 : 0;
              rateMap[groupId] = rate;
            }
          }
        }

        if (!isActive) return;
        setProducts(result);
        setTaxRateByGroup(rateMap);
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

    loadProducts();

    return () => {
      isActive = false;
    };
  }, [searchName, selectedCategoryId, priceMin, priceMax]);

  // --- Helper: compute TTC price for a product
  const getProductPriceTTC = (product: ProductOutput): number => {
    const taxRate = taxRateByGroup[product.id_tax_rules_group] ?? 0;
    return product.price * (1 + taxRate / 100);
  };

  // --- Apply client-side TTC price filter
  const filteredProducts = products.filter(product => {
    if (!priceMin && !priceMax) return true;
    const priceTTC = getProductPriceTTC(product);
    const min = priceMin ? parseFloat(priceMin) : 0;
    const max = priceMax ? parseFloat(priceMax) : Infinity;
    return priceTTC >= min && priceTTC <= max;
  });

  // --- Reset all filters
  const resetFilters = () => {
    setSearchName('');
    setSelectedCategoryId('');
    setPriceMin('');
    setPriceMax('');
  };

  return {
    products,
    filteredProducts,
    categories,
    taxRateByGroup,
    loading,
    error,
    searchName,
    setSearchName,
    selectedCategoryId,
    setSelectedCategoryId,
    priceMin,
    setPriceMin,
    priceMax,
    setPriceMax,
    resetFilters,
  };
}
