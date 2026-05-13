import { useEffect, useState } from 'react';
import { listOrders } from '../../../resources/orders/orders.service.ts';
import { toDateInputValue, parseDateInputValue } from "../../../utils/date-utils.ts";

export function useDashboard(selectedDate: string) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalGeneral, setTotalGeneral] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  const fetch = async () => {
    setLoading(true);
    setError(null);

    try {
      const endDate = parseDateInputValue(selectedDate) ?? new Date();
      const date = toDateInputValue(endDate);

      const data = await listOrders({
          'date':'1',
        'filter[date_add]': `[${date} 00:00:00,${date} 23:59:59]`,
      });

      const dataGeneral = await listOrders();

      setTotalOrders(data.length);
      setTotalAmount([...data].reduce((a,b) => a + b.total_paid, 0));
      setTotalGeneral([...dataGeneral].reduce((a,b) => a + b.total_paid, 0));
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'message' in err) {
        setError(String((err as { message?: string }).message ?? 'Erreur inconnue'));
      } else {
        setError('Erreur inconnue');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void (async () => {
      await fetch();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  // const stats: DailyStat[] = useMemo(() => {
  //   const map: Record<string, { orders: number; amount: number }> = {};
  //
  //   const endDate = parseDateInputValue(selectedDate) ?? new Date();
  //   for (let i = 0; i < 2; i++) {
  //     const d = new Date(endDate);
  //     d.setDate(endDate.getDate() - (1 - i));
  //     const key = toDateInputValue(d);
  //     map[key] = { orders: 0, amount: 0 };
  //   }
  //
  //   for (const o of orders) {
  //     const day = o.date_add ? o.date_add.slice(0, 10) : '';
  //     if (!day) continue;
  //     if (!map[day]) map[day] = { orders: 0, amount: 0 };
  //     map[day].orders += 1;
  //     map[day].amount += o.total_paid_tax_incl ?? o.total_paid ?? 0;
  //   }
  //
  //   const list = Object.keys(map)
  //     .sort((a, b) => a.localeCompare(b))
  //     .map(date => ({ date, orders: map[date].orders, amount: map[date].amount }));
  //
  //   return list;
  // }, [orders, selectedDate]);

  return {
      loading,
      error,
      totalGeneral,
      totalOrders,
      totalAmount,
      refresh: fetch,
  };
}
