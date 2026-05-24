import type {OrderCreateInput, OrderOutput, OrderRowInput} from "../../../resources/orders/orders.types.ts";
import {createCart} from "../../../resources/carts/carts.service.ts";
import type {CartRowInput} from "../../../resources/carts/carts.types.ts";
import type {CustomerOutput} from "../../../resources/customers/customers.types.ts";
import {createOrder, updateOrder} from "../../../resources/orders/orders.service.ts";
import {listStockAvailables} from "../../../resources/stock_availables/stock_availables.service.ts";
import {listStockMovementReasons} from "../../../resources/stock_movement_reasons/stock_movement_reasons.service.ts";
import {getProductMyPrice} from "../../../resources/products/products.service.ts";
import {createStockMovement} from "../../../resources/stock_movements/stock_movements.service.ts";
import {parseDateToStringWithHour} from "../../../utils/date-utils.ts";

export async function createDuplicatedOrder(order: OrderOutput, customer: CustomerOutput, quantity: number) : Promise<number> {

    const cartRows : CartRowInput[] = [];
    order.order_rows.forEach((orderRow) => {
        cartRows.push({
            id_product: orderRow.product_id,
            id_product_attribute: orderRow.product_attribute_id,
            id_address_delivery: order.id_address_delivery,
            quantity: orderRow.product_quantity * quantity,
        })
    })

    const newIdCart = await createCart({
        id_customer:         order.id_customer,
        id_guest:            0,
        id_currency:         1,   // adapter selon la devise configurée
        id_lang:             1,   // adapter selon la langue
        id_carrier:          1,   // adapter selon le transporteur
        id_address_delivery: 0,   // à adapter si l'adresse est gérée
        id_address_invoice:  0,
        cart_rows: cartRows
    });

    const orderRows = order.order_rows.map(orderRow => ({
        product_id: orderRow.product_id,
        product_attribute_id: orderRow.product_attribute_id,
        product_quantity: orderRow.product_quantity * quantity,
        id_customization: orderRow.id_customization,
    }));

    const payload: OrderCreateInput = {
        id_address_delivery: order.id_address_delivery,
        id_address_invoice: order.id_address_invoice,
        id_cart: newIdCart,
        id_currency: order.id_currency,
        id_lang: order.id_lang,
        id_customer: order.id_customer,
        id_carrier: order.id_carrier,
        module: 'ps_cashondelivery',
        payment: 'Paiement à la livraison',
        total_paid: order.total_paid * quantity,
        total_paid_real: 0,
        total_products: order.total_products * quantity,
        total_products_wt: order.total_products_wt * quantity,
        conversion_rate: 1,
        total_paid_tax_incl: order.total_paid_tax_incl * quantity,
        total_paid_tax_excl: order.total_paid_tax_excl * quantity,
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

    await livreOrders(orderId, order.id_address_delivery, orderRows);

    return orderId;

}

/** Id de l'employé administrateur PrestaShop (adapter si nécessaire). */
const DEFAULT_EMPLOYEE_ID = 1;

export async function livreOrders(idOrder:number, idAddress: number, orderRows: OrderRowInput[]) : Promise<void> {

    await updateOrder(idOrder, {
        id_address_delivery: idAddress,
        id_address_invoice: idAddress,
        current_state: 5
    });

    for(const order of orderRows) {

        const stockAvailables = await listStockAvailables({
            'filter[id_product]': '['+order.product_id+']',
            'filter[id_product_attribute]': '['+order.product_attribute_id+']'
        });

        const mvtStockReason = await listStockMovementReasons({
            'filter[sign]': '[-1]'
        });

        const product = await getProductMyPrice(order.product_id, {
            'price[my_price][use_tax]': '0',
            'price[my_price][use_reduction]':'1',
            'price[my_price][product_attribute]': String(order.product_attribute_id),
            'price[my_price][id_country]': '8',
        });

        if(stockAvailables.length > 0){
            await createStockMovement({
                id_stock:            stockAvailables[0].id,
                id_stock_mvt_reason: mvtStockReason[0].id,
                id_order:            idOrder,
                id_employee:         DEFAULT_EMPLOYEE_ID,
                physical_quantity:   order.product_quantity,
                sign:                -1,
                price_te:            product.my_price,
                date_add:            parseDateToStringWithHour(new Date()),
            });
        }
    }
}