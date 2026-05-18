import SidebarBackoffice from '../../../components/UI/Navigation/backoffice/SidebarBackoffice';
import TopbarBackoffice from '../../../components/UI/Navigation/backoffice/TopbarBackoffice';
import PageHeading from '../../../components/UI/Heading/PageHeading';
import { useAddStock } from '../../../hooks/backoffice/stocks/useAddStock';

const formatNumber = (value: number): string => new Intl.NumberFormat('fr-FR').format(value);

function AddStockPage() {
  const {
    loading,
    submitting,
    error,
    success,
    productChoices,
    combinationChoices,
    reasons,
    selectedProductId,
    selectedCombinationId,
    selectedProductLabel,
    selectedCombinationLabel,
    selectedStock,
    selectedMovements,
    currentStock,
    lastMovement,
    quantity,
    reasonId,
    reasonLabel,
    canSubmit,
    setSelectedProductId,
    setSelectedCombinationId,
    setQuantity,
    setReasonId,
    increaseStock,
  } = useAddStock();

  const hasCombinations = combinationChoices.length > 1;

  return (
    <div>
      <div id="wrapper">
        <SidebarBackoffice />

        <div id="content-wrapper" className="d-flex flex-column">
          <div id="content">
            <TopbarBackoffice />

            <div className="container-fluid">
              <PageHeading title="Ajouter du stock" />

              <div className="card shadow mb-4">
                <div className="card-header py-3 d-flex flex-column flex-md-row align-items-md-center justify-content-between">
                  <h6 className="m-0 font-weight-bold text-primary">Augmentation de stock</h6>
                  <div className="text-muted small mt-2 mt-md-0">Selection du produit, de la declinaison et de la quantite</div>
                </div>
                <div className="card-body">
                  {loading && <div className="text-center py-4">Chargement...</div>}

                  {error && (
                    <div className="alert alert-danger" role="alert">
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="alert alert-success" role="alert">
                      {success}
                    </div>
                  )}

                  {!loading && (
                    <>
                      <div className="row mb-4">
                        <div className="col-lg-6 mb-3 mb-lg-0">
                          <label className="font-weight-bold">Produit</label>
                          <select
                            className="form-control"
                            value={selectedProductId ?? ''}
                            onChange={(event) => {
                              const nextId = Number(event.target.value);
                              setSelectedProductId(Number.isNaN(nextId) ? null : nextId);
                              setSelectedCombinationId(null);
                            }}
                          >
                            {productChoices.length === 0 && <option value="">Aucun produit</option>}
                            {productChoices.map(choice => (
                              <option key={choice.id} value={choice.id}>{choice.label}</option>
                            ))}
                          </select>
                        </div>

                        <div className="col-lg-6">
                          <label className="font-weight-bold">Declinaison</label>
                          <select
                            className="form-control"
                            value={selectedCombinationId ?? ''}
                            onChange={(event) => {
                              const rawValue = event.target.value;
                              setSelectedCombinationId(rawValue === '' ? null : Number(rawValue));
                            }}
                            disabled={!hasCombinations}
                          >
                            {combinationChoices.map(choice => (
                              <option key={choice.id ?? 'general'} value={choice.id ?? ''}>{choice.label}</option>
                            ))}
                          </select>
                          {!hasCombinations && (
                            <div className="small text-muted mt-1">Ce produit n'a pas de declinaison.</div>
                          )}
                        </div>
                      </div>

                      <div className="row mb-4">
                        <div className="col-xl-4 col-md-6 mb-3">
                          <div className="card border-left-primary shadow h-100 py-2">
                            <div className="card-body">
                              <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">Produit selectionne</div>
                              <div className="h6 mb-0 font-weight-bold text-gray-800">{selectedProductLabel || '-'}</div>
                              <div className="small text-muted mt-1">{selectedCombinationLabel}</div>
                            </div>
                          </div>
                        </div>

                        <div className="col-xl-4 col-md-6 mb-3">
                          <div className="card border-left-success shadow h-100 py-2">
                            <div className="card-body">
                              <div className="text-xs font-weight-bold text-success text-uppercase mb-1">Stock physique</div>
                              <div className="h5 mb-0 font-weight-bold text-gray-800">{formatNumber(currentStock)}</div>
                              {selectedStock ? (
                                <div className="small text-muted mt-1">Stock ID {selectedStock.id}</div>
                              ) : (
                                <div className="small text-muted mt-1">Aucun stock trouve pour cette selection.</div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="col-xl-4 col-md-12 mb-3">
                          <div className="card border-left-warning shadow h-100 py-2">
                            <div className="card-body">
                              <div className="text-xs font-weight-bold text-warning text-uppercase mb-1">Dernier mouvement</div>
                              <div className="h6 mb-0 font-weight-bold text-gray-800">
                                {lastMovement ? `${lastMovement.date_add} (${lastMovement.sign > 0 ? '+' : '-'}${lastMovement.physical_quantity})` : 'Aucun'}
                              </div>
                              <div className="small text-muted mt-1">{selectedMovements.length} mouvement(s) sur cette selection</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-lg-4 mb-3">
                          <label className="font-weight-bold">Quantite a ajouter</label>
                          <input
                            type="number"
                            min="1"
                            className="form-control"
                            value={quantity}
                            onChange={(event) => setQuantity(event.target.value)}
                          />
                        </div>

                        <div className="col-lg-5 mb-3">
                          <label className="font-weight-bold">Motif</label>
                          <select
                            className="form-control"
                            value={reasonId ?? ''}
                            onChange={(event) => {
                              const nextId = Number(event.target.value);
                              setReasonId(Number.isNaN(nextId) ? null : nextId);
                            }}
                          >
                            {reasons.length === 0 && <option value="">Aucun motif disponible</option>}
                            {reasons.map(reason => (
                              <option key={reason.id} value={reason.id}>
                                {reason.name[1] ?? Object.values(reason.name)[0] ?? `Motif #${reason.id}`}
                              </option>
                            ))}
                          </select>
                          {reasonLabel && <div className="small text-muted mt-1">Motif retenu : {reasonLabel}</div>}
                        </div>

                        <div className="col-lg-3 mb-3 d-flex align-items-end">
                          <button
                            type="button"
                            className="btn btn-success btn-block"
                            disabled={!canSubmit}
                            onClick={increaseStock}
                          >
                            {submitting ? 'Ajout en cours...' : 'Ajouter au stock'}
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
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

export default AddStockPage;