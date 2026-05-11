import api from '../../services/api';
import { parseXml, getNodeText } from '../../utils/xml-utils';
import { buildOrderHistoryPostXml, buildOrderHistoryPatchXml } from './order_histories.mapper';
import { parseOrderHistory, parseOrderHistoryIdList, parseOrderHistoryList } from './order_histories.reader';
import type {
  OrderHistoryCreateInput,
  OrderHistoryUpdateInput,
  OrderHistoryOutput,
  OrderHistoryListItem,
} from './order_histories.types';

export async function createOrderHistory(data: OrderHistoryCreateInput): Promise<number> {
  const body = buildOrderHistoryPostXml(data);
  const response = await api.post<string>('order_histories', body);
  const doc = parseXml(response.data);
  return parseInt(getNodeText(doc.documentElement, 'id'), 10);
}

export async function updateOrderHistory(
  id: number,
  data: Partial<OrderHistoryUpdateInput>
): Promise<number> {
  const body = buildOrderHistoryPatchXml(id, data);
  const response = await api.patch<string>(`order_histories/${id}`, body);
  const doc = parseXml(response.data);
  return parseInt(getNodeText(doc.documentElement, 'id'), 10);
}

export async function getOrderHistory(id: number): Promise<OrderHistoryOutput> {
  const response = await api.get<string>(`order_histories/${id}`);
  return parseOrderHistory(parseXml(response.data));
}

export async function listOrderHistoryIds(
  params?: Record<string, string>
): Promise<OrderHistoryListItem[]> {
  const response = await api.get<string>('order_histories', { params });
  return parseOrderHistoryIdList(parseXml(response.data));
}

export async function listOrderHistories(
  params?: Record<string, string>
): Promise<OrderHistoryOutput[]> {
  const response = await api.get<string>('order_histories', {
    params: { display: 'full', ...params },
  });
  return parseOrderHistoryList(parseXml(response.data));
}
