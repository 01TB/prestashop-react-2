import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFrontofficeAuth } from '../../../services/frontoffice/authentication/authService.tsx';
import {
    clearCartStorage,
    getStoredCartId,
    loadCartDetails,
    updateCartMetadata,
} from '../../../services/frontoffice/carts/cartService.ts';
import { listAddresses } from '../../../resources/addresses/addresses.service';
import { listCarriers } from '../../../resources/carriers/carriers.service';
import { createOrder } from '../../../resources/orders/orders.service';
import { getProductMyPrice } from "../../../resources/products/products.service.ts";
import type { AddressOutput } from '../../../resources/addresses/addresses.types';
import type { CarrierOutput } from '../../../resources/carriers/carriers.types';
import type { OrderCreateInput } from '../../../resources/orders/orders.types';

// Utilitaire pour la clé unique par ligne
const buildRowKey = (row: { id_product: number; id_product_attribute: number }) =>
    `${row.id_product}-${row.id_product_attribute}`;

// Interface étendue pour inclure les prix récupérés
interface LoadedDetailsWithPrices extends Awaited<ReturnType<typeof loadCartDetails>> {
    pricesByKey: Record<string, { unitPriceHt: number; unitPriceTtc: number }>;
}

export interface UseCheckoutPageResult {
    customer: ReturnType<typeof useFrontofficeAuth>['customer'];
    addresses: AddressOutput[];
    carriers: CarrierOutput[];
    selectedAddressId: number | null;
    selectedCarrierId: number | null;
    setSelectedAddressId: (id: number | null) => void;
    setSelectedCarrierId: (id: number | null) => void;
    selectedCarrier: CarrierOutput | undefined;
    details: LoadedDetailsWithPrices | null;
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

    const [addresses, setAddresses] = useState<AddressOutput[]>([]);
    const [carriers, setCarriers] = useState<CarrierOutput[]>([]);
    const [selectedAddressId, setSelectedAddressIdState] = useState<number | null>(null);
    const [selectedCarrierId, setSelectedCarrierIdState] = useState<number | null>(null);
    const [details, setDetails] = useState<LoadedDetailsWithPrices | null>(null);
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
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const loaded = await loadCartDetails(cartId);
                if (!isActive) return;

                // --- Récupération des prix spécifiques via l'API ---
                const pricesByKey: Record<string, { unitPriceHt: number; unitPriceTtc: number }> = {};

                await Promise.all(loaded.cart.cart_rows.map(async (row) => {
                    const key = buildRowKey(row);

                    // Appels parallèles pour HT et TTC pour optimiser le temps de chargement
                    const [resHt, resTtc] = await Promise.all([
                        getProductMyPrice(row.id_product, {
                            'price[my_price][use_tax]': '0',
                            'price[my_price][use_reduction]': '0', // On active les réductions ici
                            'price[my_price][product_attribute]': String(row.id_product_attribute),
                            'price[my_price][id_country]': '8'
                        }),
                        getProductMyPrice(row.id_product, {
                            'price[my_price][use_tax]': '1',
                            'price[my_price][use_reduction]': '0',
                            'price[my_price][product_attribute]': String(row.id_product_attribute),
                            'price[my_price][id_country]': '8'
                        })
                    ]);

                    pricesByKey[key] = {
                        unitPriceHt: resHt.my_price,
                        unitPriceTtc: resTtc.my_price
                    };
                }));

                if (!isActive) return;
                setDetails({ ...loaded, pricesByKey });

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
                setError(err instanceof Error ? err.message : 'Erreur inconnue');
            } finally {
                if (isActive) setLoading(false);
            }
        };

        load();
        return () => { isActive = false; };
    }, [customer]);

    const totals = useMemo(() => {
        if (!details) return { totalHt: 0, totalTtc: 0 };

        return details.cart.cart_rows.reduce(
            (sum, row) => {
                const key = buildRowKey(row);
                const prices = details.pricesByKey[key];

                const unitPriceHt = prices?.unitPriceHt ?? 0;
                const unitPriceTtc = prices?.unitPriceTtc ?? 0;

                return {
                    totalHt: sum.totalHt + unitPriceHt * row.quantity,
                    totalTtc: sum.totalTtc + unitPriceTtc * row.quantity,
                };
            },
            { totalHt: 0, totalTtc: 0 }
        );
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

            // Mise à jour du panier avec l'adresse et le transporteur avant création de commande
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
                payment: 'Paiement à la livraison',
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
            clearCartStorage();
            navigate(`/frontoffice/commande/${orderId}`);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Erreur inconnue lors du placement de la commande');
        } finally {
            setPlacing(false);
        }
    };

    const setSelectedAddressId = (id: number | null) => setSelectedAddressIdState(id);
    const setSelectedCarrierId = (id: number | null) => setSelectedCarrierIdState(id);

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