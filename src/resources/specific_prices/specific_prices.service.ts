import api from '../../services/api';
import { parseXml, getNodeText } from '../../utils/xml-utils';
import { buildSpecificPricePostXml, buildSpecificPricePatchXml } from './specific_prices.mapper';
import { parseSpecificPrice, parseSpecificPriceList } from './specific_prices.reader';
import type { SpecificPriceCreateInput, SpecificPriceUpdateInput, SpecificPriceOutput } from './specific_prices.types';

export async function createSpecificPrice(data: SpecificPriceCreateInput): Promise<number> {
  const body = buildSpecificPricePostXml(data);
  const response = await api.post<string>('specific_prices', body);
  const doc = parseXml(response.data);
  return parseInt(getNodeText(doc.documentElement, 'id'), 10);
}

export async function updateSpecificPrice(
  id: number,
  data: Partial<SpecificPriceUpdateInput>
): Promise<number> {
  const body = buildSpecificPricePatchXml(id, data);
  const response = await api.patch<string>(`specific_prices/${id}`, body);
  const doc = parseXml(response.data);
  return parseInt(getNodeText(doc.documentElement, 'id'), 10);
}

export async function getSpecificPrice(id: number): Promise<SpecificPriceOutput> {
  const response = await api.get<string>(`specific_prices/${id}`);
  return parseSpecificPrice(parseXml(response.data));
}

export async function listSpecificPrices(params?: Record<string, string>): Promise<SpecificPriceOutput[]> {
  const response = await api.get<string>('specific_prices', { params: { display: 'full', ...params } });
  return parseSpecificPriceList(parseXml(response.data));
}

export async function listSpecificPriceIds(params?: Record<string, string>): Promise<number[]> {
  const response = await api.get<string>('specific_prices', { params });
  const doc = parseXml(response.data);
  return Array.from(doc.querySelectorAll('specific_prices > specific_price'))
    .map(el => parseInt(el.getAttribute('id') ?? '0', 10))
    .filter(id => id > 0);
}
