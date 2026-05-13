import { useEffect, useState } from 'react';
import {listProductsTtc} from '../../../resources/products/products.service';
import { listCategories } from '../../../resources/categories/categories.service';
import type {ProductTtcOutput} from '../../../resources/products/products.types';
import type { CategoryOutput } from '../../../resources/categories/categories.types';

export interface UseProductsWithFiltersResult {
    products: ProductTtcOutput[];
    filteredProducts: ProductTtcOutput[];
    categories: CategoryOutput[];
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
    const [products, setProducts] = useState<ProductTtcOutput[]>([]);
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
                // if (priceMin && priceMax && parseFloat(priceMin) >= 0 && parseFloat(priceMax) > 0) {
                //     const min = parseFloat(priceMin).toFixed(2);
                //     const max = parseFloat(priceMax).toFixed(2);
                //     params['filter[price_ttc]'] = `[${min},${max}]`;
                // } else if (priceMin && parseFloat(priceMin) >= 0) {
                //     const min = parseFloat(priceMin).toFixed(2);
                //     params['filter[price_ttc]'] = `[${min},1000000]`;
                // } else if (priceMax && parseFloat(priceMax) > 0) {
                //     const max = parseFloat(priceMax).toFixed(2);
                //     params['filter[price_ttc]'] = `[0,${max}]`;
                // }

                // 2. Fetch filtered products with TTC
                const result = await listProductsTtc(params);

                if (!isActive) return;
                setProducts(result);
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

    // --- Apply client-side TTC price filter
    const filteredProducts = products.filter(product => {
        if (!priceMin && !priceMax) return true;
        const min = priceMin ? parseFloat(priceMin) : 0;
        const max = priceMax ? parseFloat(priceMax) : Infinity;
        return product.price_ttc >= min && product.price_ttc <= max;
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
