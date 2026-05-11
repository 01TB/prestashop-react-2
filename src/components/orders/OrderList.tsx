import { useEffect, useState } from 'react';
import { listOrders } from '../../resources/orders/orders.service';
import type { OrderOutput } from '../../resources/orders/orders.types';

export function OrderList() {
  const [orders, setOrders]   = useState<OrderOutput[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    listOrders()
      .then(setOrders)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Chargement…</p>;
  if (error)   return <p>Erreur : {error}</p>;

  return (
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Référence</th>
          <th>Paiement</th>
          <th>Total TTC</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>
        {orders.map(order => (
          <tr key={order.id}>
            <td>{order.id}</td>
            <td>{order.reference}</td>
            <td>{order.payment}</td>
            <td>{order.total_paid_tax_incl.toFixed(2)} €</td>
            <td>{order.date_add}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}