import api from '../../services/api';
import { parseXml, getNodeText } from '../../utils/xml-utils';
import { buildOrderPaymentPostXml, buildOrderPaymentPatchXml } from './order_payments.mapper';
import { parseOrderPayment, parseOrderPaymentIdList, parseOrderPaymentList } from './order_payments.reader';
import type {
	OrderPaymentCreateInput,
	OrderPaymentUpdateInput,
	OrderPaymentOutput,
	OrderPaymentListItem,
} from './order_payments.types';

export async function createOrderPayment(data: OrderPaymentCreateInput): Promise<number> {
	const body = buildOrderPaymentPostXml(data);
	const response = await api.post<string>('order_payments', body);
	const doc = parseXml(response.data);
	return parseInt(getNodeText(doc.documentElement, 'id'), 10);
}

export async function updateOrderPayment(
	id: number,
	data: Partial<OrderPaymentUpdateInput>
): Promise<number> {
	const body = buildOrderPaymentPatchXml(id, data);
	const response = await api.patch<string>(`order_payments/${id}`, body);
	const doc = parseXml(response.data);
	return parseInt(getNodeText(doc.documentElement, 'id'), 10);
}

export async function getOrderPayment(id: number): Promise<OrderPaymentOutput> {
	const response = await api.get<string>(`order_payments/${id}`);
	return parseOrderPayment(parseXml(response.data));
}

export async function listOrderPaymentIds(
	params?: Record<string, string>
): Promise<OrderPaymentListItem[]> {
	const response = await api.get<string>('order_payments', { params });
	return parseOrderPaymentIdList(parseXml(response.data));
}

export async function listOrderPayments(
	params?: Record<string, string>
): Promise<OrderPaymentOutput[]> {
	const response = await api.get<string>('order_payments', {
		params: { display: 'full', ...params },
	});
	return parseOrderPaymentList(parseXml(response.data));
}
