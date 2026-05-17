import { useEffect, useMemo, useState } from 'react';
import { listProducts } from '../../../resources/products/products.service';
import { listCombinations } from '../../../resources/combinations/combinations.service';
import { listSpecificPrices, createSpecificPrice, deleteSpecificPrice } from '../../../resources/specific_prices/specific_prices.service';
import type { ProductOutput } from '../../../resources/products/products.types';
import type { CombinationOutput } from '../../../resources/combinations/combinations.types';
import type { SpecificPriceOutput, SpecificPriceCreateInput } from '../../../resources/specific_prices/specific_prices.types';

export interface SpecificPriceChoice {
  id: number;
  label: string;
  specificPrice: SpecificPriceOutput;
}

const getLangValue = (map: Record<number, string> | undefined, preferred = 1): string =>
  map?.[preferred] ?? Object.values(map ?? {})[0] ?? '';

const getProductLabel = (product: ProductOutput): string =>
  getLangValue(product.name) || `Produit #${product.id}`;

const getCombinationLabel = (combination: CombinationOutput): string => {
  const attrs = combination.product_option_values ?? [];
  return attrs.length > 0 ? `Déclinaison #${combination.id}` : `Base #${combination.id}`;
};

const formatDate = (dateStr: string): string => {
  if (!dateStr || dateStr === '0000-00-00 00:00:00') return 'Non défini';
  try {
    const date = new Date(dateStr.replace(' ', 'T'));
    return date.toLocaleDateString('fr-FR') + ' ' + date.toLocaleTimeString('fr-FR');
  } catch {
    return dateStr;
  }
};

export interface SpecificPriceFormState {
  id_product: number | null;
  id_product_attribute: number;
  reduction_type: 'amount' | 'percentage';
  reduction: number;
  price: number;
  from_quantity: number;
  from: string;
  to: string;
  reduction_tax: boolean;
}

export interface SpecificPriceWithProduct extends SpecificPriceOutput {
  productLabel?: string;
  combinationLabel?: string;
}

export function useSpecificPrices() {
  const [products, setProducts] = useState<ProductOutput[]>([]);
  const [combinations, setCombinations] = useState<CombinationOutput[]>([]);
  const [specificPrices, setSpecificPrices] = useState<SpecificPriceOutput[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [selectedCombinationId, setSelectedCombinationId] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form state
  const [formState, setFormState] = useState<SpecificPriceFormState>({
    id_product: null,
    id_product_attribute: 0,
    reduction_type: 'percentage',
    reduction: 0,
    price: 0,
    from_quantity: 1,
    from: '0000-00-00 00:00:00',
    to: '0000-00-00 00:00:00',
    reduction_tax: false,
  });

  // Load data
  useEffect(() => {
    let isActive = true;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const [productsResult, combinationsResult, specificPricesResult] = await Promise.all([
          listProducts(),
          listCombinations(),
          listSpecificPrices(),
        ]);

        if (!isActive) return;

        setProducts(productsResult);
        setCombinations(combinationsResult);
        setSpecificPrices(specificPricesResult);

        if (productsResult.length > 0) {
          setSelectedProductId(prev => prev ?? productsResult[0].id);
        }
      } catch (err: unknown) {
        if (!isActive) return;
        if (err && typeof err === 'object' && 'message' in err) {
          setError(String((err as { message?: string }).message ?? 'Erreur inconnue'));
        } else {
          setError('Erreur lors du chargement des données');
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

  const productChoices = useMemo(
    () =>
      products
        .map(product => ({
          id: product.id,
          label: getProductLabel(product),
        }))
        .sort((a, b) => a.label.localeCompare(b.label, 'fr')),
    [products]
  );

  const selectedProduct = useMemo(
    () => products.find(p => p.id === selectedProductId) ?? null,
    [products, selectedProductId]
  );

  const combinationChoices = useMemo(
    () => {
      if (!selectedProduct) return [];

      const productCombinations = combinations
        .filter(c => c.id_product === selectedProduct.id)
        .map(c => ({
          id: c.id,
          label: getCombinationLabel(c),
        }))
        .sort((a, b) => a.label.localeCompare(b.label, 'fr'));

      return [
        { id: 0, label: 'Toutes les déclinaisons' },
        ...productCombinations,
      ];
    },
    [combinations, selectedProduct]
  );

  // Combinations for the form (based on formState.id_product)
  const formCombinationChoices = useMemo(
    () => {
      if (!formState.id_product) return [];

      const formProduct = products.find(p => p.id === formState.id_product);
      if (!formProduct) return [];

      const productCombinations = combinations
        .filter(c => c.id_product === formProduct.id)
        .map(c => ({
          id: c.id,
          label: getCombinationLabel(c),
        }))
        .sort((a, b) => a.label.localeCompare(b.label, 'fr'));

      return [
        { id: 0, label: 'Toutes les déclinaisons' },
        ...productCombinations,
      ];
    },
    [combinations, formState.id_product, products]
  );

  const specificPricesWithLabels = useMemo<SpecificPriceWithProduct[]>(
    () =>
      specificPrices.map(sp => {
        const product = products.find(p => p.id === sp.id_product);
        const combination = combinations.find(
          c => c.id === sp.id_product_attribute && c.id_product === sp.id_product
        );

        return {
          ...sp,
          productLabel: product ? getProductLabel(product) : `Produit #${sp.id_product}`,
          combinationLabel:
            sp.id_product_attribute && sp.id_product_attribute > 0
              ? combination
                ? getCombinationLabel(combination)
                : `Déclinaison #${sp.id_product_attribute}`
              : 'Tous les variants',
        };
      }),
    [specificPrices, products, combinations]
  );

  const handleCreateSpecificPrice = async () => {
    if (!formState.id_product) {
      setError('Veuillez sélectionner un produit');
      return;
    }

    setError(null);
    setSuccessMessage(null);

    try {

        let createInput: SpecificPriceCreateInput;
        if(formState.reduction_type === "amount") {
            createInput = {
                id_product: formState.id_product,
                id_product_attribute: formState.id_product_attribute,
                id_shop: 1,
                id_cart: 0,
                id_currency: 1,
                id_country: 0,
                id_group: 0,
                id_customer: 0,
                price: -1,
                reduction: formState.price,
                reduction_type: "amount",
                reduction_tax: formState.reduction_tax,
                from_quantity: formState.from_quantity,
                from: formState.from,
                to: formState.to,
                id_shop_group: 0,
                id_specific_price_rule: 0,
            };
        } else {
            createInput = {
                id_product: formState.id_product,
                id_product_attribute: formState.id_product_attribute,
                id_shop: 1,
                id_cart: 0,
                id_currency: 1,
                id_country: 0,
                id_group: 0,
                id_customer: 0,
                price: -1,
                reduction: formState.reduction/100,
                reduction_type: "percentage",
                reduction_tax: formState.reduction_tax,
                from_quantity: formState.from_quantity,
                from: formState.from,
                to: formState.to,
                id_shop_group: 0,
                id_specific_price_rule: 0,
            };
        }

      await createSpecificPrice(createInput);
      setSuccessMessage('Réduction créée avec succès');

      // Reload specific prices
      const updated = await listSpecificPrices();
      setSpecificPrices(updated);

      // Reset form
      setFormState({
        id_product: selectedProductId,
        id_product_attribute: 0,
        reduction_type: 'percentage',
        reduction: 0,
        price: 0,
        from_quantity: 1,
        from: '0000-00-00 00:00:00',
        to: '0000-00-00 00:00:00',
        reduction_tax: false,
      });

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'message' in err) {
        setError(String((err as { message?: string }).message ?? 'Erreur inconnue'));
      } else {
        setError('Erreur lors de la création de la réduction');
      }
    }
  };

  const handleDeleteSpecificPrice = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette réduction ?')) {
      return;
    }

    setError(null);

    try {
      await deleteSpecificPrice(id);
      setSuccessMessage('Réduction supprimée avec succès');

      // Reload specific prices
      const updated = await listSpecificPrices();
      setSpecificPrices(updated);

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'message' in err) {
        setError(String((err as { message?: string }).message ?? 'Erreur inconnue'));
      } else {
        setError('Erreur lors de la suppression de la réduction');
      }
    }
  };

  return {
    loading,
    error,
    successMessage,
    products,
    combinations,
    specificPrices: specificPricesWithLabels,
    selectedProductId,
    setSelectedProductId,
    selectedCombinationId,
    setSelectedCombinationId,
    selectedProduct,
    productChoices,
    combinationChoices,
    formCombinationChoices,
    formState,
    setFormState,
    handleCreateSpecificPrice,
    handleDeleteSpecificPrice,
    formatDate,
  };
}
