import SidebarBackoffice from "../../../components/UI/Navigation/backoffice/SidebarBackoffice";
import TopbarBackoffice from "../../../components/UI/Navigation/backoffice/TopbarBackoffice";
import PageHeading from "../../../components/UI/Heading/PageHeading";
import { useMemo, useState } from 'react';
import { useDashboard } from "../../../hooks/backoffice/dashboard/useDashboard";

function DashboardPage() {
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });

  const { loading, totalGeneral, totalOrders, totalAmount } = useDashboard(selectedDate);

  const selectedDateLabel = useMemo(() => selectedDate || 'aujourd\'hui', [selectedDate]);

  return (
    <div>
      <div id="wrapper">
        <SidebarBackoffice />
        <div id="content-wrapper" className="d-flex flex-column">
          <div id="content">
            <TopbarBackoffice />
            <div className="container-fluid">
              <PageHeading title="Dashboard" />

                <div className="card shadow mb-4">
                    <div className="card-body">
                        <div className="col-md-12">
                            <div className="card shadow mb-6">
                                <div className="card-body">
                                    <div className="small text-muted">Total Général</div>
                                    <div className="h3">{loading ? '…' : `${totalGeneral.toFixed(2)} €`}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

              <div className="card shadow mb-4">
                <div className="card-body">
                  <div className="row align-items-end">
                    <div className="col-md-4">
                      <label className="text-gray-700" htmlFor="dashboard-date">
                        Date de référence
                      </label>
                      <input
                        id="dashboard-date"
                        type="date"
                        className="form-control"
                        value={selectedDate}
                        onChange={event => setSelectedDate(event.target.value)}
                      />
                    </div>
                    <div className="col-md-8">
                      <div className="small text-muted mt-2 mt-md-0">
                        Filtrage appliqué sur la date sélectionnée et la veille.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="row mb-4">
                <div className="col-md-6">
                  <div className="card shadow mb-4">
                    <div className="card-body">
                      <div className="small text-muted">Nombre de Commandes</div>
                      <div className="h3">{loading ? '…' : totalOrders}</div>
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="card shadow mb-4">
                    <div className="card-body">
                      <div className="small text-muted">Montant total (TTC) - ({selectedDateLabel})</div>
                      <div className="h3">{loading ? '…' : `${totalAmount.toFixed(2)} €`}</div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
          <footer className="sticky-footer bg-white">
            <div className="container my-auto">
              <div className="copyright text-center my-auto">
                <span>© Prestashop Backoffice</span>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
