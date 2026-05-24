import {listProductOptionValues} from "../../../../resources/product_option_values/product_option_values.service.ts";
import {listCombinations} from "../../../../resources/combinations/combinations.service.ts";
import type {Fichier3Row, ProductCSV} from "../../../../types/import/import.types.ts";
import {createCustomer, getCustomer, listCustomers} from "../../../../resources/customers/customers.service.ts";
import {createCart, getCart, updateCart} from "../../../../resources/carts/carts.service.ts";
import type {CartRowInput} from "../../../../resources/carts/carts.types.ts";
import {createOrder} from "../../../../resources/orders/orders.service.ts";
import {createAddress, listAddresses} from "../../../../resources/addresses/addresses.service.ts";
import type {OrderCreateInput} from "../../../../resources/orders/orders.types.ts";
import {
    getTotalPaidCart,
    postProcessCsvAnnuleOrder, postProcessCsvLivreOrder,
    postProcessCsvPaiementAccepteOrder
} from "../orders/orderCsvProcessingService.ts";
import type {StockOrderOutput} from "./process-stock-movements.ts";
import {parseDateToStringWithHour} from "../../../../utils/date-utils.ts";
import {getProductMyPrice} from "../../../../resources/products/products.service.ts";


function normalizeKey(value: string): string {
    return value.trim().toLowerCase();
}

async function getCombinationMap(
    idProduct: number,
    combinationsByProduct: Map<number, Promise<Map<number, number>>>
): Promise<Map<number, number>> {
    let cached = combinationsByProduct.get(idProduct);
    if (!cached) {
        cached = (async () => {
            const allCombinations = await listCombinations({
                'filter[id_product]': String(idProduct),
            });
            const combinationMap = new Map<number, number>();
            for (const combination of allCombinations) {
                const optionValueIds = combination.product_option_values ?? [];
                for (const optionValueId of optionValueIds) {
                    if (!combinationMap.has(optionValueId)) {
                        combinationMap.set(optionValueId, combination.id);
                    }
                }
            }
            return combinationMap;
        })();
        combinationsByProduct.set(idProduct, cached);
    }
    return cached;
}

async function getCachedProductMyPrice(
    priceCache: Map<string, number>,
    idProduct: number,
    idProductAttribute: number,
    useTax: 0 | 1
): Promise<number> {
    const cacheKey = `${idProduct}:${idProductAttribute}:${useTax}`;
    const cached = priceCache.get(cacheKey);
    if (cached !== undefined) return cached;

    const product = await getProductMyPrice(idProduct, {
        'price[my_price][use_tax]': String(useTax),
        'price[my_price][use_reduction]': '1',
        'price[my_price][product_attribute]': String(idProductAttribute),
        'price[my_price][id_country]': '8',
    });
    priceCache.set(cacheKey, product.my_price);
    return product.my_price;
}

/**
 * Résout l'id_product_attribute (combination) à partir de la référence produit
 * et du karazany (option_value).
 * Retourne 0 si aucune combination spécifique n'est trouvée.
 */
async function resolveCombinationId(
    idProduct: number,
    karazany: string | null | undefined,
    optionValueByName: Map<string, number>,
    combinationsByProduct: Map<number, Promise<Map<number, number>>>
): Promise<number> {
    if (!karazany) return 0;

    const optionValueId = optionValueByName.get(normalizeKey(karazany));
    if (!optionValueId) return 0;

    const combinationMap = await getCombinationMap(idProduct, combinationsByProduct);
    return combinationMap.get(optionValueId) ?? 0;
}

export async function processFile3(
    rows: Fichier3Row[],
    referenceToId: Map<string, ProductCSV>
): Promise<StockOrderOutput[]> {

    const orderOutputs : StockOrderOutput[] = [];

    const allCustomers = await listCustomers();
    const allAddresses = await listAddresses();
    const allOptionValues = await listProductOptionValues();

    const customerByEmail = new Map<string, typeof allCustomers[0]>();
    for (const customer of allCustomers) {
        if (customer.email) {
            customerByEmail.set(customer.email.toLowerCase(), customer);
        }
    }

    const addressByCustomerId = new Map<number, typeof allAddresses[0]>();
    for (const address of allAddresses) {
        addressByCustomerId.set(address.id_customer, address);
    }

    const optionValueByName = new Map<string, number>();
    for (const value of allOptionValues) {
        const name = value.name[1];
        if (!name) continue;
        const key = normalizeKey(name);
        if (!optionValueByName.has(key)) {
            optionValueByName.set(key, value.id);
        }
    }

    const combinationsByProduct = new Map<number, Promise<Map<number, number>>>();
    const priceCache = new Map<string, number>();
    for(const row of rows) {
        // 1. Customer
        const emailKey = row.email.toLowerCase();
        let customer = customerByEmail.get(emailKey);
        if (!customer) {

            const newCustomerId = await createCustomer({
                id_default_group:  3,   // Customers group par défaut PrestaShop
                id_lang: 1,
                firstname: row.nom,
                lastname: row.nom,
                email: row.email,
                passwd: row.pwd,
                id_gender: 1,
                active: true,
                id_shop: 1,
                id_shop_group: 1,
                groups: [ { id: 3 } ]
            });
            customer = await getCustomer(newCustomerId);
            if (customer) {
                allCustomers.push(customer);
                if (customer.email) {
                    customerByEmail.set(customer.email.toLowerCase(), customer);
                }
            }
        }

        // Adresse IMPORTANT BERTHIN
        let address = addressByCustomerId.get(customer.id);
        if(!address) {
            const newAddressId = await createAddress({
                id_customer: customer.id,
                id_country: 8,
                alias: row.email,
                firstname: row.nom,
                lastname: row.nom,
                address1: row.adresse,
                postcode: '102',
                phone: '0000',
                phone_mobile: '0000',
                city: row.adresse,
            });
            address = { id: newAddressId, id_customer: customer!.id } as unknown as typeof allAddresses[0];
            allAddresses.push(address);
            addressByCustomerId.set(customer.id, address);
        }


        // 2. Cart — avec les articles
        const cartRows = await Promise.all(
            row.achats.map(async (item) => {
                const idProduct = referenceToId.get(item.reference)?.product.id;
                if (!idProduct) {
                    console.warn(`Produit introuvable : ${item.reference}`);
                    return null;
                }
                const idCombination = await resolveCombinationId(
                    idProduct,
                    item.karazany,
                    optionValueByName,
                    combinationsByProduct
                );
                return {
                    id_product:           idProduct,
                    id_product_attribute: idCombination,
                    id_address_delivery: 0,
                    quantity:             item.quantite,
                } as CartRowInput;
            })
        );



        const validCartRows = cartRows.filter(Boolean) as CartRowInput[];
        if (validCartRows.length === 0) continue;

        const newIdCart = await createCart({
            id_customer:         customer!.id,
            id_guest:            0,
            id_currency:         1,   // adapter selon la devise configurée
            id_lang:             1,   // adapter selon la langue
            id_carrier:          1,   // adapter selon le transporteur
            id_address_delivery: 0,   // à adapter si l'adresse est gérée
            id_address_invoice:  0,
            cart_rows: validCartRows
        });

        await updateCart(newIdCart, {date_add: parseDateToStringWithHour(row.date)});

        const cart = await getCart(newIdCart);

        // 3. Commandes annulées
        if(row.etat !== null &&  row.etat === 'annulé') {
            const orderRows = cart.cart_rows.map(row => ({
                product_id: row.id_product,
                product_attribute_id: row.id_product_attribute,
                product_quantity: row.quantity,
                id_customization: row.id_customization,
            }));

            const total = await getTotalPaidCart(cart, priceCache);

            const newOrderId = await createOrder({
                id_address_delivery: address.id,
                id_address_invoice: address.id,
                id_cart: cart.id,
                id_currency: 1,
                id_lang: 1,
                id_customer: customer.id,
                id_carrier: 1,
                module: 'ps_cashondelivery',
                payment: 'Paiement a la livraison',

                total_paid:              0,
                total_paid_real:         0,
                total_products:          total.totalHt,
                total_products_wt:       total.totalTtc,
                conversion_rate: 1,
                total_paid_tax_incl: 0,
                total_paid_tax_excl: 0,
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
            } as OrderCreateInput);

            await postProcessCsvAnnuleOrder(newOrderId, address.id, row.date);
        }

        // 3. Commandes payé seulements
        if( row.etat !== null &&  (row.etat === 'paiement accepté' || row.etat === 'paiement effecuté')) {

            const orderRows = cart.cart_rows.map(row => ({
                product_id: row.id_product,
                product_attribute_id: row.id_product_attribute,
                product_quantity: row.quantity,
                id_customization: row.id_customization,
            }));

            const total = await getTotalPaidCart(cart, priceCache);

            const newOrderId = await createOrder({
                id_address_delivery: address.id,
                id_address_invoice: address.id,
                id_cart: cart.id,
                id_currency: 1,
                id_lang: 1,
                id_customer: customer.id,
                id_carrier: 1,
                module: 'ps_cashondelivery',
                payment: 'Paiement a la livraison',

                total_paid:              total.totalTtc,
                total_paid_real:         0,
                total_products:          total.totalHt,
                total_products_wt:       total.totalTtc,
                conversion_rate: 1,
                total_paid_tax_incl: total.totalTtc,
                total_paid_tax_excl: total.totalHt,
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
            } as OrderCreateInput);

            await postProcessCsvPaiementAccepteOrder(newOrderId, address.id, row.date);

            // for(const orderRow of orderRows) {
            //
            //     const product = await getProductMyPrice(orderRow.product_id, {
            //         'price[my_price][use_tax]': '0',
            //         'price[my_price][use_reduction]': '1',
            //         'price[my_price][product_attribute]': String(orderRow.product_attribute_id),
            //         'price[my_price][id_country]': '8',
            //     });
            //
            //     orderOutputs.push({
            //         idOrder: newOrderId,
            //         idProduct: product.id,
            //         idProductAttribute: orderRow.product_attribute_id,
            //         quantity: orderRow.product_quantity,
            //         priceHT: product.my_price,
            //         dateCommande: parseDateToStringWithHour(row.date)
            //     });
            // }

        }

        // 4. Commandes livrés
        if( row.etat !== null &&  row.etat === 'livré' ) {
            const orderRows = cart.cart_rows.map(row => ({
                product_id: row.id_product,
                product_attribute_id: row.id_product_attribute,
                product_quantity: row.quantity,
                id_customization: row.id_customization,
            }));

            const total = await getTotalPaidCart(cart, priceCache);

            const newOrderId = await createOrder({
                id_address_delivery: address.id,
                id_address_invoice: address.id,
                id_cart: cart.id,
                id_currency: 1,
                id_lang: 1,
                id_customer: customer.id,
                id_carrier: 1,
                module: 'ps_cashondelivery',
                payment: 'Paiement a la livraison',

                total_paid:              total.totalTtc,
                total_paid_real:         0,
                total_products:          total.totalHt,
                total_products_wt:       total.totalTtc,
                conversion_rate: 1,
                total_paid_tax_incl: total.totalTtc,
                total_paid_tax_excl: total.totalHt,
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
            } as OrderCreateInput);

            await postProcessCsvLivreOrder(newOrderId, address.id, row.date);

            for(const orderRow of orderRows) {

                const priceHT = await getCachedProductMyPrice(
                    priceCache,
                    orderRow.product_id,
                    orderRow.product_attribute_id,
                    0
                );

                orderOutputs.push({
                    idOrder: newOrderId,
                    idProduct: orderRow.product_id,
                    idProductAttribute: orderRow.product_attribute_id,
                    quantity: orderRow.product_quantity,
                    priceHT,
                    dateCommande: parseDateToStringWithHour(row.date)
                });
            }
        }

    }

    return orderOutputs;
}