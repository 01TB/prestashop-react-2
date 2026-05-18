import SidebarBackoffice from '../../../components/UI/Navigation/backoffice/SidebarBackoffice';
import TopbarBackoffice from '../../../components/UI/Navigation/backoffice/TopbarBackoffice';
import PageHeading from '../../../components/UI/Heading/PageHeading';
import { useStockResume } from '../../../hooks/backoffice/stocks/useStockResume';

const formatNumber = (value: number): string => new Intl.NumberFormat('fr-FR').format(value);

function StockResumePage() {
  const { loading, error, summaries, totals } = useStockResume();

  return (
    <div>
      <div id="wrapper">
        <SidebarBackoffice />

        <div id="content-wrapper" className="d-flex flex-column">
          <div id="content">
            <TopbarBackoffice />

            <div className="container-fluid">
              <PageHeading title="Resume des stocks" />

              <div className="card shadow mb-4">
                <div className="card-header py-3 d-flex flex-column flex-md-row align-items-md-center justify-content-between">
                  <h6 className="m-0 font-weight-bold text-primary">Resume par categorie</h6>
                  <div className="text-muted small mt-2 mt-md-0">Vue simplifiee des quantites</div>
                </div>
                <div className="card-body">
                  {loading && <div className="text-center py-4">Chargement...</div>}

                  {error && (
                    <div className="alert alert-danger" role="alert">
                      {error}
                    </div>
                  )}

                  {!loading && !error && (
                    <div className="table-responsive">
                      <table className="table table-bordered table-hover" width="100%" cellSpacing="0">
                        <thead>
                          <tr>
                            <th>Categorie</th>
                            <th className="text-right">Qte physique</th>
                            <th className="text-right">Qte reservee</th>
                            <th className="text-right">Qte disponible</th>
                          </tr>
                        </thead>
                        <tbody>
                          {summaries.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="text-center text-muted py-4">
                                Aucune categorie a afficher.
                              </td>
                            </tr>
                          ) : (
                            summaries.map(item => (
                              <tr key={item.id}>
                                <td>{item.label}</td>
                                <td className="text-right">{formatNumber(item.physicalQuantity)}</td>
                                <td className="text-right">{formatNumber(item.reservedQuantity)}</td>
                                <td className="text-right">{formatNumber(item.availableQuantity)}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                        {summaries.length > 0 && (
                          <tfoot>
                            <tr className="font-weight-bold">
                              <td>Total</td>
                              <td className="text-right">{formatNumber(totals.physicalQuantity)}</td>
                              <td className="text-right">{formatNumber(totals.reservedQuantity)}</td>
                              <td className="text-right">{formatNumber(totals.availableQuantity)}</td>
                            </tr>
                          </tfoot>
                        )}
                      </table>
                    </div>
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

export default StockResumePage;
