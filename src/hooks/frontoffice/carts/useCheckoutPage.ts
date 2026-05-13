import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFrontofficeAuth } from '../../../services/frontoffice/authService';
// import { useOrderPostProcessing } from '../orders/useOrderPostProcessing';
import {
  clearCartStorage,
  getStoredCartId,
  loadCartDetails,
  updateCartMetadata,
} from '../../../services/frontoffice/cartService';
import { listAddresses } from '../../../resources/addresses/addresses.service';
import { listCarriers } from '../../../resources/carriers/carriers.service';
import { createOrder } from '../../../resources/orders/orders.service';
import { listTaxRules } from '../../../resources/tax_rules/tax_rules.service';
import { listTaxes } from '../../../resources/taxes/taxes.service';
import type { AddressOutput } from '../../../resources/addresses/addresses.types';
import type { CarrierOutput } from '../../../resources/carriers/carriers.types';
import type { OrderCreateInput } from '../../../resources/orders/orders.types';

export interface UseCheckoutPageResult {
  customer: ReturnType<typeof useFrontofficeAuth>['customer'];
  addresses: AddressOutput[];
  carriers: CarrierOutput[];
  selectedAddressId: number | null;
  selectedCarrierId: number | null;
  setSelectedAddressId: (id: number | null) => void;
  setSelectedCarrierId: (id: number | null) => void;
  selectedCarrier: CarrierOutput | undefined;
  details: Awaited<ReturnType<typeof loadCartDetails>> | null;
  totals: {
    totalHt: number;
    totalTtc: number;
  };
  loading: boolean;
  placing: boolean;
  error: string | null;
  handlePlaceOrder: () => Promise<void>;
}

export function useCheckoutPage(): UseCheckoutPageResult {
  const navigate = useNavigate();
  const { customer } = useFrontofficeAuth();
  // const { processOrder } = useOrderPostProcessing();

  const [addresses, setAddresses] = useState<AddressOutput[]>([]);
  const [carriers, setCarriers] = useState<CarrierOutput[]>([]);
  const [selectedAddressId, setSelectedAddressIdState] = useState<number | null>(null);
  const [selectedCarrierId, setSelectedCarrierIdState] = useState<number | null>(null);
  const [details, setDetails] = useState<Awaited<ReturnType<typeof loadCartDetails>> | null>(null);
  const [taxRateByGroup, setTaxRateByGroup] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedCarrier = carriers.find(carrier => carrier.id === selectedCarrierId);

  useEffect(() => {
    let isActive = true;

    const load = async () => {
      const cartId = getStoredCartId();
      if (!cartId) {
        setDetails(null);
        setTaxRateByGroup({});
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const loaded = await loadCartDetails(cartId);
        if (!isActive) return;
        setDetails(loaded);

        const groupIds = Array.from(
          new Set(
            loaded.cart.cart_rows
              .map(row => loaded.productsById[row.id_product]?.id_tax_rules_group ?? 0)
              .filter(id => id > 0)
          )
        );

        const nextTaxRateByGroup: Record<number, number> = {};
        if (groupIds.length > 0) {
          const taxRules = await listTaxRules({
            'filter[id_tax_rules_group]': `[${groupIds.join('|')}]`,
            'filter[id_country]': '8',
            display: '[id,id_tax_rules_group,id_tax,id_country,id_state,zipcode_from,zipcode_to]',
          });

          const taxIds = Array.from(new Set(taxRules.map(rule => rule.id_tax).filter(id => id > 0)));
          if (taxIds.length > 0) {
            const taxes = await listTaxes({
              'filter[id]': `[${taxIds.join('|')}]`,
              display: '[id,rate]',
            });

            const rateByTaxId = new Map(taxes.map(tax => [tax.id, tax.rate]));
            const rulesByGroup = new Map<number, typeof taxRules>();

            for (const rule of taxRules) {
              const groupRules = rulesByGroup.get(rule.id_tax_rules_group) ?? [];
              groupRules.push(rule);
              rulesByGroup.set(rule.id_tax_rules_group, groupRules);
            }

            for (const [groupId, rules] of rulesByGroup.entries()) {
              const selectedRule =
                rules.find(rule => rule.id_state === 0 && !rule.zipcode_from && !rule.zipcode_to) ??
                rules.find(rule => rule.id_state === 0) ??
                rules[0];
              nextTaxRateByGroup[groupId] = selectedRule
                ? rateByTaxId.get(selectedRule.id_tax) ?? 0
                : 0;
            }
          }
        }
        if (!isActive) return;
        setTaxRateByGroup(nextTaxRateByGroup);

        if (customer) {
          const addressList = await listAddresses({
            'filter[id_customer]': `[${customer.id}]`,
          });
          if (!isActive) return;
          setAddresses(addressList);
          setSelectedAddressIdState(addressList[0]?.id ?? null);
        }

        const carrierList = await listCarriers({
          'filter[active]': '1',
        });
        if (!isActive) return;
        setCarriers(carrierList);
        setSelectedCarrierIdState(carrierList[0]?.id ?? null);
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

    return details.cart.cart_rows.reduce(
      (sum, row) => {
        const product = details.productsById[row.id_product];
        const combination = row.id_product_attribute
          ? details.combinationsById[row.id_product_attribute]
          : undefined;
        const unitPriceHt = (product?.price ?? 0) + (combination?.price ?? 0);
        const taxRate = taxRateByGroup[product?.id_tax_rules_group ?? 0] ?? 0;
        const unitPriceTtc = unitPriceHt * (1 + taxRate / 100);

        return {
          totalHt: sum.totalHt + unitPriceHt * row.quantity,
          totalTtc: sum.totalTtc + unitPriceTtc * row.quantity,
        };
      },
      { totalHt: 0, totalTtc: 0 }
    );
  }, [details, taxRateByGroup]);

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
        secure_key: customer.secure_key,
        order_rows: orderRows,
      };

      const orderId = await createOrder(payload);
      // await processOrder(orderId);
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

  const setSelectedAddressId = (id: number | null) => {
    setSelectedAddressIdState(id);
  };

  const setSelectedCarrierId = (id: number | null) => {
    setSelectedCarrierIdState(id);
  };

  return {
    customer,
    addresses,
    carriers,
    selectedAddressId,
    selectedCarrierId,
    setSelectedAddressId,
    setSelectedCarrierId,
    selectedCarrier,
    details,
    totals,
    loading,
    placing,
    error,
    handlePlaceOrder,
  };
}
