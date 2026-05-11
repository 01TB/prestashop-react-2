import { useEffect, useState } from 'react';
import { listOrders, updateOrder } from '../../../resources/orders/orders.service';
import { listOrderHistories } from '../../../resources/order_histories/order_histories.service';
import { listOrderStates } from '../../../resources/order_states/order_states.service';
import type { OrderOutput } from '../../../resources/orders/orders.types';
import type { OrderHistoryOutput } from '../../../resources/order_histories/order_histories.types';
import type { OrderStateOutput } from '../../../resources/order_states/order_states.types';

export interface OrderWithStatus {
  order: OrderOutput;
  statusId: number | null;
  statusName: string;
  statusColor: string;
  statusDate: string;
}

const getLangValue = (map: Record<number, string>, preferred = 1): string =>
  map[preferred] ?? Object.values(map)[0] ?? '';

const isHistoryNewer = (a: OrderHistoryOutput, b: OrderHistoryOutput): boolean => {
  if (a.date_add !== b.date_add) return a.date_add > b.date_add;
  return a.id > b.id;
};

const getLatestHistory = (items: OrderHistoryOutput[]): OrderHistoryOutput | null => {
  if (items.length === 0) return null;
  return items.reduce((latest, current) =>
    isHistoryNewer(current, latest) ? current : latest
  );
};

export function useOrdersWithStatus() {
  const [data, setData] = useState<OrderWithStatus[]>([]);
  const [states, setStates] = useState<OrderStateOutput[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingIds, setUpdatingIds] = useState<Record<number, boolean>>({});
  const [updateErrors, setUpdateErrors] = useState<Record<number, string | null>>({});

  useEffect(() => {
    let isActive = true;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [orders, statesResult] = await Promise.all([
          listOrders(),
          listOrderStates(),
        ]);

        const stateMap = new Map<number, OrderStateOutput>(
          statesResult.map(state => [state.id, state])
        );

        const histories = await Promise.all(
          orders.map(order =>
            listOrderHistories({
              'filter[id_order]': String(order.id),
            })
          )
        );

        const merged = orders.map((order, index) => {
          const latestHistory = getLatestHistory(histories[index]);
          const statusId = latestHistory?.id_order_state ?? order.current_state ?? null;
          const state = statusId ? stateMap.get(statusId) : undefined;

          return {
            order,
            statusId,
            statusName: state ? getLangValue(state.name) : 'Inconnu',
            statusColor: state?.color ?? '#858796',
            statusDate: latestHistory?.date_add ?? order.date_add,
          };
        });

        if (isActive) {
          setData(merged);
          setStates(statesResult);
        }
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
  }, []);

  const updateOrderState = async (orderId: number, nextStateId: number) => {
    setUpdatingIds(prev => ({ ...prev, [orderId]: true }));
    setUpdateErrors(prev => ({ ...prev, [orderId]: null }));

    try {
      await updateOrder(orderId, { current_state: nextStateId });

      const state = states.find(item => item.id === nextStateId);
      setData(prev => prev.map(item => {
        if (item.order.id !== orderId) return item;
        return {
          ...item,
          order: { ...item.order, current_state: nextStateId },
          statusId: nextStateId,
          statusName: state ? getLangValue(state.name) : item.statusName,
          statusColor: state?.color ?? item.statusColor,
        };
      }));
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'message' in err) {
        setUpdateErrors(prev => ({
          ...prev,
          [orderId]: String((err as { message?: string }).message ?? 'Erreur inconnue'),
        }));
      } else {
        setUpdateErrors(prev => ({ ...prev, [orderId]: 'Erreur inconnue' }));
      }
    } finally {
      setUpdatingIds(prev => ({ ...prev, [orderId]: false }));
    }
  };

  return {
    data,
    states,
    loading,
    error,
    updatingIds,
    updateErrors,
    updateOrderState,
  };
}
