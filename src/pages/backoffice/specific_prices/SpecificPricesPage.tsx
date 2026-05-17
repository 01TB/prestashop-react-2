import { useState } from 'react';
import SidebarBackoffice from '../../../components/UI/Navigation/backoffice/SidebarBackoffice';
import TopbarBackoffice from '../../../components/UI/Navigation/backoffice/TopbarBackoffice';
import PageHeading from '../../../components/UI/Heading/PageHeading';
import { useSpecificPrices } from '../../../hooks/backoffice/specific_prices/useSpecificPrices';

const formatNumber = (value: number): string => new Intl.NumberFormat('fr-FR').format(value);

function SpecificPricesPage() {
  const {
    loading,
    error,
    successMessage,
    productChoices,
    formCombinationChoices,
    specificPrices,
    formState,
    setFormState,
    handleCreateSpecificPrice,
    handleDeleteSpecificPrice,
    formatDate,
  } = useSpecificPrices();

  const [showForm, setShowForm] = useState(false);
  const [filterProductId, setFilterProductId] = useState<number | null>(null);

  const hasCombinations = formCombinationChoices.length > 1;

  const filteredSpecificPrices = filterProductId
    ? specificPrices.filter(sp => sp.id_product === filterProductId)
    : specificPrices;

  return (
    <div>
      <div id="wrapper">
        <SidebarBackoffice />

        <div id="content-wrapper" className="d-flex flex-column">
          <div id="content">
            <TopbarBackoffice />

            <div className="container-fluid">
              <PageHeading title="Gestion des prix spécifiques et réductions" />

              {successMessage && (
                <div className="alert alert-success alert-dismissible fade show" role="alert">
                  {successMessage}
                  <button
                    type="button"
                    className="btn-close"
                    data-bs-dismiss="alert"
                    aria-label="Close"
                  ></button>
                </div>
              )}

              {error && (
                <div className="alert alert-danger alert-dismissible fade show" role="alert">
                  {error}
                  <button
                    type="button"
                    className="btn-close"
                    data-bs-dismiss="alert"
                    aria-label="Close"
                  ></button>
                </div>
              )}

              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border" role="status">
                    <span className="sr-only">Chargement...</span>
                  </div>
                </div>
              ) : (
                <>
                  {/* Formulaire de création */}
                  <div className="card shadow mb-4">
                    <div className="card-header py-3 d-flex justify-content-between align-items-center">
                      <h6 className="m-0 font-weight-bold text-primary">
                        {showForm ? 'Ajouter une réduction' : 'Formulaire de création'}
                      </h6>
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => setShowForm(!showForm)}
                      >
                        {showForm ? 'Masquer' : 'Afficher'}
                      </button>
                    </div>
                    {showForm && (
                      <div className="card-body">
                        <div className="row mb-3">
                          <div className="col-lg-6">
                            <label className="form-label font-weight-bold">Produit *</label>
                            <select
                              className="form-control"
                              value={formState.id_product ?? ''}
                              onChange={e => {
                                const id = Number(e.target.value) || null;
                                setFormState({ ...formState, id_product: id, id_product_attribute: 0 });
                              }}
                            >
                              <option value="">-- Sélectionner un produit --</option>
                              {productChoices.map(choice => (
                                <option key={choice.id} value={choice.id}>
                                  {choice.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="col-lg-6">
                            <label className="form-label font-weight-bold">Déclinaison</label>
                            <select
                              className="form-control"
                              value={formState.id_product_attribute}
                              onChange={e => {
                                setFormState({
                                  ...formState,
                                  id_product_attribute: Number(e.target.value),
                                });
                              }}
                              disabled={!hasCombinations}
                            >
                              {formCombinationChoices.map(choice => (
                                <option key={choice.id ?? 'all'} value={choice.id}>
                                  {choice.label}
                                </option>
                              ))}
                            </select>
                            {!hasCombinations && (
                              <div className="small text-muted mt-1">
                                Ce produit n'a pas de déclinaison.
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="row mb-3">
                          <div className="col-lg-6">
                            <label className="form-label font-weight-bold">Type de réduction *</label>
                            <select
                              className="form-control"
                              value={formState.reduction_type}
                              onChange={e => {
                                setFormState({
                                  ...formState,
                                  reduction_type: e.target.value as 'amount' | 'percentage',
                                });
                              }}
                            >
                              <option value="percentage">Pourcentage (%)</option>
                              <option value="amount">Montant fixe (€)</option>
                            </select>
                          </div>

                          <div className="col-lg-6">
                            <label className="form-label font-weight-bold">
                              Valeur de réduction *
                            </label>
                            <input
                              type="number"
                              className="form-control"
                              step="0.01"
                              min="0"
                              value={formState.reduction}
                              onChange={e => {
                                setFormState({
                                  ...formState,
                                  reduction: Number(e.target.value),
                                });
                              }}
                              placeholder="0.00"
                            />
                          </div>
                        </div>

                        <div className="row mb-3">
                          <div className="col-lg-6">
                            <label className="form-label font-weight-bold">Prix de vente TTC *</label>
                            <input
                              type="number"
                              className="form-control"
                              step="0.01"
                              min="0"
                              value={formState.price}
                              onChange={e => {
                                setFormState({
                                  ...formState,
                                  price: Number(e.target.value),
                                });
                              }}
                              placeholder="0.00"
                            />
                          </div>

                          <div className="col-lg-6">
                            <label className="form-label font-weight-bold">
                              Quantité minimale *
                            </label>
                            <input
                              type="number"
                              className="form-control"
                              min="1"
                              value={formState.from_quantity}
                              onChange={e => {
                                setFormState({
                                  ...formState,
                                  from_quantity: Number(e.target.value),
                                });
                              }}
                            />
                          </div>
                        </div>

                        <div className="row mb-3">
                          <div className="col-lg-6">
                            <label className="form-label font-weight-bold">Date de début *</label>
                            <input
                              type="datetime-local"
                              className="form-control"
                              value={
                                formState.from === '0000-00-00 00:00:00'
                                  ? ''
                                  : formState.from.replace(' ', 'T')
                              }
                              onChange={e => {
                                setFormState({
                                  ...formState,
                                  from: e.target.value
                                    ? e.target.value.replace('T', ' ')
                                    : '0000-00-00 00:00:00',
                                });
                              }}
                            />
                            <small className="text-muted">
                              Laissez vide pour une promotion immédiate
                            </small>
                          </div>

                          <div className="col-lg-6">
                            <label className="form-label font-weight-bold">Date de fin *</label>
                            <input
                              type="datetime-local"
                              className="form-control"
                              value={
                                formState.to === '0000-00-00 00:00:00'
                                  ? ''
                                  : formState.to.replace(' ', 'T')
                              }
                              onChange={e => {
                                setFormState({
                                  ...formState,
                                  to: e.target.value
                                    ? e.target.value.replace('T', ' ')
                                    : '0000-00-00 00:00:00',
                                });
                              }}
                            />
                            <small className="text-muted">
                              Laissez vide pour une promotion permanente
                            </small>
                          </div>
                        </div>

                        <div className="row mb-3">
                          <div className="col-lg-12">
                            <div className="form-check">
                              <input
                                type="checkbox"
                                className="form-check-input"
                                id="reduction_tax"
                                checked={formState.reduction_tax}
                                onChange={e => {
                                  setFormState({
                                    ...formState,
                                    reduction_tax: e.target.checked,
                                  });
                                }}
                              />
                              <label className="form-check-label" htmlFor="reduction_tax">
                                Réduction appliquée avant taxes (TTC)
                              </label>
                            </div>
                          </div>
                        </div>

                        <div className="row">
                          <div className="col-lg-12">
                            <button
                              type="button"
                              className="btn btn-primary"
                              onClick={handleCreateSpecificPrice}
                            >
                              <i className="fas fa-save mr-2"></i>Créer la réduction
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Liste des réductions */}
                  <div className="card shadow mb-4">
                    <div className="card-header py-3">
                      <h6 className="m-0 font-weight-bold text-primary">Liste des réductions</h6>
                    </div>
                    <div className="card-body">
                      <div className="mb-3">
                        <label className="form-label font-weight-bold">Filtrer par produit</label>
                        <select
                          className="form-control"
                          value={filterProductId ?? ''}
                          onChange={e => {
                            const id = e.target.value ? Number(e.target.value) : null;
                            setFilterProductId(id);
                          }}
                        >
                          <option value="">-- Tous les produits --</option>
                          {productChoices.map(choice => (
                            <option key={choice.id} value={choice.id}>
                              {choice.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {filteredSpecificPrices.length === 0 ? (
                        <div className="text-center text-muted py-4">
                          Aucune réduction trouvée.
                        </div>
                      ) : (
                        <div className="table-responsive">
                          <table className="table table-bordered table-hover">
                            <thead className="table-light">
                              <tr>
                                <th>Produit</th>
                                <th>Variante</th>
                                <th>Type</th>
                                <th>Réduction</th>
                                <th>Prix TTC</th>
                                <th>Qté min</th>
                                <th>Date début</th>
                                <th>Date fin</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredSpecificPrices.map(sp => (
                                <tr key={sp.id}>
                                  <td>{sp.productLabel}</td>
                                  <td>{sp.combinationLabel}</td>
                                  <td>
                                    {sp.reduction_type === 'percentage' ? (
                                      <span className="badge bg-info">% Pourcentage</span>
                                    ) : (
                                      <span className="badge bg-success">€ Montant</span>
                                    )}
                                  </td>
                                  <td>
                                    {sp.reduction_type === 'percentage'
                                      ? `${formatNumber(sp.reduction)}%`
                                      : `${formatNumber(sp.reduction)} €`}
                                  </td>
                                  <td>{formatNumber(sp.price)} €</td>
                                  <td>{sp.from_quantity}</td>
                                  <td>
                                    <small>{formatDate(sp.from)}</small>
                                  </td>
                                  <td>
                                    <small>{formatDate(sp.to)}</small>
                                  </td>
                                  <td>
                                    <button
                                      className="btn btn-sm btn-danger"
                                      onClick={() => handleDeleteSpecificPrice(sp.id)}
                                      title="Supprimer cette réduction"
                                    >
                                      <i className="fas fa-trash"></i>
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <footer className="sticky-footer bg-white">
            <div className="container my-auto">
              <div className="copyright text-center my-auto">
                <span>Copyright &copy; Your Website 2019</span>
              </div>
            </div>
          </footer>
        </div>
      </div>

      <a className="scroll-to-top rounded" href="#page-top">
        <i className="fas fa-angle-up"></i>
      </a>
    </div>
  );
}

export default SpecificPricesPage;
