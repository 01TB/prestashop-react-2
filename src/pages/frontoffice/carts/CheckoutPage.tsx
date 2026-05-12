import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import FrontofficeLayout from '../../../components/UI/Navigation/frontoffice/FrontofficeLayout';
import { useFrontofficeAuth } from '../../../services/frontoffice/authService';
import {
  clearCartStorage,
  getStoredCartId,
  loadCartDetails,
  updateCartMetadata,
} from '../../../services/frontoffice/cartService';
import { listAddresses } from '../../../resources/addresses/addresses.service';
import { listCarriers } from '../../../resources/carriers/carriers.service';
import { createOrder } from '../../../resources/orders/orders.service';
import type { AddressOutput } from '../../../resources/addresses/addresses.types';
import type { CarrierOutput } from '../../../resources/carriers/carriers.types';
import type { OrderCreateInput } from '../../../resources/orders/orders.types';

const getLangValue = (map: Record<number, string>, preferred = 1): string =>
  map[preferred] ?? Object.values(map)[0] ?? '';

function CheckoutPage() {
  const navigate = useNavigate();
  const { customer } = useFrontofficeAuth();
  const [addresses, setAddresses] = useState<AddressOutput[]>([]);
  const [carriers, setCarriers] = useState<CarrierOutput[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [selectedCarrierId, setSelectedCarrierId] = useState<number | null>(null);
  const [details, setDetails] = useState<Awaited<ReturnType<typeof loadCartDetails>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedCarrier = carriers.find(carrier => carrier.id === selectedCarrierId);

  useEffect(() => {
    let isActive = true;

    const load = async () => {
      const cartId = getStoredCartId();
      if (!cartId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const loaded = await loadCartDetails(cartId);
        if (!isActive) return;
        setDetails(loaded);

        if (customer) {
          const addressList = await listAddresses({
            'filter[id_customer]': `[${customer.id}]`,
          });
          if (!isActive) return;
          setAddresses(addressList);
          setSelectedAddressId(addressList[0]?.id ?? null);
        }

        const carrierList = await listCarriers({
          'filter[active]': '1',
        });
        if (!isActive) return;
        setCarriers(carrierList);
        setSelectedCarrierId(carrierList[0]?.id ?? null);
      } catch (err: unknown) {
        if (!isActive) return;
        if (err && typeof err === 'object' && 'message' in err) {
          setError(String((err as { message?: string }).message ?? 'Erreur inconnue'));
        } else {
          setError('Erreur inconnue');
        }
      } finally {
        if (isActive) setLoading(false);
      }
    };

    load();
    return () => {
      isActive = false;
    };
  }, [customer]);

  const totals = useMemo(() => {
    if (!details) return { totalHt: 0, totalTtc: 0 };
    const totalTtc = details.cart.cart_rows.reduce((sum, row) => {
      const product = details.productsById[row.id_product];
      const combination = row.id_product_attribute
        ? details.combinationsById[row.id_product_attribute]
        : undefined;
      const unitPriceHt = (product?.price ?? 0) + (combination?.price ?? 0);
      return sum + unitPriceHt * 1.2 * row.quantity;
    }, 0);
    return { totalHt: totalTtc / 1.2, totalTtc };
  }, [details]);

  const handlePlaceOrder = async () => {
    if (!details || !customer) {
      setError('Informations manquantes pour finaliser la commande.');
      return;
    }
    if (!selectedAddressId) {
      setError('Veuillez choisir une adresse.');
      return;
    }
    if (!selectedCarrierId) {
      setError('Aucun transporteur disponible.');
      return;
    }

    setPlacing(true);
    setError(null);

    try {
      const cart = details.cart;
      await updateCartMetadata(cart, {
        id_address_delivery: selectedAddressId,
        id_address_invoice: selectedAddressId,
        id_carrier: selectedCarrierId,
        id_customer: customer.id,
        id_guest: 0,
        secure_key: customer.secure_key,
      });

      const orderRows = cart.cart_rows.map(row => ({
        product_id: row.id_product,
        product_attribute_id: row.id_product_attribute,
        product_quantity: row.quantity,
        id_customization: row.id_customization,
      }));

      const payload: OrderCreateInput = {
        id_address_delivery: selectedAddressId,
        id_address_invoice: selectedAddressId,
        id_cart: cart.id,
        id_currency: cart.id_currency || 1,
        id_lang: cart.id_lang || 1,
        id_customer: customer.id,
        id_carrier: selectedCarrierId,
        module: 'ps_cashondelivery',
        payment: 'Paiement a la livraison',
        total_paid: totals.totalTtc,
        total_paid_real: 0,
        total_products: totals.totalHt,
        total_products_wt: totals.totalTtc,
        conversion_rate: 1,
        total_paid_tax_incl: totals.totalTtc,
        total_paid_tax_excl: totals.totalHt,
        total_shipping: 0,
        total_shipping_tax_incl: 0,
        total_shipping_tax_excl: 0,
        total_discounts: 0,
        total_discounts_tax_incl: 0,
        total_discounts_tax_excl: 0,
        carrier_tax_rate: 0,
        total_wrapping: 0,
        total_wrapping_tax_incl: 0,
        total_wrapping_tax_excl: 0,
        current_state: 13,
        secure_key: customer.secure_key,
        order_rows: orderRows,
      };

      const orderId = await createOrder(payload);
      clearCartStorage();
      navigate(`/frontoffice/commande/${orderId}`);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'message' in err) {
        setError(String((err as { message?: string }).message ?? 'Erreur inconnue'));
      } else {
        setError('Erreur inconnue');
      }
    } finally {
      setPlacing(false);
    }
  };

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
                  <span>TVA (20%)</span>
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
