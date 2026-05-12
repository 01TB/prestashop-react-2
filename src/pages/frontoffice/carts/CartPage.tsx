import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import FrontofficeLayout from '../../../components/UI/Navigation/frontoffice/FrontofficeLayout';
import {
  getStoredCartId,
  loadCartDetails,
  updateCartRows,
} from '../../../services/frontoffice/cartService';
import type { CartRowInput, CartOutput } from '../../../resources/carts/carts.types';

const getLangValue = (map: Record<number, string>, preferred = 1): string =>
  map[preferred] ?? Object.values(map)[0] ?? '';

const getGroupLabel = (group: { public_name: Record<number, string>; name: Record<number, string> }) => {
  const source = Object.keys(group.public_name).length > 0 ? group.public_name : group.name;
  return getLangValue(source);
};

const buildRowKey = (row: { id_product: number; id_product_attribute: number }) =>
  `${row.id_product}-${row.id_product_attribute}`;

function CartPage() {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartOutput | null>(null);
  const [details, setDetails] = useState<Awaited<ReturnType<typeof loadCartDetails>> | null>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    const cartId = getStoredCartId();
    if (!cartId) {
      setCart(null);
      setDetails(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const loaded = await loadCartDetails(cartId);
      setCart(loaded.cart);
      setDetails(loaded);

      const nextQuantities: Record<string, number> = {};
      for (const row of loaded.cart.cart_rows) {
        nextQuantities[buildRowKey(row)] = row.quantity;
      }
      setQuantities(nextQuantities);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'message' in err) {
        setError(String((err as { message?: string }).message ?? 'Erreur inconnue'));
      } else {
        setError('Erreur inconnue');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const items = useMemo(() => {
    if (!details) return [];
    const { cart: currentCart, productsById, combinationsById, optionValuesById, optionGroupsById } = details;

    return currentCart.cart_rows.map(row => {
      const product = productsById[row.id_product];
      const combination = row.id_product_attribute
        ? combinationsById[row.id_product_attribute]
        : undefined;
      const imageId = combination?.images?.[0] ?? product?.id_default_image ?? 0;
      const imageUrl = imageId && product ? `/api/images/products/${product.id}/${imageId}` : null;

      const unitPriceHt = (product?.price ?? 0) + (combination?.price ?? 0);
      const unitPriceTtc = unitPriceHt * 1.2;
      const lineTotalTtc = unitPriceTtc * row.quantity;

      const optionLabels = (combination?.product_option_values ?? [])
        .map(valueId => {
          const value = optionValuesById[valueId];
          const group = value ? optionGroupsById[value.id_attribute_group] : undefined;
          if (!value || !group) return '';
          return `${getGroupLabel(group)}: ${getLangValue(value.name)}`;
        })
        .filter(Boolean)
        .join(' / ');

      return {
        row,
        product,
        combination,
        imageUrl,
        unitPriceTtc,
        lineTotalTtc,
        optionLabels,
      };
    });
  }, [details]);

  const totals = useMemo(() => {
    const total = items.reduce((sum, item) => sum + item.lineTotalTtc, 0);
    return {
      totalTtc: total,
      totalHt: total / 1.2,
    };
  }, [items]);

  const handleQuantityChange = (key: string, value: number) => {
    setQuantities(current => ({ ...current, [key]: Math.max(0, value) }));
  };

  const applyRowUpdate = async (row: CartRowInput, overrideQuantity?: number) => {
    if (!cart) return;
    const key = buildRowKey(row);
    const nextQuantity = overrideQuantity ?? quantities[key] ?? row.quantity;

    const nextRows = cart.cart_rows
      .map(existing =>
        buildRowKey(existing) === key
          ? { ...existing, quantity: nextQuantity }
          : existing
      )
      .filter(item => item.quantity > 0);

    setSaving(true);
    setError(null);

    try {
      const updated = await updateCartRows(cart, nextRows);
      setCart(updated);
      await load();
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'message' in err) {
        setError(String((err as { message?: string }).message ?? 'Erreur inconnue'));
      } else {
        setError('Erreur inconnue');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCheckout = () => {
    navigate('/frontoffice/checkout');
  };

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
                        const key = buildRowKey(item.row);
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
                  <span>TVA (20%)</span>
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
