import api from '../../services/api';
import { parseXml, getNodeText } from '../../utils/xml-utils';
import { buildStockAvailablePostXml, buildStockAvailablePatchXml } from './stock_availables.mapper';
import { parseStockAvailable, parseStockAvailableList } from './stock_availables.reader';
import type { StockAvailableCreateInput, StockAvailableUpdateInput, StockAvailableOutput } from './stock_availables.types';

export async function createStockAvailable(data: StockAvailableCreateInput): Promise<number> {
  const body = buildStockAvailablePostXml(data);
  const response = await api.post<string>('stock_availables', body);
  const doc = parseXml(response.data);
  return parseInt(getNodeText(doc.documentElement, 'id'), 10);
}

export async function updateStockAvailable(
  id: number,
  data: Partial<StockAvailableUpdateInput>
): Promise<number> {
  const body = buildStockAvailablePatchXml(id, data);
  const response = await api.patch<string>(`stock_availables/${id}`, body);
  const doc = parseXml(response.data);
  return parseInt(getNodeText(doc.documentElement, 'id'), 10);
}

export async function getStockAvailable(id: number): Promise<StockAvailableOutput> {
  const response = await api.get<string>(`stock_availables/${id}`);
  return parseStockAvailable(parseXml(response.data));
}

export async function listStockAvailables(params?: Record<string, string>): Promise<StockAvailableOutput[]> {
  const response = await api.get<string>('stock_availables', { params: { display: 'full', ...params } });
  return parseStockAvailableList(parseXml(response.data));
}

export async function listStockAvailableIds(params?: Record<string, string>): Promise<number[]> {
  const response = await api.get<string>('stock_availables', { params });
  const doc = parseXml(response.data);
  return Array.from(doc.querySelectorAll('stock_availables > stock_available'))
    .map(el => parseInt(el.getAttribute('id') ?? '0', 10))
    .filter(id => id > 0);
}
