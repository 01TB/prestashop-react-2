import SidebarBackoffice from '../../../components/UI/Navigation/backoffice/SidebarBackoffice';
import TopbarBackoffice from '../../../components/UI/Navigation/backoffice/TopbarBackoffice';
import PageHeading from '../../../components/UI/Heading/PageHeading';
import { useStockEvolution } from '../../../hooks/backoffice/stocks/useStockEvolution';

const formatNumber = (value: number): string => new Intl.NumberFormat('fr-FR').format(value);

function StockEvolutionPage() {
  const {
    loading,
    error,
    productChoices,
    combinationChoices,
    selectedProductId,
    selectedCombinationId,
    setSelectedProductId,
    setSelectedCombinationId,
    selectedProductLabel,
    selectedCombinationLabel,
    currentStock,
    dailyRows,
    summary,
  } = useStockEvolution();

  const hasCombinations = combinationChoices.length > 1;

  return (
    <div>
      <div id="wrapper">
        <SidebarBackoffice />

        <div id="content-wrapper" className="d-flex flex-column">
          <div id="content">
            <TopbarBackoffice />

            <div className="container-fluid">
              <PageHeading title="Evolution du stock journalier" />

              <div className="card shadow mb-4">
                <div className="card-header py-3 d-flex flex-column flex-md-row align-items-md-center justify-content-between">
                  <h6 className="m-0 font-weight-bold text-primary">Tableau d'evolution</h6>
                  <div className="text-muted small mt-2 mt-md-0">Selection du produit et de la declinaison</div>
                </div>
                <div className="card-body">
                  {loading && <div className="text-center py-4">Chargement...</div>}

                  {error && (
                    <div className="alert alert-danger" role="alert">
                      {error}
                    </div>
                  )}

                  {!loading && !error && (
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
                              <option key={choice.id} value={choice.id}>
                                {choice.label}
                              </option>
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
                              <option key={choice.id ?? 'all'} value={choice.id ?? ''}>
                                {choice.label}
                              </option>
                            ))}
                          </select>
                          {!hasCombinations && (
                            <div className="small text-muted mt-1">Ce produit n'a pas de declinaison.</div>
                          )}
                        </div>
                      </div>

                      {selectedProductLabel && (
                        <div className="alert alert-info mb-4">
                          <strong>Produit :</strong> {selectedProductLabel}
                          <span className="mx-2">|</span>
                          <strong>Vue :</strong> {selectedCombinationLabel}
                        </div>
                      )}

                      <div className="row mb-4">
                        <div className="col-xl-3 col-md-6 mb-3">
                          <div className="card border-left-primary shadow h-100 py-2">
                            <div className="card-body">
                              <div className="row no-gutters align-items-center">
                                <div className="col mr-2">
                                  <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">Stock actuel</div>
                                  <div className="h5 mb-0 font-weight-bold text-gray-800">{formatNumber(currentStock)}</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="col-xl-3 col-md-6 mb-3">
                          <div className="card border-left-success shadow h-100 py-2">
                            <div className="card-body">
                              <div className="row no-gutters align-items-center">
                                <div className="col mr-2">
                                  <div className="text-xs font-weight-bold text-success text-uppercase mb-1">Entrées</div>
                                  <div className="h5 mb-0 font-weight-bold text-gray-800">{formatNumber(summary.totalEntries)}</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="col-xl-3 col-md-6 mb-3">
                          <div className="card border-left-danger shadow h-100 py-2">
                            <div className="card-body">
                              <div className="row no-gutters align-items-center">
                                <div className="col mr-2">
                                  <div className="text-xs font-weight-bold text-danger text-uppercase mb-1">Sorties</div>
                                  <div className="h5 mb-0 font-weight-bold text-gray-800">{formatNumber(summary.totalExits)}</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="col-xl-3 col-md-6 mb-3">
                          <div className="card border-left-warning shadow h-100 py-2">
                            <div className="card-body">
                              <div className="row no-gutters align-items-center">
                                <div className="col mr-2">
                                  <div className="text-xs font-weight-bold text-warning text-uppercase mb-1">Mouvements</div>
                                  <div className="h5 mb-0 font-weight-bold text-gray-800">{formatNumber(summary.movementsCount)}</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="table-responsive">
                        <table className="table table-bordered table-hover" width="100%" cellSpacing="0">
                          <thead>
                            <tr>
                              <th>Date</th>
                              <th className="text-right">Stock debut</th>
                              <th className="text-right">Entrees</th>
                              <th className="text-right">Sorties</th>
                              <th className="text-right">Stock fin</th>
                            </tr>
                          </thead>
                          <tbody>
                            {dailyRows.length === 0 ? (
                              <tr>
                                <td colSpan={5} className="text-center text-muted py-4">
                                  Aucun mouvement de stock disponible pour cette selection.
                                </td>
                              </tr>
                            ) : (
                              dailyRows.map(row => (
                                <tr key={row.dateKey}>
                                  <td>{row.dateLabel}</td>
                                  <td className="text-right">{formatNumber(row.stockStart)}</td>
                                  <td className="text-right text-success">{formatNumber(row.entries)}</td>
                                  <td className="text-right text-danger">{formatNumber(row.exits)}</td>
                                  <td className="text-right font-weight-bold">{formatNumber(row.stockEnd)}</td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
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

export default StockEvolutionPage;