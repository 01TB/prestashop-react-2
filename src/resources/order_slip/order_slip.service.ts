import api from '../../services/api';
import { parseXml, getNodeText } from '../../utils/xml-utils';
import { buildOrderSlipPatchXml, buildOrderSlipPostXml } from './order_slip.mapper';
import { parseOrderSlip, parseOrderSlipIdList, parseOrderSlipList } from './order_slip.reader';
import type {
	OrderSlipCreateInput,
	OrderSlipListItem,
	OrderSlipOutput,
	OrderSlipUpdateInput,
} from './order_slip.types';

export async function createOrderSlip(data: OrderSlipCreateInput): Promise<number> {
	const body = buildOrderSlipPostXml(data);
	const response = await api.post<string>('order_slips', body);
	const doc = parseXml(response.data);
	return parseInt(getNodeText(doc.documentElement, 'id'), 10);
}

export async function updateOrderSlip(
	id: number,
	data: Partial<OrderSlipUpdateInput>
): Promise<number> {
	const body = buildOrderSlipPatchXml(id, data);
	const response = await api.patch<string>(`order_slips/${id}`, body);
	const doc = parseXml(response.data);
	return parseInt(getNodeText(doc.documentElement, 'id'), 10);
}

export async function getOrderSlip(id: number): Promise<OrderSlipOutput> {
	const response = await api.get<string>(`order_slips/${id}`);
	return parseOrderSlip(parseXml(response.data));
}

export async function listOrderSlipIds(
	params?: Record<string, string>
): Promise<OrderSlipListItem[]> {
	const response = await api.get<string>('order_slips', { params });
	return parseOrderSlipIdList(parseXml(response.data));
}

export async function listOrderSlips(
	params?: Record<string, string>
): Promise<OrderSlipOutput[]> {
	const response = await api.get<string>('order_slips', {
		params: { display: 'full', ...params },
	});
	return parseOrderSlipList(parseXml(response.data));
}
