import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import FrontofficeLayout from '../../../components/UI/Navigation/frontoffice/FrontofficeLayout';
import { listProducts } from '../../../resources/products/products.service';
import { listTaxRules } from '../../../resources/tax_rules/tax_rules.service';
import { listTaxes } from '../../../resources/taxes/taxes.service';
import type { ProductOutput } from '../../../resources/products/products.types';

const getLangValue = (map: Record<number, string>, preferred = 1): string =>
  map[preferred] ?? Object.values(map)[0] ?? '';

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

function ListProductsFrontoffice() {
  const [products, setProducts] = useState<ProductOutput[]>([]);
  const [taxRateByGroup, setTaxRateByGroup] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await listProducts({
          'filter[active]': '1',
          display: '[id,name,price,active,id_default_image,id_default_combination,id_tax_rules_group]',
        });
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

    load();
    return () => {
      isActive = false;
    };
  }, []);

  return (
    <FrontofficeLayout title="Produits">
      {loading && <div className="text-center py-4">Chargement...</div>}

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="row">
          {products.length === 0 && (
            <div className="col-12">
              <div className="alert alert-info" role="alert">
                Aucun produit disponible.
              </div>
            </div>
          )}

          {products.map(product => {
            const name = getLangValue(product.name);
            const imageId = product.id_default_image ?? 0;
            const imageUrl = imageId
              ? `/api/images/products/${product.id}/${imageId}`
              : null;
            const showNew = product.new;
            const showSale = product.on_sale;
            const releaseBadge = getReleaseBadge(product.available_date);
            const taxRate = taxRateByGroup[product.id_tax_rules_group] ?? 0;
            const priceTtc = product.price * (1 + taxRate / 100);

            return (
              <div className="col-xl-3 col-lg-4 col-md-6 mb-4" key={product.id}>
                <div className="card border-0 shadow h-100">
                  <div className="position-relative">
                    {imageUrl ? (
                      <img
                        className="card-img-top"
                        src={imageUrl}
                        alt={name}
                        style={{ height: '220px', objectFit: 'cover' }}
                      />
                    ) : (
                      <div
                        className="bg-light d-flex align-items-center justify-content-center"
                        style={{ height: '220px' }}
                      >
                        <span className="text-gray-500 small">Aucune image</span>
                      </div>
                    )}

                    {showNew && (
                      <span
                        className="badge badge-info position-absolute"
                        style={{ top: '8px', left: '8px' }}
                      >
                        NOUVEAU
                      </span>
                    )}

                    {releaseBadge && (
                      <span
                        className={`badge badge-pill position-absolute ${releaseBadge === 'HOT' ? 'badge-danger' : 'badge-success'}`}
                        style={{ top: showNew ? '36px' : '8px', left: '8px', fontSize: '0.875rem', padding: '0.5rem 0.75rem', fontWeight: '700' }}
                      >
                        {releaseBadge}
                      </span>
                    )}

                    {showSale && (
                      <span
                        className="badge badge-warning position-absolute"
                        style={{ top: showNew || releaseBadge ? '64px' : '8px', left: '8px' }}
                      >
                        PROMO
                      </span>
                    )}
                  </div>

                  <div className="card-body text-center">
                    <div className="text-gray-900 small mb-1">{name}</div>
                    <div className="font-weight-bold">
                      {priceTtc.toFixed(2)} EUR TTC
                    </div>
                  </div>

                  <div className="card-footer bg-white border-0 text-center">
                    <Link
                      className="btn btn-sm btn-primary"
                      to={`/frontoffice/produits/${product.id}`}
                    >
                      Voir details
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </FrontofficeLayout>
  );
}

export default ListProductsFrontoffice;