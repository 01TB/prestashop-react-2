import {
    listOrderPayments,
    getOrderPayment, updateOrderPayment,
} from '../../../../resources/order_payments/order_payments.service';
import {
    listOrderInvoices,
    getOrderInvoice, updateOrderInvoice,
} from '../../../../resources/order_invoices/order_invoices.service';
import { getOrder, updateOrder } from '../../../../resources/orders/orders.service';
import {
    getOrderHistory,
    listOrderHistories,
    updateOrderHistory
} from "../../../../resources/order_histories/order_histories.service.ts";
import type {CartOutput} from "../../../../resources/carts/carts.types.ts";
import {getProductMyPrice} from "../../../../resources/products/products.service.ts";
import {parseDateToStringWithHour} from "../../../../utils/date-utils.ts";
import api from "../../../api.ts";

type MyPriceCache = Map<string, number>;

export async function getTotalPaidCart(
    cart: CartOutput,
    priceCache?: MyPriceCache
): Promise<{ totalHt: number, totalTtc: number }> {
    let totalHt = 0;
    let totalTtc = 0;

    const cache = priceCache ?? new Map<string, number>();
    const getCachedMyPrice = async (
        idProduct: number,
        idProductAttribute: number,
        useTax: 0 | 1
    ): Promise<number> => {
        const cacheKey = `${idProduct}:${idProductAttribute}:${useTax}`;
        const cached = cache.get(cacheKey);
        if (cached !== undefined) return cached;

        const product = await getProductMyPrice(idProduct, {
            'price[my_price][use_tax]': String(useTax),
            'price[my_price][use_reduction]': '1',
            'price[my_price][product_attribute]': String(idProductAttribute),
            'price[my_price][id_country]': '8'
        });
        cache.set(cacheKey, product.my_price);
        return product.my_price;
    };

    for (const cartRow  of cart.cart_rows) {
        totalHt += await getCachedMyPrice(
            cartRow.id_product,
            cartRow.id_product_attribute,
            0
        );
        totalTtc += await getCachedMyPrice(
            cartRow.id_product,
            cartRow.id_product_attribute,
            1
        );
    }

    return {totalHt, totalTtc};
}

/**
 * Post-process an order after 'Paiement acceptée' creation:
 * 1. Update order_payments entries by order reference.
 * 2. Update order_histories entries by id_order
 * 3. Update order_invoices entries by order id.
 * 4. Update order current_state to 2.
 * 5: Update final date histories
 * 6: Update final date payments
 * 7: Update final date invoices
 */
export async function postProcessCsvPaiementAccepteOrder(orderId: number, addressId: number, date: Date): Promise<void> {
  // Get the order to extract its reference
  const order = await getOrder(orderId);
  const dateFormatted = parseDateToStringWithHour(date);

  // Step 1: Update order_payments by order_reference
  const orderPayments = await listOrderPayments({
    'filter[order_reference]': `[${order.reference}]`,
  });

  for (const payment of orderPayments) {
    const paymentDetail = await getOrderPayment(payment.id);
    if (paymentDetail.order_reference === order.reference) {
        updateOrderPayment(payment.id, { date_add: dateFormatted })
    }
  }

  // Step 2: Update order_histories by id_order
  const orderHistories = await listOrderHistories({
      'filter[id_order]': `[${order.id}]`,
  });

  for (const history of orderHistories) {
      const orderHistory = await getOrderHistory(history.id);
      if (orderHistory.id_order === order.id) {
          updateOrderHistory(history.id, { date_add: dateFormatted })
      }
  }

  // Step 3: Update order_invoices by id_order
  const orderInvoices = await listOrderInvoices({
    'filter[id_order]': `[${orderId}]`,
  });

  for (const invoice of orderInvoices) {
    const invoiceDetail = await getOrderInvoice(invoice.id);
    if (invoiceDetail.id_order === orderId) {
        updateOrderInvoice(invoice.id, { date_add: dateFormatted })
    }
  }

  // Step 4: Update order current_state to 2 'Paiement accepté'
  await updateOrder(orderId, {
      date_add: dateFormatted,
      id_address_delivery: addressId,
      id_address_invoice: addressId,
      current_state: 2
  });

  // Step 5: Update final date histories
  const orderHistoriesFinalUpdate = await listOrderHistories({
    'filter[id_order]': `[${order.id}]`,
  });

  for (const history of orderHistoriesFinalUpdate) {
    const orderHistory = await getOrderHistory(history.id);
        if (orderHistory.id_order === order.id) {
            updateOrderHistory(history.id, { date_add: dateFormatted })
        }
    }

    // Step 6: Update final date payments
    const orderPaymentsFinalUpdate = await listOrderPayments({
        'filter[order_reference]': `[${order.reference}]`,
    });

    for (const payment of orderPaymentsFinalUpdate) {
        const paymentDetail = await getOrderPayment(payment.id);
        if (paymentDetail.order_reference === order.reference) {
            updateOrderPayment(payment.id, { date_add: dateFormatted })
        }
    }

    // Step 7: Update final date invoices
    const orderInvoicesFinalUpdate = await listOrderInvoices({
        'filter[id_order]': `[${orderId}]`,
    });

    for (const invoice of orderInvoicesFinalUpdate) {
        const invoiceDetail = await getOrderInvoice(invoice.id);
        if (invoiceDetail.id_order === orderId) {
            updateOrderInvoice(invoice.id, { date_add: dateFormatted })
        }
    }
}

/**
 * Post-process an order after 'Livré' creation:
 * 1. Update order_payments entries by order reference.
 * 2. Update order_histories entries by id_order
 * 3. Update order_invoices entries by order id.
 * 4. Update order current_state to 5.
 * 5: Update final date histories
 * 6: Update final date payments
 * 7: Update final date invoices
 */
export async function postProcessCsvLivreOrder(orderId: number, addressId: number, date: Date): Promise<void> {
    // Get the order to extract its reference
    const order = await getOrder(orderId);
    const dateFormatted = parseDateToStringWithHour(date);

    // Step 1: Update order_payments by order_reference
    const orderPayments = await listOrderPayments({
        'filter[order_reference]': `[${order.reference}]`,
    });

    for (const payment of orderPayments) {
        const paymentDetail = await getOrderPayment(payment.id);
        if (paymentDetail.order_reference === order.reference) {
            updateOrderPayment(payment.id, { date_add: dateFormatted })
        }
    }

    // Step 2: Update order_histories by id_order
    const orderHistories = await listOrderHistories({
        'filter[id_order]': `[${order.id}]`,
    });

    for (const history of orderHistories) {
        const orderHistory = await getOrderHistory(history.id);
        if (orderHistory.id_order === order.id) {
            updateOrderHistory(history.id, { date_add: dateFormatted })
        }
    }

    // Step 3: Update order_invoices by id_order
    const orderInvoices = await listOrderInvoices({
        'filter[id_order]': `[${orderId}]`,
    });

    for (const invoice of orderInvoices) {
        const invoiceDetail = await getOrderInvoice(invoice.id);
        if (invoiceDetail.id_order === orderId) {
            updateOrderInvoice(invoice.id, { date_add: dateFormatted })
        }
    }

    // Step 4: Update order current_state to 5 'Livré'
    await updateOrder(orderId, {
        date_add: dateFormatted,
        id_address_delivery: addressId,
        id_address_invoice: addressId,
        current_state: 5
    });

    // Step 5: Update final date histories
    const orderHistoriesFinalUpdate = await listOrderHistories({
        'filter[id_order]': `[${order.id}]`,
    });

    for (const history of orderHistoriesFinalUpdate) {
        const orderHistory = await getOrderHistory(history.id);
        if (orderHistory.id_order === order.id) {
            updateOrderHistory(history.id, { date_add: dateFormatted })
        }
    }

    // Step 6: Update final date payments
    const orderPaymentsFinalUpdate = await listOrderPayments({
        'filter[order_reference]': `[${order.reference}]`,
    });

    for (const payment of orderPaymentsFinalUpdate) {
        const paymentDetail = await getOrderPayment(payment.id);
        if (paymentDetail.order_reference === order.reference) {
            updateOrderPayment(payment.id, { date_add: dateFormatted })
        }
    }

    // Step 7: Update final date invoices
    const orderInvoicesFinalUpdate = await listOrderInvoices({
        'filter[id_order]': `[${orderId}]`,
    });

    for (const invoice of orderInvoicesFinalUpdate) {
        const invoiceDetail = await getOrderInvoice(invoice.id);
        if (invoiceDetail.id_order === orderId) {
            updateOrderInvoice(invoice.id, { date_add: dateFormatted })
        }
    }
}

/**
 * Post-process an order after 'Annulé' creation:
 * 1. Delete order_payments entries by order reference.
 * 2. Update order_histories entries by id_order
 * 2. Delete order_invoices entries by order id.
 * 3. Update order current_state to 6.
 * 5: Update final date histories
 */
export async function postProcessCsvAnnuleOrder(orderId: number, addressId: number, date: Date): Promise<void> {
    // Get the order to extract its reference
    const order = await getOrder(orderId);
    const dateFormatted = parseDateToStringWithHour(date);

    // Step 1: Delete order_payments by order_reference
    const orderPayments = await listOrderPayments({
        'filter[order_reference]': `[${order.reference}]`,
    });

    for (const payment of orderPayments) {
        const paymentDetail = await getOrderPayment(payment.id);
        if (paymentDetail.order_reference === order.reference) {
            await api.delete<string>(`order_payments/${payment.id}`);
        }
    }

    // Step 2: Update order_histories by id_order
    const orderHistories = await listOrderHistories({
        'filter[id_order]': `[${order.id}]`,
    });

    for (const history of orderHistories) {
        const orderHistory = await getOrderHistory(history.id);
        if (orderHistory.id_order === order.id) {
            updateOrderHistory(history.id, { date_add: dateFormatted })
        }
    }

    // Step 3: Delete order_invoices by id_order
    const orderInvoices = await listOrderInvoices({
        'filter[id_order]': `[${orderId}]`,
    });

    for (const invoice of orderInvoices) {
        const invoiceDetail = await getOrderInvoice(invoice.id);
        if (invoiceDetail.id_order === orderId) {
            await api.delete<string>(`order_invoices/${invoice.id}`);
        }
    }

    // Step 4: Update order current_state to 6 'Annulé'
    await updateOrder(orderId, {
        date_add: dateFormatted,
        id_address_delivery: addressId,
        id_address_invoice: addressId,
        current_state: 6
    });

    // Step 5: Update final date histories
    const orderHistoriesFinalUpdate = await listOrderHistories({
        'filter[id_order]': `[${order.id}]`,
    });

    for (const history of orderHistoriesFinalUpdate) {
        const orderHistory = await getOrderHistory(history.id);
        if (orderHistory.id_order === order.id) {
            updateOrderHistory(history.id, { date_add: dateFormatted })
        }
    }

    // Step 6: Update final date payments
    // const orderPaymentsFinalUpdate = await listOrderPayments({
    //     'filter[order_reference]': `[${order.reference}]`,
    // });
    //
    // for (const payment of orderPaymentsFinalUpdate) {
    //     const paymentDetail = await getOrderPayment(payment.id);
    //     if (paymentDetail.order_reference === order.reference) {
    //         updateOrderPayment(payment.id, { date_add: dateFormatted })
    //     }
    // }

    // Step 7: Update final date invoices
    // const orderInvoicesFinalUpdate = await listOrderInvoices({
    //     'filter[id_order]': `[${orderId}]`,
    // });
    //
    // for (const invoice of orderInvoicesFinalUpdate) {
    //     const invoiceDetail = await getOrderInvoice(invoice.id);
    //     if (invoiceDetail.id_order === orderId) {
    //         updateOrderInvoice(invoice.id, { date_add: dateFormatted })
    //     }
    // }
}