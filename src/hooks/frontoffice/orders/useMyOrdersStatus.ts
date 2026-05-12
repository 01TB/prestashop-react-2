import { useEffect, useState } from 'react';
import { listCustomerOrdersWithStatus } from '../../../services/frontoffice/orders/myOrdersService';
import type { CustomerOrderStatusItem } from '../../../services/frontoffice/orders/myOrdersService';

export function useMyOrdersStatus(customerId: number | null) {
  const [data, setData] = useState<CustomerOrderStatusItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    const load = async () => {
      if (!customerId || Number.isNaN(customerId)) {
        setData([]);
        setError('Identifiant client invalide.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const result = await listCustomerOrdersWithStatus(customerId);
        if (!isActive) return;
        setData(result);
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
  }, [customerId]);

  return { data, loading, error };
}
