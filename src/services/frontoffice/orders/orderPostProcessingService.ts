import {
  listOrderPayments,
  getOrderPayment,
} from '../../../resources/order_payments/order_payments.service';
import {
  listOrderInvoices,
  getOrderInvoice,
} from '../../../resources/order_invoices/order_invoices.service';
import { getOrder, updateOrder } from '../../../resources/orders/orders.service';
import api from '../../../services/api';
import {getOrderHistory, listOrderHistories} from "../../../resources/order_histories/order_histories.service.ts";

/**
 * Post-process an order after creation:
 * 1. Delete order_payments entries by order reference.
 * 2. Delete order_histories entries by id_order
 * 2. Delete order_invoices entries by order id.
 * 3. Update order current_state to 13.
 */
export async function postProcessOrder(orderId: number): Promise<void> {
  // Get the order to extract its reference
  const order = await getOrder(orderId);

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

  // Step 2: Delete order_histories by id_order
  const orderHistories = await listOrderHistories({
      'filter[id_order]': `[${order.id}]`,
  });

  for (const history of orderHistories) {
      const orderHistory = await getOrderHistory(history.id);
      if (orderHistory.id_order === order.id) {
          await api.delete<string>(`order_histories/${history.id}`);
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

  // Step 4: Update order current_state to 13
  await updateOrder(orderId, { current_state: 13 });
}
