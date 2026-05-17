import api from '../../services/api';
import { parseXml, getNodeText } from '../../utils/xml-utils';
import { buildSpecificPriceRulePostXml, buildSpecificPriceRulePatchXml, buildSpecificPriceRulePutXml } from './specific_price_rules.mapper';
import { parseSpecificPriceRule, parseSpecificPriceRuleIdList, parseSpecificPriceRuleList } from './specific_price_rules.reader';
import type {
  SpecificPriceRuleCreateInput,
  SpecificPriceRuleUpdateInput,
  SpecificPriceRuleOutput,
  SpecificPriceRuleListItem,
} from './specific_price_rules.types';

export async function createSpecificPriceRule(data: SpecificPriceRuleCreateInput): Promise<number> {
  const body = buildSpecificPriceRulePostXml(data);
  const response = await api.post<string>('specific_price_rules', body);
  const doc = parseXml(response.data);
  return parseInt(getNodeText(doc.documentElement, 'id'), 10);
}

export async function updateSpecificPriceRule(
  id: number,
  data: Partial<SpecificPriceRuleUpdateInput>
): Promise<number> {
  const body = buildSpecificPriceRulePatchXml(id, data);
  const response = await api.patch<string>(`specific_price_rules/${id}`, body);
  const doc = parseXml(response.data);
  return parseInt(getNodeText(doc.documentElement, 'id'), 10);
}

export async function replaceSpecificPriceRule(
  id: number,
  data: SpecificPriceRuleUpdateInput
): Promise<number> {
  const body = buildSpecificPriceRulePutXml(id, data);
  const response = await api.put<string>(`specific_price_rules/${id}`, body);
  const doc = parseXml(response.data);
  return parseInt(getNodeText(doc.documentElement, 'id'), 10);
}

export async function getSpecificPriceRule(id: number): Promise<SpecificPriceRuleOutput> {
  const response = await api.get<string>(`specific_price_rules/${id}`);
  return parseSpecificPriceRule(parseXml(response.data));
}

export async function listSpecificPriceRuleIds(
  params?: Record<string, string>
): Promise<SpecificPriceRuleListItem[]> {
  const response = await api.get<string>('specific_price_rules', { params });
  return parseSpecificPriceRuleIdList(parseXml(response.data));
}

export async function listSpecificPriceRules(
  params?: Record<string, string>
): Promise<SpecificPriceRuleOutput[]> {
  const response = await api.get<string>('specific_price_rules', {
    params: { display: 'full', ...params },
  });
  return parseSpecificPriceRuleList(parseXml(response.data));
}
