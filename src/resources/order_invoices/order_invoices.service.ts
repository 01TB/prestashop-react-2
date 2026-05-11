import api from '../../services/api';
import { parseXml, getNodeText } from '../../utils/xml-utils';
import { buildOrderInvoicePostXml, buildOrderInvoicePatchXml } from './order_invoices.mapper';
import { parseOrderInvoice, parseOrderInvoiceIdList, parseOrderInvoiceList } from './order_invoices.reader';
import type {
	OrderInvoiceCreateInput,
	OrderInvoiceUpdateInput,
	OrderInvoiceOutput,
	OrderInvoiceListItem,
} from './order_invoices.types';

export async function createOrderInvoice(data: OrderInvoiceCreateInput): Promise<number> {
	const body = buildOrderInvoicePostXml(data);
	const response = await api.post<string>('order_invoices', body);
	const doc = parseXml(response.data);
	return parseInt(getNodeText(doc.documentElement, 'id'), 10);
}

export async function updateOrderInvoice(
	id: number,
	data: Partial<OrderInvoiceUpdateInput>
): Promise<number> {
	const body = buildOrderInvoicePatchXml(id, data);
	const response = await api.patch<string>(`order_invoices/${id}`, body);
	const doc = parseXml(response.data);
	return parseInt(getNodeText(doc.documentElement, 'id'), 10);
}

export async function getOrderInvoice(id: number): Promise<OrderInvoiceOutput> {
	const response = await api.get<string>(`order_invoices/${id}`);
	return parseOrderInvoice(parseXml(response.data));
}

export async function listOrderInvoiceIds(
	params?: Record<string, string>
): Promise<OrderInvoiceListItem[]> {
	const response = await api.get<string>('order_invoices', { params });
	return parseOrderInvoiceIdList(parseXml(response.data));
}

export async function listOrderInvoices(
	params?: Record<string, string>
): Promise<OrderInvoiceOutput[]> {
	const response = await api.get<string>('order_invoices', {
		params: { display: 'full', ...params },
	});
	return parseOrderInvoiceList(parseXml(response.data));
}
