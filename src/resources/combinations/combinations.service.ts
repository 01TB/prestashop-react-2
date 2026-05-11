import api from '../../services/api';
import { parseXml, getNodeText } from '../../utils/xml-utils';
import { buildCombinationPostXml, buildCombinationPatchXml } from './combinations.mapper';
import { parseCombination, parseCombinationIdList, parseCombinationList } from './combinations.reader';
import type {
  CombinationCreateInput,
  CombinationUpdateInput,
  CombinationOutput,
  CombinationListItem,
} from './combinations.types';

export async function createCombination(data: CombinationCreateInput): Promise<number> {
  const body = buildCombinationPostXml(data);
  const response = await api.post<string>('combinations', body);
  const doc = parseXml(response.data);
  return parseInt(getNodeText(doc.documentElement, 'id'), 10);
}

export async function updateCombination(
  id: number,
  data: Partial<CombinationUpdateInput>
): Promise<number> {
  const body = buildCombinationPatchXml(id, data);
  const response = await api.patch<string>(`combinations/${id}`, body);
  const doc = parseXml(response.data);
  return parseInt(getNodeText(doc.documentElement, 'id'), 10);
}

export async function getCombination(id: number): Promise<CombinationOutput> {
  const response = await api.get<string>(`combinations/${id}`);
  return parseCombination(parseXml(response.data));
}

export async function listCombinationIds(
  params?: Record<string, string>
): Promise<CombinationListItem[]> {
  const response = await api.get<string>('combinations', { params });
  return parseCombinationIdList(parseXml(response.data));
}

export async function listCombinations(
  params?: Record<string, string>
): Promise<CombinationOutput[]> {
  const response = await api.get<string>('combinations', {
    params: { display: 'full', ...params },
  });
  return parseCombinationList(parseXml(response.data));
}
