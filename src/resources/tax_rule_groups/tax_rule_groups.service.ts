import api from '../../services/api';
import { parseXml, getNodeText } from '../../utils/xml-utils';
import { buildTaxRuleGroupPostXml, buildTaxRuleGroupPatchXml } from './tax_rule_groups.mapper';
import {
	parseTaxRuleGroup,
	parseTaxRuleGroupIdList,
	parseTaxRuleGroupList,
} from './tax_rule_groups.reader';
import type {
	TaxRuleGroupCreateInput,
	TaxRuleGroupUpdateInput,
	TaxRuleGroupOutput,
	TaxRuleGroupListItem,
} from './tax_rule_groups.types';

export async function createTaxRuleGroup(data: TaxRuleGroupCreateInput): Promise<number> {
	const body = buildTaxRuleGroupPostXml(data);
	const response = await api.post<string>('tax_rule_groups', body);
	const doc = parseXml(response.data);
	return parseInt(getNodeText(doc.documentElement, 'id'), 10);
}

export async function updateTaxRuleGroup(
	id: number,
	data: Partial<TaxRuleGroupUpdateInput>
): Promise<number> {
	const body = buildTaxRuleGroupPatchXml(id, data);
	const response = await api.patch<string>(`tax_rule_groups/${id}`, body);
	const doc = parseXml(response.data);
	return parseInt(getNodeText(doc.documentElement, 'id'), 10);
}

export async function getTaxRuleGroup(id: number): Promise<TaxRuleGroupOutput> {
	const response = await api.get<string>(`tax_rule_groups/${id}`);
	return parseTaxRuleGroup(parseXml(response.data));
}

export async function listTaxRuleGroupIds(
	params?: Record<string, string>
): Promise<TaxRuleGroupListItem[]> {
	const response = await api.get<string>('tax_rule_groups', { params });
	return parseTaxRuleGroupIdList(parseXml(response.data));
}

export async function listTaxRuleGroups(
	params?: Record<string, string>
): Promise<TaxRuleGroupOutput[]> {
	const response = await api.get<string>('tax_rule_groups', {
		params: { display: 'full', ...params },
	});
	return parseTaxRuleGroupList(parseXml(response.data));
}
