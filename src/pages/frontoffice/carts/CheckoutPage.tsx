import { Link } from 'react-router-dom';
import FrontofficeLayout from '../../../components/UI/Navigation/frontoffice/FrontofficeLayout';
import { useCheckoutPage } from '../../../hooks/frontoffice/carts/useCheckoutPage';

const getLangValue = (map: Record<number, string>, preferred = 1): string =>
  map[preferred] ?? Object.values(map)[0] ?? '';

function CheckoutPage() {
  const {
    customer,
    addresses,
    selectedAddressId,
    setSelectedAddressId,
    selectedCarrierId,
    selectedCarrier,
    details,
    totals,
    loading,
    placing,
    error,
    handlePlaceOrder,
  } = useCheckoutPage();

  if (!customer) {
    return (
      <FrontofficeLayout title="Checkout">
        <div className="alert alert-warning" role="alert">
          Veuillez vous connecter pour finaliser votre commande.
        </div>
        <Link to="/frontoffice/login" className="btn btn-primary">
          Se connecter
        </Link>
      </FrontofficeLayout>
    );
  }

  return (
    <FrontofficeLayout title="Checkout">
      {loading && <div className="text-center py-4">Chargement...</div>}

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {!loading && (!details || details.cart.cart_rows.length === 0) && (
        <div className="alert alert-info" role="alert">
          Votre panier est vide. <Link to="/frontoffice/produits">Retour aux produits</Link>
        </div>
      )}

      {!loading && details && details.cart.cart_rows.length > 0 && (
        <div className="row">
          <div className="col-lg-7">
            <div className="card shadow mb-4">
              <div className="card-header py-3">
                <h6 className="m-0 font-weight-bold text-primary">Livraison</h6>
              </div>
              <div className="card-body">
                {selectedCarrier ? (
                  <div>
                    <div className="text-gray-800 font-weight-bold">{selectedCarrier.name}</div>
                    <div className="small text-gray-500">
                      {getLangValue(selectedCarrier.delay)}
                    </div>
                    <div className="small text-gray-500 mt-2">Frais: 0.00 EUR</div>
                  </div>
                ) : (
                  <div className="text-gray-500">Aucun transporteur disponible.</div>
                )}
              </div>
            </div>

            <div className="card shadow mb-4">
              <div className="card-header py-3">
                <h6 className="m-0 font-weight-bold text-primary">Adresse de livraison</h6>
              </div>
              <div className="card-body">
                {addresses.length === 0 && (
                  <div className="alert alert-warning" role="alert">
                    Aucune adresse disponible pour ce compte.
                    <div className="mt-3">
                      <Link to="/frontoffice/adresses/nouveau" className="btn btn-sm btn-primary">
                        Ajouter une adresse
                      </Link>
                    </div>
                  </div>
                )}
                {addresses.length > 0 && (
                  <select
                    className="form-control"
                    value={selectedAddressId ?? ''}
                    onChange={event => setSelectedAddressId(Number(event.target.value))}
                  >
                    {addresses.map(address => (
                      <option key={address.id} value={address.id}>
                        {address.alias} - {address.address1}, {address.postcode} {address.city}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            <div className="card shadow mb-4">
              <div className="card-header py-3">
                <h6 className="m-0 font-weight-bold text-primary">Paiement</h6>
              </div>
              <div className="card-body">
                <div className="custom-control custom-radio">
                  <input
                    type="radio"
                    id="payment-cod"
                    className="custom-control-input"
                    checked
                    readOnly
                  />
                  <label className="custom-control-label" htmlFor="payment-cod">
                    Paiement a la livraison
                  </label>
                </div>
                <div className="small text-gray-500 mt-2">Aucun frais de livraison.</div>
              </div>
            </div>
          </div>

          <div className="col-lg-5">
            <div className="card shadow mb-4">
              <div className="card-header py-3">
                <h6 className="m-0 font-weight-bold text-primary">Recapitulatif</h6>
              </div>
              <div className="card-body">
                <div className="d-flex justify-content-between mb-2">
                  <span>Total HT</span>
                  <span>{totals.totalHt.toFixed(2)} EUR</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>TVA</span>
                  <span>{(totals.totalTtc - totals.totalHt).toFixed(2)} EUR</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Livraison</span>
                  <span>0.00 EUR</span>
                </div>
                <div className="d-flex justify-content-between font-weight-bold">
                  <span>Total TTC</span>
                  <span>{totals.totalTtc.toFixed(2)} EUR</span>
                </div>

                <button
                  type="button"
                  className="btn btn-primary btn-block mt-4"
                  onClick={handlePlaceOrder}
                  disabled={placing || !selectedAddressId || !selectedCarrierId}
                >
                  {placing ? 'Validation...' : 'Valider la commande'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </FrontofficeLayout>
  );
}

export default CheckoutPage;
