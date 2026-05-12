import { Link } from 'react-router-dom';
import FrontofficeLayout from '../../../components/UI/Navigation/frontoffice/FrontofficeLayout';
import { useFrontofficeAuth } from '../../../services/frontoffice/authService';
import { useMyOrdersStatus } from '../../../hooks/frontoffice/orders/useMyOrdersStatus';

function MyOrdersFrontoffice() {
  const { customer } = useFrontofficeAuth();
  const { data, loading, error } = useMyOrdersStatus(customer?.id ?? null);

  if (!customer) {
    return (
      <FrontofficeLayout title="Mes commandes">
        <div className="alert alert-warning" role="alert">
          Veuillez vous connecter pour consulter vos commandes.
        </div>
        <Link to="/frontoffice/login" className="btn btn-primary">
          Se connecter
        </Link>
      </FrontofficeLayout>
    );
  }

  return (
    <FrontofficeLayout title="Mes commandes">
      {loading && <div className="text-center py-4">Chargement...</div>}

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {!loading && !error && data.length === 0 && (
        <div className="alert alert-info" role="alert">
          Aucune commande trouvée. <Link to="/frontoffice/produits">Voir les produits</Link>
        </div>
      )}

      {!loading && !error && data.length > 0 && (
        <div className="card shadow mb-4">
          <div className="card-header py-3">
            <h6 className="m-0 font-weight-bold text-primary">Historique de mes commandes</h6>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-bordered table-hover" width="100%" cellSpacing="0">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Reference</th>
                    <th>Etat</th>
                    <th>Paiement</th>
                    <th>Total TTC</th>
                    <th>Date</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {data.map(item => (
                    <tr key={item.order.id}>
                      <td>{item.order.id}</td>
                      <td>{item.order.reference}</td>
                      <td>
                        <span
                          className="badge"
                          style={{ backgroundColor: item.statusColor, color: '#fff' }}
                          title={item.statusId ? `ID ${item.statusId}` : 'Etat inconnu'}
                        >
                          {item.statusName}
                        </span>
                      </td>
                      <td>{item.order.payment}</td>
                      <td>{item.order.total_paid_tax_incl.toFixed(2)} €</td>
                      <td>{item.order.date_add}</td>
                      <td>
                        <Link className="btn btn-sm btn-primary" to={`/frontoffice/commande/${item.order.id}`}>
                          Voir
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </FrontofficeLayout>
  );
}

export default MyOrdersFrontoffice;
