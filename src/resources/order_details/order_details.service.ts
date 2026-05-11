import api from '../../services/api';
import { parseXml, getNodeText } from '../../utils/xml-utils';
import { buildOrderDetailPostXml, buildOrderDetailPatchXml } from './order_details.mapper';
import { parseOrderDetail, parseOrderDetailIdList, parseOrderDetailList } from './order_details.reader';
import type {
  OrderDetailCreateInput,
  OrderDetailUpdateInput,
  OrderDetailOutput,
  OrderDetailListItem,
} from './order_details.types';

export async function createOrderDetail(data: OrderDetailCreateInput): Promise<number> {
  const body = buildOrderDetailPostXml(data);
  const response = await api.post<string>('order_details', body);
  const doc = parseXml(response.data);
  return parseInt(getNodeText(doc.documentElement, 'id'), 10);
}

export async function updateOrderDetail(
  id: number,
  data: Partial<OrderDetailUpdateInput>
): Promise<number> {
  const body = buildOrderDetailPatchXml(id, data);
  const response = await api.patch<string>(`order_details/${id}`, body);
  const doc = parseXml(response.data);
  return parseInt(getNodeText(doc.documentElement, 'id'), 10);
}

export async function getOrderDetail(id: number): Promise<OrderDetailOutput> {
  const response = await api.get<string>(`order_details/${id}`);
  return parseOrderDetail(parseXml(response.data));
}

export async function listOrderDetailIds(
  params?: Record<string, string>
): Promise<OrderDetailListItem[]> {
  const response = await api.get<string>('order_details', { params });
  return parseOrderDetailIdList(parseXml(response.data));
}

export async function listOrderDetails(
  params?: Record<string, string>
): Promise<OrderDetailOutput[]> {
  const response = await api.get<string>('order_details', {
    params: { display: 'full', ...params },
  });
  return parseOrderDetailList(parseXml(response.data));
}
