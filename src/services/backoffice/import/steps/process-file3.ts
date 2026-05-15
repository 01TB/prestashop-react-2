import {listProductOptionValues} from "../../../../resources/product_option_values/product_option_values.service.ts";
import {listCombinations} from "../../../../resources/combinations/combinations.service.ts";
import type {Fichier3Row, ProductCSV} from "../../../../types/import/import.types.ts";
import {createCustomer, getCustomer, listCustomers} from "../../../../resources/customers/customers.service.ts";
import {createCart, getCart} from "../../../../resources/carts/carts.service.ts";
import type {CartRowInput} from "../../../../resources/carts/carts.types.ts";
import {createOrder} from "../../../../resources/orders/orders.service.ts";
import {createAddress, getAddress, listAddresses} from "../../../../resources/addresses/addresses.service.ts";
import type {OrderCreateInput} from "../../../../resources/orders/orders.types.ts";
import {
    getTotalPaidCart,
    postProcessCsvAnnuleOrder,
    postProcessCsvPaiementAccepteOrder
} from "../orders/orderCsvProcessingService.ts";


/**
 * Résout l'id_product_attribute (combination) à partir de la référence produit
 * et du karazany (option_value).
 * Retourne 0 si aucune combination spécifique n'est trouvée.
 */
async function resolveCombinationId(
    idProduct: number,
    karazany: string,
): Promise<number> {
    if (!karazany) return 0;

    const allValues = await listProductOptionValues();
    const matchingValue = allValues.find(v =>
        v.name[1].toLowerCase() === karazany.toLowerCase()
    );
    if (!matchingValue) return 0;

    const allCombinations = await listCombinations({
        'filter[id_product]': String(idProduct),
    });
    const matchingComb = allCombinations.find(c =>
        // c.associations?.product_option_values?.some(
        //     (v: { id: number }) => v.id === matchingValue.id
        // )
        c.product_option_values.includes(matchingValue.id)
    );
    return matchingComb?.id ?? 0;
}

export async function processFile3(
    rows: Fichier3Row[],
    referenceToId: Map<string, ProductCSV>
): Promise<void> {

    const allCustomers = await listCustomers();
    const allAddresses = await listAddresses();
    for(const row of rows) {
        // 1. Customer
        let customer = allCustomers.find(
            c => c.email?.toLowerCase() === row.email.toLowerCase()
        );
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
            allCustomers.push(customer!);
        }

        // Optionnel
        let address = allAddresses.find(
            a => a.id_customer === customer.id
        );
        if(!address) {
            const newAddressId = await createAddress({
                id_customer: customer.id,
                id_country: 8,
                alias: row.nom,
                firstname: row.nom,
                lastname: row.nom,
                address1: row.adresse,
                postcode: '102',
                phone: '0000',
                phone_mobile: '0000',
                city: row.adresse,
            });
            address = await getAddress(newAddressId);
            allAddresses.push(address);
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
                    item.karazany
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

        const cart = await getCart(newIdCart);

        if(row.etat !== null &&  row.etat === 'annulé') {
            const orderRows = cart.cart_rows.map(row => ({
                product_id: row.id_product,
                product_attribute_id: row.id_product_attribute,
                product_quantity: row.quantity,
                id_customization: row.id_customization,
            }));

            const total = await getTotalPaidCart(cart);

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

        // 3. Order
        if( row.etat !== null &&  (row.etat === 'paiement accepté' || row.etat === 'paiement effecuté')) {

            const orderRows = cart.cart_rows.map(row => ({
                product_id: row.id_product,
                product_attribute_id: row.id_product_attribute,
                product_quantity: row.quantity,
                id_customization: row.id_customization,
            }));

            const total = await getTotalPaidCart(cart);

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
        }

    }
}