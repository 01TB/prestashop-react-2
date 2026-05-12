import api from '../../services/api';
import { parseXml, getNodeText } from '../../utils/xml-utils';
import { buildTaxRulePostXml, buildTaxRulePatchXml } from './tax_rules.mapper';
import {
	parseTaxRule,
	parseTaxRuleIdList,
	parseTaxRuleList,
} from './tax_rules.reader';
import type {
	TaxRuleCreateInput,
	TaxRuleUpdateInput,
	TaxRuleOutput,
	TaxRuleListItem,
} from './tax_rules.types';

export async function createTaxRule(data: TaxRuleCreateInput): Promise<number> {
	const body = buildTaxRulePostXml(data);
	const response = await api.post<string>('tax_rules', body);
	const doc = parseXml(response.data);
	return parseInt(getNodeText(doc.documentElement, 'id'), 10);
}

export async function updateTaxRule(
	id: number,
	data: Partial<TaxRuleUpdateInput>
): Promise<number> {
	const body = buildTaxRulePatchXml(id, data);
	const response = await api.patch<string>(`tax_rules/${id}`, body);
	const doc = parseXml(response.data);
	return parseInt(getNodeText(doc.documentElement, 'id'), 10);
}

export async function getTaxRule(id: number): Promise<TaxRuleOutput> {
	const response = await api.get<string>(`tax_rules/${id}`);
	return parseTaxRule(parseXml(response.data));
}

export async function listTaxRuleIds(
	params?: Record<string, string>
): Promise<TaxRuleListItem[]> {
	const response = await api.get<string>('tax_rules', { params });
	return parseTaxRuleIdList(parseXml(response.data));
}

export async function listTaxRules(
	params?: Record<string, string>
): Promise<TaxRuleOutput[]> {
	const response = await api.get<string>('tax_rules', {
		params: { display: 'full', ...params },
	});
	return parseTaxRuleList(parseXml(response.data));
}
