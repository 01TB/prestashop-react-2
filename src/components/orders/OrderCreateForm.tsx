/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { createOrder } from '../../resources/orders/orders.service';
import type { OrderCreateInput } from '../../resources/orders/orders.types';

export function OrderCreateForm() {
  const [form, setForm] = useState<Partial<OrderCreateInput>>({
    conversion_rate: 1,
    total_discounts: 0,
    total_wrapping: 0,
    recyclable: false,
    mobile_theme: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [createdId, setCreatedId] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      // Validation basique des champs required
      const required: (keyof OrderCreateInput)[] = [
        'id_address_delivery', 'id_address_invoice', 'id_cart',
        'id_currency', 'id_lang', 'id_customer', 'id_carrier',
        'module', 'payment', 'total_paid', 'total_paid_real',
        'total_products', 'total_products_wt', 'conversion_rate',
      ];
      for (const key of required) {
        if (form[key] === undefined || form[key] === '') {
          throw new Error(`Champ requis manquant : ${key}`);
        }
      }
      const id = await createOrder(form as OrderCreateInput);
      setCreatedId(id);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const setField = (key: keyof OrderCreateInput, value: any) =>
    setForm(prev => ({ ...prev, [key]: value }));

  return (
    <form onSubmit={handleSubmit}>
      <h2>Créer une commande</h2>

      {/* Champs required isUnsignedId */}
      {(['id_address_delivery','id_address_invoice','id_cart',
         'id_currency','id_lang','id_customer','id_carrier'] as const).map(key => (
        <label key={key}>
          {key} *
          <input
            type="number"
            min={1}
            value={(form[key] as number) ?? ''}
            onChange={e => setField(key, parseInt(e.target.value, 10))}
            required
          />
        </label>
      ))}

      {/* module (required, isModuleName) */}
      <label>
        module *
        <input
          type="text"
          pattern="[a-zA-Z0-9_-]+"
          title="Nom de module valide (lettres, chiffres, _ -)"
          value={form.module ?? ''}
          onChange={e => setField('module', e.target.value)}
          required
        />
      </label>

      {/* payment (required, isGenericName) */}
      <label>
        payment *
        <input
          type="text"
          value={form.payment ?? ''}
          onChange={e => setField('payment', e.target.value)}
          required
        />
      </label>

      {/* Montants (required, isPrice) */}
      {(['total_paid','total_paid_real','total_products','total_products_wt'] as const).map(key => (
        <label key={key}>
          {key} *
          <input
            type="number"
            step="0.000001"
            min={0}
            value={(form[key] as number) ?? ''}
            onChange={e => setField(key, parseFloat(e.target.value))}
            required
          />
        </label>
      ))}

      {/* conversion_rate (required, isFloat) */}
      <label>
        conversion_rate *
        <input
          type="number"
          step="0.0001"
          min={0}
          value={form.conversion_rate ?? 1}
          onChange={e => setField('conversion_rate', parseFloat(e.target.value))}
          required
        />
      </label>

      {/* current_state (optionnel, isUnsignedId) */}
      <label>
        current_state
        <input
          type="number"
          min={0}
          value={form.current_state ?? ''}
          onChange={e => setField('current_state', e.target.value ? parseInt(e.target.value, 10) : undefined)}
        />
      </label>

      {/* note (optionnel, maxSize: 4194303) */}
      <label>
        note
        <textarea
          maxLength={4194303}
          value={form.note ?? ''}
          onChange={e => setField('note', e.target.value)}
        />
      </label>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {createdId && <p style={{ color: 'green' }}>Commande créée, id = {createdId}</p>}

      <button type="submit">Créer la commande</button>
    </form>
  );
}