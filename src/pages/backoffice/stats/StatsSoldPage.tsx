import SidebarBackoffice from '../../../components/UI/Navigation/backoffice/SidebarBackoffice';
import TopbarBackoffice from '../../../components/UI/Navigation/backoffice/TopbarBackoffice';
import PageHeading from '../../../components/UI/Heading/PageHeading';
import { useSalesStatsSold } from '../../../hooks/backoffice/stats/useSalesStatsSold';

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);

function StatsSoldPage() {
  const {
    loading,
    error,
    totalSalesHt,
    totalPurchasesHt,
    totalProfitHt,
    categoryRows,
  } = useSalesStatsSold();

  return (
    <div>
      <div id="wrapper">
        <SidebarBackoffice />

        <div id="content-wrapper" className="d-flex flex-column">
          <div id="content">
            <TopbarBackoffice />

            <div className="container-fluid">
              <PageHeading title="Statistiques (stock vendu)" />

              <div className="card shadow mb-4">
                <div className="card-header py-3 d-flex flex-column flex-md-row align-items-md-center justify-content-between">
                  <h6 className="m-0 font-weight-bold text-primary">Resume global</h6>
                  <div className="text-muted small mt-2 mt-md-0">
                    Base uniquement sur le stock vendu (commandes annulees exclues).
                  </div>
                </div>
                <div className="card-body">
                  {loading && <div className="text-center py-4">Chargement...</div>}

                  {error && (
                    <div className="alert alert-danger" role="alert">
                      {error}
                    </div>
                  )}

                  {!loading && !error && (
                    <div className="row">
                      <div className="col-xl-4 col-md-6 mb-3">
                        <div className="card border-left-primary shadow h-100 py-2">
                          <div className="card-body">
                            <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                              Total ventes (HT)
                            </div>
                            <div className="h5 mb-0 font-weight-bold text-gray-800">
                              {formatCurrency(totalSalesHt)}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="col-xl-4 col-md-6 mb-3">
                        <div className="card border-left-warning shadow h-100 py-2">
                          <div className="card-body">
                            <div className="text-xs font-weight-bold text-warning text-uppercase mb-1">
                              Total achats (HT)
                            </div>
                            <div className="h5 mb-0 font-weight-bold text-gray-800">
                              {formatCurrency(totalPurchasesHt)}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="col-xl-4 col-md-6 mb-3">
                        <div className="card border-left-success shadow h-100 py-2">
                          <div className="card-body">
                            <div className="text-xs font-weight-bold text-success text-uppercase mb-1">
                              Benefice (HT)
                            </div>
                            <div className="h5 mb-0 font-weight-bold text-gray-800">
                              {formatCurrency(totalProfitHt)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="card shadow mb-4">
                <div className="card-header py-3">
                  <h6 className="m-0 font-weight-bold text-primary">Benefice par categorie (stock vendu)</h6>
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
                            <th className="text-right">Ventes (HT)</th>
                            <th className="text-right">Achats (HT)</th>
                            <th className="text-right">Benefice (HT)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {categoryRows.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="text-center text-muted py-4">
                                Aucune statistique disponible.
                              </td>
                            </tr>
                          ) : (
                            categoryRows.map(row => (
                              <tr key={row.id}>
                                <td>{row.label}</td>
                                <td className="text-right">{formatCurrency(row.salesHt)}</td>
                                <td className="text-right">{formatCurrency(row.purchasesHt)}</td>
                                <td
                                  className={
                                    row.profitHt < 0
                                      ? 'text-right text-danger font-weight-bold'
                                      : 'text-right text-success font-weight-bold'
                                  }
                                >
                                  {formatCurrency(row.profitHt)}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
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
                <span>Copyright Prestashop Backoffice</span>
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

export default StatsSoldPage;
