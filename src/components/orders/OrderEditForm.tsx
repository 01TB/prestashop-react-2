/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { updateOrder } from '../../resources/orders/orders.service';
import type { OrderUpdateInput } from '../../resources/orders/orders.types';

interface Props { orderId: number }

export function OrderEditForm({ orderId }: Props) {
  // On ne met que les champs qu'on veut modifier
  const [patch, setPatch] = useState<Partial<OrderUpdateInput>>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    try {
      await updateOrder(orderId, patch);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Modifier la commande #{orderId}</h2>

      {/* On n'expose que les champs qu'on souhaite patcher */}
      <label>
        current_state
        <input
          type="number"
          min={0}
          value={patch.current_state ?? ''}
          onChange={e => setPatch(p => ({
            ...p,
            current_state: e.target.value ? parseInt(e.target.value, 10) : undefined
          }))}
        />
      </label>

      <label>
        note
        <textarea
          maxLength={4194303}
          value={patch.note ?? ''}
          onChange={e => setPatch(p => ({ ...p, note: e.target.value }))}
        />
      </label>

      <label>
        shipping_number
        <input
          type="text"
          value={patch.shipping_number ?? ''}
          onChange={e => setPatch(p => ({ ...p, shipping_number: e.target.value }))}
        />
      </label>

      {error   && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>Commande mise à jour !</p>}

      <button type="submit">Mettre à jour</button>
    </form>
  );
}