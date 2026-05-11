import { useEffect, useState } from 'react';
import { getOrder } from '../../../resources/orders/orders.service';
import { listOrderHistories } from '../../../resources/order_histories/order_histories.service';
import { listOrderStates } from '../../../resources/order_states/order_states.service';
import { listOrderPayments } from '../../../resources/order_payments/order_payments.service';
import { listOrderInvoices } from '../../../resources/order_invoices/order_invoices.service';
import { getCustomer } from '../../../resources/customers/customers.service';
import type { OrderOutput } from '../../../resources/orders/orders.types';
import type { OrderHistoryOutput } from '../../../resources/order_histories/order_histories.types';
import type { OrderStateOutput } from '../../../resources/order_states/order_states.types';
import type { OrderPaymentOutput } from '../../../resources/order_payments/order_payments.types';
import type { OrderInvoiceOutput } from '../../../resources/order_invoices/order_invoices.types';
import type { CustomerOutput } from '../../../resources/customers/customers.types';

export function useOrderDetails(orderId: number | null) {
  const [order, setOrder] = useState<OrderOutput | null>(null);
  const [histories, setHistories] = useState<OrderHistoryOutput[]>([]);
  const [states, setStates] = useState<OrderStateOutput[]>([]);
  const [payments, setPayments] = useState<OrderPaymentOutput[]>([]);
  const [invoices, setInvoices] = useState<OrderInvoiceOutput[]>([]);
  const [customer, setCustomer] = useState<CustomerOutput | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    const load = async () => {
      if (!orderId || Number.isNaN(orderId)) {
        setError('Id commande invalide');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const [orderResult, statesResult] = await Promise.all([
          getOrder(orderId),
          listOrderStates(),
        ]);

        const historiesPromise = listOrderHistories({
          'filter[id_order]': `[${orderId}]`,
        });

        const invoicesPromise = listOrderInvoices({
          'filter[id_order]': `[${orderId}]`,
        });

        const paymentsPromise = orderResult.reference
          ? listOrderPayments({
              'filter[order_reference]': `[${orderResult.reference}]`,
            })
          : Promise.resolve([] as OrderPaymentOutput[]);

        const customerPromise = orderResult.id_customer > 0
          ? getCustomer(orderResult.id_customer)
          : Promise.resolve(null as CustomerOutput | null);

        const [historiesResult, invoicesResult, paymentsResult, customerResult] = await Promise.all([
          historiesPromise,
          invoicesPromise,
          paymentsPromise,
          customerPromise,
        ]);

        if (!isActive) return;

        setOrder(orderResult);
        setStates(statesResult);
        setHistories(historiesResult);
        setInvoices(invoicesResult);
        setPayments(paymentsResult);
        setCustomer(customerResult);
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
  }, [orderId]);

  return {
    order,
    histories,
    states,
    payments,
    invoices,
    customer,
    loading,
    error,
  };
}
