import {useEffect, useState} from "react";
import type {CategoryOutput} from "../../../resources/categories/categories.types.ts";
import {listCategories} from "../../../resources/categories/categories.service.ts";
import type {ProductOutput} from "../../../resources/products/products.types.ts";
import {listProducts} from "../../../resources/products/products.service.ts";
import {reductionStockAvailables} from "../../../services/backoffice/stock/stockService.ts";

export interface StockReductionInfo {

    categories: CategoryOutput[];
    products: ProductOutput[];

    loading: boolean;
    error: string | null;
    placing: boolean;

    numberReduction: number;

    setSelectedCategorie: (idCategorie: number | null) => void;
    setNumberReduction: (idNumberReduction: number | null) => void;

    reductionTotal: number;
    reductionReel: number;

    handleRedution: () => Promise<void>;
}

export function useStockReduction() {

    const [categories, setCategories] = useState<CategoryOutput[]>([]);
    const [products, setProducts] = useState<ProductOutput[]>([]);

    const [selectedCategorie, setSelectedCategorie] = useState<number | null>(null);

    const [reductionTotal, setReductionTotal] = useState(0);
    const [reductionReel, setReductionReel] = useState(0);

    const [numberReduction, setNumberReduction] = useState(0);

    const [loading, setLoading] = useState(true);
    const [placing, setPlacing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isActive = true;

        const load = async () => {

            setLoading(true);
            setError(null);

            try {
                if (!isActive) return;
                const listCategoriesAll = await listCategories();
                setCategories(listCategoriesAll);

                const listProductsAll = await listProducts();
                setProducts(listProductsAll);

                if (!isActive) return;
            } catch (err: unknown) {
                if (!isActive) return;
                setError(err instanceof Error ? err.message : 'Erreur inconnue');
            } finally {
                if (isActive) setLoading(false);
            }

        };
        load();
        return () => { isActive = false; };
    }, []);

    const handleRedution = async () => {
        setLoading(true);
        setError(null);

        try {
            let reductionTot = 0;
            let reductionReel = 0;
            if(selectedCategorie !== null) {
                const filteredProducts = products.filter(product => product.id_category_default === selectedCategorie);
                for (const product of filteredProducts) {
                    if(product.combinations.length > 0) {
                        reductionTot += product.combinations.length * numberReduction;
                        // const reductionEffectuePremier = await reductionStockAvailables(product.id, 0, numberReduction);
                        // setReductionReel( reductionReel + reductionEffectuePremier);
                        for (const combination of product.combinations) {
                            const reductionEffectue = await reductionStockAvailables(product.id, combination, numberReduction);
                            reductionReel += reductionEffectue;
                        }
                    } else {
                        reductionTot += numberReduction;
                        const reductionEffectue = await reductionStockAvailables(product.id, 0, numberReduction);
                        reductionReel += reductionEffectue;
                    }
                }
                setReductionTotal( reductionTot );
                setReductionReel( reductionReel );
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Erreur inconnue lors du placement de la commande');
        } finally {
            setLoading(false);
            setPlacing(true);
        }
    }

    return {
        categories,
        products,

        loading,
        error,
        placing,

        numberReduction,

        setSelectedCategorie,
        setNumberReduction,

        reductionTotal,
        reductionReel,

        handleRedution,
    }

}