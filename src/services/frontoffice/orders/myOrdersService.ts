import { listOrderStates } from '../../../resources/order_states/order_states.service';
import { listOrders } from '../../../resources/orders/orders.service';
import type { OrderOutput } from '../../../resources/orders/orders.types';
import type { OrderStateOutput } from '../../../resources/order_states/order_states.types';

export interface CustomerOrderStatusItem {
  order: OrderOutput;
  statusId: number | null;
  statusName: string;
  statusColor: string;
}

const getLangValue = (map: Record<number, string>, preferred = 1): string =>
  map[preferred] ?? Object.values(map)[0] ?? '';

export async function listCustomerOrdersWithStatus(customerId: number): Promise<CustomerOrderStatusItem[]> {
  const [orders, states] = await Promise.all([
    listOrders({
      'filter[id_customer]': `[${customerId}]`,
    }),
    listOrderStates(),
  ]);

  const stateMap = new Map<number, OrderStateOutput>(states.map(state => [state.id, state]));

  return orders.map(order => {
    const statusId = order.current_state ?? null;
    const state = statusId ? stateMap.get(statusId) : undefined;

    return {
      order,
      statusId,
      statusName: state ? getLangValue(state.name) : 'Inconnu',
      statusColor: state?.color ?? '#858796',
    };
  });
}
