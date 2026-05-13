import { Link } from 'react-router-dom';
import FrontofficeLayout from '../../../components/UI/Navigation/frontoffice/FrontofficeLayout';
import { useProductsWithFilters } from '../../../hooks/frontoffice/products/useProductsWithFilters';
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
    const {
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
    } = useProductsWithFilters();

    // --- helper: calculate TTC price for a product
    const getProductPriceTTC = (product : ProductOutput) => {
        const taxRate = taxRateByGroup[product.id_tax_rules_group] ?? 0;
        return product.price * (1 + taxRate / 100);
    };

    return (
        <FrontofficeLayout title="Produits">
            {/* Barre de recherche */}
            <div className="card mb-4 shadow-sm">
                <div className="card-body">
                    <div className="row g-3">
                        <div className="col-md-4">
                            <label className="form-label">Recherche par nom</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="ex: chaise"
                                value={searchName}
                                onChange={(e) => setSearchName(e.target.value)}
                            />
                        </div>

                        <div className="col-md-3">
                            <label className="form-label">Catégorie</label>
                            <select
                                className="form-select"
                                value={selectedCategoryId}
                                onChange={(e) => setSelectedCategoryId(e.target.value)}
                            >
                                <option value="">Toutes les catégories</option>
                                {categories.map(cat => {
                                    const catName = getLangValue(cat.name);
                                    return (
                                        <option key={cat.id} value={cat.id}>
                                            {catName}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>

                        <div className="col-md-2">
                            <label className="form-label">Prix min (TTC, €)</label>
                            <input
                                type="number"
                                step="0.01"
                                className="form-control"
                                placeholder="0"
                                value={priceMin}
                                onChange={(e) => setPriceMin(e.target.value)}
                            />
                        </div>

                        <div className="col-md-2">
                            <label className="form-label">Prix max (TTC, €)</label>
                            <input
                                type="number"
                                step="0.01"
                                className="form-control"
                                placeholder="∞"
                                value={priceMax}
                                onChange={(e) => setPriceMax(e.target.value)}
                            />
                        </div>

                        <div className="col-md-1 d-flex align-items-end">
                            <button
                                className="btn btn-outline-secondary w-100"
                                onClick={resetFilters}
                            >
                                Réinitialiser
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Affichage des produits (très proche de l'existant) */}
            {loading && <div className="text-center py-4">Chargement...</div>}

            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}

            {!loading && !error && (
                <div className="row">
                    {filteredProducts.length === 0 && (
                        <div className="col-12">
                            <div className="alert alert-info" role="alert">
                                Aucun produit ne correspond à vos critères.
                            </div>
                        </div>
                    )}

                    {filteredProducts.map(product => {
                        const name = getLangValue(product.name);
                        const imageId = product.id_default_image ?? 0;
                        const imageUrl = imageId
                            ? `/api/images/products/${product.id}/${imageId}`
                            : null;
                        const showNew = product.new;
                        const showSale = product.on_sale;
                        const releaseBadge = getReleaseBadge(product.available_date);
                        const priceTTC = getProductPriceTTC(product);

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
                                            {priceTTC.toFixed(2)} EUR TTC
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