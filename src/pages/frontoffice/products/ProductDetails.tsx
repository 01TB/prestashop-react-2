import { Link, useParams } from 'react-router-dom';
import FrontofficeLayout from '../../../components/UI/Navigation/frontoffice/FrontofficeLayout';
import type { ProductOptionOutput } from '../../../resources/product_options/product_options.types';
import { useFrontofficeAuth } from '../../../services/frontoffice/authentication/authService.tsx';
import { useProductDetails } from '../../../hooks/frontoffice/products/useProductDetails';

const getLangValue = (map: Record<number, string>, preferred = 1): string =>
  map[preferred] ?? Object.values(map)[0] ?? '';

const getGroupLabel = (group: ProductOptionOutput): string => {
  const source = Object.keys(group.public_name).length > 0 ? group.public_name : group.name;
  return getLangValue(source);
};



function ProductDetailsFrontoffice() {
  const { productId } = useParams<{ productId: string }>();
  const { customer } = useFrontofficeAuth();

  const {
    product,
    optionGroups,
    selectedValues,
    quantity,
    loading,
    adding,
    error,
    setQuantity,
    unitPriceHt,
    unitPriceTtc,
    releaseBadge,
    imageUrl,
    missingSelection,
    optionValuesByGroup,
    handleSelectChange,
    handleAddToCart,
  } = useProductDetails(productId, customer?.id, customer?.secure_key);

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
