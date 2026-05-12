import { Link, useParams } from 'react-router-dom';
import FrontofficeLayout from '../../../components/UI/Navigation/frontoffice/FrontofficeLayout';

function OrderConfirmation() {
  const { orderId } = useParams<{ orderId: string }>();

  return (
    <FrontofficeLayout title="Confirmation">
      <div className="card shadow mb-4">
        <div className="card-body">
          <h5 className="text-gray-900 mb-3">Commande confirmee</h5>
          <p className="text-gray-700 mb-2">
            Votre commande a bien ete enregistree.
          </p>
          <p className="text-gray-700 mb-4">
            Numero de commande: <strong>#{orderId}</strong>
          </p>
          <div className="mb-3">Paiement: Paiement a la livraison</div>
          <Link to="/frontoffice/produits" className="btn btn-primary">
            Retour au catalogue
          </Link>
        </div>
      </div>
    </FrontofficeLayout>
  );
}

export default OrderConfirmation;
