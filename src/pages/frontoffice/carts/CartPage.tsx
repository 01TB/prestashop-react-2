import { Link } from 'react-router-dom';
import FrontofficeLayout from '../../../components/UI/Navigation/frontoffice/FrontofficeLayout';
import { useCartPage } from '../../../hooks/frontoffice/carts/useCartPage';

const getLangValue = (map: Record<number, string>, preferred = 1): string =>
  map[preferred] ?? Object.values(map)[0] ?? '';

function CartPage() {
  const {
    cart,
    items,
    totals,
    quantities,
    loading,
    saving,
    error,
    handleQuantityChange,
    applyRowUpdate,
    handleCheckout,
  } = useCartPage();

  return (
    <FrontofficeLayout title="Panier">
      {loading && <div className="text-center py-4">Chargement...</div>}

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {!loading && (!cart || cart.cart_rows.length === 0) && (
        <div className="alert alert-info" role="alert">
          Votre panier est vide. <Link to="/frontoffice/produits">Voir les produits</Link>
        </div>
      )}

      {!loading && cart && cart.cart_rows.length > 0 && (
        <div className="row">
          <div className="col-lg-8">
            <div className="card shadow mb-4">
              <div className="card-header py-3">
                <h6 className="m-0 font-weight-bold text-primary">Articles</h6>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-bordered" width="100%">
                    <thead className="thead-light">
                      <tr>
                        <th>Produit</th>
                        <th>Quantite</th>
                        <th>Prix TTC</th>
                        <th>Total</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map(item => {
                        const key = item.key;
                        return (
                          <tr key={key}>
                            <td>
                              <div className="d-flex align-items-center">
                                {item.imageUrl && (
                                  <img
                                    src={item.imageUrl}
                                    alt={item.product ? getLangValue(item.product.name) : 'Produit'}
                                    style={{ width: '64px', height: '64px', objectFit: 'cover' }}
                                    className="mr-3 rounded"
                                  />
                                )}
                                <div>
                                  <div className="font-weight-bold text-gray-800">
                                    {item.product ? getLangValue(item.product.name) : `Produit #${item.row.id_product}`}
                                  </div>
                                  {item.optionLabels && (
                                    <div className="small text-gray-500">{item.optionLabels}</div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td style={{ width: '120px' }}>
                              <input
                                type="number"
                                min={0}
                                className="form-control form-control-sm"
                                value={quantities[key] ?? item.row.quantity}
                                onChange={event => handleQuantityChange(key, Number(event.target.value))}
                              />
                            </td>
                            <td>{item.unitPriceTtc.toFixed(2)} EUR</td>
                            <td>{item.lineTotalTtc.toFixed(2)} EUR</td>
                            <td className="text-center">
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-primary mr-2"
                                onClick={() => applyRowUpdate(item.row)}
                                disabled={saving}
                              >
                                Mettre a jour
                              </button>
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => {
                                  handleQuantityChange(key, 0);
                                  applyRowUpdate(item.row, 0);
                                }}
                                disabled={saving}
                              >
                                Retirer
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
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
                <div className="d-flex justify-content-between font-weight-bold">
                  <span>Total TTC</span>
                  <span>{totals.totalTtc.toFixed(2)} EUR</span>
                </div>

                <button
                  type="button"
                  className="btn btn-primary btn-block mt-4"
                  onClick={handleCheckout}
                  disabled={saving}
                >
                  Passer la commande
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </FrontofficeLayout>
  );
}

export default CartPage;
