import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import FrontofficeLayout from '../../../components/UI/Navigation/frontoffice/FrontofficeLayout';
import { getProduct } from '../../../resources/products/products.service';
import { listCombinations } from '../../../resources/combinations/combinations.service';
import { listProductOptionValues } from '../../../resources/product_option_values/product_option_values.service';
import { listProductOptions } from '../../../resources/product_options/product_options.service';
import type { ProductOutput } from '../../../resources/products/products.types';
import type { CombinationOutput } from '../../../resources/combinations/combinations.types';
import type { ProductOptionValueOutput } from '../../../resources/product_option_values/product_option_values.types';
import type { ProductOptionOutput } from '../../../resources/product_options/product_options.types';
import { addToCart } from '../../../services/frontoffice/cartService';
import { useFrontofficeAuth } from '../../../services/frontoffice/authService';
import { listTaxRules } from '../../../resources/tax_rules/tax_rules.service';
import type { TaxRuleOutput } from '../../../resources/tax_rules/tax_rules.types';
import type { TaxOutput } from '../../../resources/taxes/taxes.types';
import { getTax } from '../../../resources/taxes/taxes.service';

const getLangValue = (map: Record<number, string>, preferred = 1): string =>
  map[preferred] ?? Object.values(map)[0] ?? '';

const getGroupLabel = (group: ProductOptionOutput): string => {
  const source = Object.keys(group.public_name).length > 0 ? group.public_name : group.name;
  return getLangValue(source);
};

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

const buildIdFilter = (values: number[]): string => `[${values.join('|')}]`;

function ProductDetailsFrontoffice() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { customer } = useFrontofficeAuth();

  const [product, setProduct] = useState<ProductOutput | null>(null);
  const [tax, setTax] = useState<TaxOutput | null>(null);
  const [combinations, setCombinations] = useState<CombinationOutput[]>([]);
  const [optionValues, setOptionValues] = useState<ProductOptionValueOutput[]>([]);
  const [optionGroups, setOptionGroups] = useState<ProductOptionOutput[]>([]);
  const [selectedValues, setSelectedValues] = useState<Record<number, number>>({});
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const unitPriceHt = (product?.price ?? 0) + (selectedCombination?.price ?? 0);

  const unitPriceTtc = unitPriceHt * (1 + (tax?.rate ?? 0) / 100);
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
        customerId: customer?.id,
        secureKey: customer?.secure_key,
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

  return (
    <FrontofficeLayout title="Fiche produit">
      {loading && <div className="text-center py-4">Chargement...</div>}

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {!loading && !product && !error && (
        <div className="alert alert-warning" role="alert">
          Produit introuvable.
        </div>
      )}

      {!loading && product && (
        <div className="row">
          <div className="col-lg-6 mb-4">
            <div className="card shadow">
              <div className="position-relative">
                {imageUrl ? (
                  <img
                    className="card-img-top"
                    src={imageUrl}
                    alt={getLangValue(product.name)}
                    style={{ height: '360px', objectFit: 'cover' }}
                  />
                ) : (
                  <div
                    className="bg-light d-flex align-items-center justify-content-center"
                    style={{ height: '360px' }}
                  >
                    <span className="text-gray-500 small">Aucune image</span>
                  </div>
                )}

                {releaseBadge && (
                  <span
                    className={`badge badge-pill position-absolute ${releaseBadge === 'HOT' ? 'badge-danger' : 'badge-success'}`}
                    style={{ top: '12px', left: '12px', fontSize: '0.875rem', padding: '0.5rem 0.75rem', fontWeight: '700' }}
                  >
                    {releaseBadge}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="card shadow mb-4">
              <div className="card-body">
                <h4 className="text-gray-900">{getLangValue(product.name)}</h4>
                <div className="text-gray-600 small mb-3">
                  {getLangValue(product.description_short)}
                </div>

                <div className="mb-3">
                  <div className="text-gray-800">Prix TTC</div>
                  <div className="h4 text-primary">{unitPriceTtc.toFixed(2)} EUR</div>
                  <div className="small text-gray-500">HT: {unitPriceHt.toFixed(2)} EUR</div>
                </div>

                {optionGroups.map(group => (
                  <div className="form-group" key={group.id}>
                    <label className="text-gray-700">
                      {getGroupLabel(group)}
                    </label>
                    <select
                      className="form-control"
                      value={selectedValues[group.id] ?? ''}
                      onChange={event => handleSelectChange(group.id, Number(event.target.value))}
                    >
                      <option value="" disabled>
                        Choisir
                      </option>
                      {(optionValuesByGroup[group.id] ?? []).map(value => (
                        <option key={value.id} value={value.id}>
                          {getLangValue(value.name)}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}

                <div className="form-group">
                  <label className="text-gray-700">Quantite</label>
                  <input
                    type="number"
                    min={1}
                    className="form-control"
                    value={quantity}
                    onChange={event => setQuantity(Math.max(1, Number(event.target.value) || 1))}
                  />
                </div>

                <div className="d-flex align-items-center">
                  <button
                    type="button"
                    className="btn btn-primary mr-3"
                    onClick={handleAddToCart}
                    disabled={adding || missingSelection}
                  >
                    {adding ? 'Ajout en cours...' : 'Ajouter au panier'}
                  </button>
                  <Link to="/frontoffice/produits" className="btn btn-outline-secondary">
                    Retour catalogue
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </FrontofficeLayout>
  );
}

export default ProductDetailsFrontoffice;
