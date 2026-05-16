import api from '../../services/api';
import { parseXml, getNodeText } from '../../utils/xml-utils';
import { buildStockPostXml, buildStockPatchXml } from './stocks.mapper';
import { parseStock, parseStockList, parseStockIdList } from './stocks.reader';
import type {
  StockCreateInput,
  StockUpdateInput,
  StockOutput,
  StockListItem,
} from './stocks.types';

// ─── POST ─────────────────────────────────────────────────────────────────────

export async function createStock(data: StockCreateInput): Promise<number> {
  const body = buildStockPostXml(data);
  const response = await api.post<string>('stocks', body);
  const doc = parseXml(response.data);
  return parseInt(getNodeText(doc.documentElement, 'id') || '0', 10);
}

// ─── PATCH ────────────────────────────────────────────────────────────────────

export async function updateStock(
  id: number,
  data: Partial<StockUpdateInput>
): Promise<number> {
  const body = buildStockPatchXml(id, data);
  const response = await api.patch<string>(`stocks/${id}`, body);
  const doc = parseXml(response.data);
  return parseInt(getNodeText(doc.documentElement, 'id') || '0', 10);
}

// ─── GET item ─────────────────────────────────────────────────────────────────

export async function getStock(id: number): Promise<StockOutput> {
  const response = await api.get<string>(`stocks/${id}`);
  return parseStock(parseXml(response.data));
}

// ─── GET liste (complets) ─────────────────────────────────────────────────────

export async function listStocks(
  params?: Record<string, string>
): Promise<StockOutput[]> {
  const response = await api.get<string>('stocks', {
    params: { display: 'full', ...params },
  });
  return parseStockList(parseXml(response.data));
}

// ─── GET liste (IDs uniquement) ───────────────────────────────────────────────

export async function listStockIds(
  params?: Record<string, string>
): Promise<StockListItem[]> {
  const response = await api.get<string>('stocks', { params });
  return parseStockIdList(parseXml(response.data));
}

// ─── DELETE ───────────────────────────────────────────────────────────────────

export async function deleteStock(id: number): Promise<void> {
    await api.delete(`stocks/${id}`);
}