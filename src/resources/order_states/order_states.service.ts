import api from '../../services/api';
import { parseXml, getNodeText } from '../../utils/xml-utils';
import { buildOrderStatePostXml, buildOrderStatePatchXml } from './order_states.mapper';
import { parseOrderState, parseOrderStateIdList, parseOrderStateList } from './order_states.reader';
import type {
  OrderStateCreateInput,
  OrderStateUpdateInput,
  OrderStateOutput,
  OrderStateListItem,
} from './order_states.types';

export async function createOrderState(data: OrderStateCreateInput): Promise<number> {
  const body = buildOrderStatePostXml(data);
  const response = await api.post<string>('order_states', body);
  const doc = parseXml(response.data);
  return parseInt(getNodeText(doc.documentElement, 'id'), 10);
}

export async function updateOrderState(
  id: number,
  data: Partial<OrderStateUpdateInput>
): Promise<number> {
  const body = buildOrderStatePatchXml(id, data);
  const response = await api.patch<string>(`order_states/${id}`, body);
  const doc = parseXml(response.data);
  return parseInt(getNodeText(doc.documentElement, 'id'), 10);
}

export async function getOrderState(id: number): Promise<OrderStateOutput> {
  const response = await api.get<string>(`order_states/${id}`);
  return parseOrderState(parseXml(response.data));
}

export async function listOrderStateIds(
  params?: Record<string, string>
): Promise<OrderStateListItem[]> {
  const response = await api.get<string>('order_states', { params });
  return parseOrderStateIdList(parseXml(response.data));
}

export async function listOrderStates(
  params?: Record<string, string>
): Promise<OrderStateOutput[]> {
  const response = await api.get<string>('order_states', {
    params: { display: 'full', ...params },
  });
  return parseOrderStateList(parseXml(response.data));
}
