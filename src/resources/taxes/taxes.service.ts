import api from '../../services/api';
import { parseXml, getNodeText } from '../../utils/xml-utils';
import { buildTaxPostXml, buildTaxPatchXml } from './taxes.mapper';
import { parseTax, parseTaxIdList, parseTaxList } from './taxes.reader';
import type {
	TaxCreateInput,
	TaxUpdateInput,
	TaxOutput,
	TaxListItem,
} from './taxes.types';

export async function createTax(data: TaxCreateInput): Promise<number> {
	const body = buildTaxPostXml(data);
	const response = await api.post<string>('taxes', body);
	const doc = parseXml(response.data);
	return parseInt(getNodeText(doc.documentElement, 'id'), 10);
}

export async function updateTax(
	id: number,
	data: Partial<TaxUpdateInput>
): Promise<number> {
	const body = buildTaxPatchXml(id, data);
	const response = await api.patch<string>(`taxes/${id}`, body);
	const doc = parseXml(response.data);
	return parseInt(getNodeText(doc.documentElement, 'id'), 10);
}

export async function getTax(id: number): Promise<TaxOutput> {
	const response = await api.get<string>(`taxes/${id}`);
	return parseTax(parseXml(response.data));
}

export async function listTaxIds(
	params?: Record<string, string>
): Promise<TaxListItem[]> {
	const response = await api.get<string>('taxes', { params });
	return parseTaxIdList(parseXml(response.data));
}

export async function listTaxes(
	params?: Record<string, string>
): Promise<TaxOutput[]> {
	const response = await api.get<string>('taxes', {
		params: { display: 'full', ...params },
	});
	return parseTaxList(parseXml(response.data));
}
