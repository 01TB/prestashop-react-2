import api from '../../services/api';
import { parseXml } from '../../utils/xml-utils';
import { 
  buildStockMovementReasonPostXml, 
  buildStockMovementReasonPatchXml 
} from './stock_movement_reasons.mapper';
import { 
  parseStockMovementReason, 
  parseStockMovementReasonIdList, 
  parseStockMovementReasonList 
} from './stock_movement_reasons.reader';
import type { 
  StockMovementReasonCreateInput, 
  StockMovementReasonUpdateInput, 
  StockMovementReasonOutput, 
  StockMovementReasonListItem 
} from './stock_movement_reasons.types';

// ─── POST ─────────────────────────────────────────────────────────────────────

export async function createStockMovementReason(data: StockMovementReasonCreateInput): Promise<number> {
  const body = buildStockMovementReasonPostXml(data);
  const response = await api.post<string>('stock_movement_reasons', body);
  const doc = parseXml(response.data);
  return parseInt(doc.querySelector('stock_movement_reason > id')?.textContent?.trim() ?? '0', 10);
}

// ─── PATCH ────────────────────────────────────────────────────────────────────

export async function updateStockMovementReason(
  id: number, 
  data: Partial<StockMovementReasonUpdateInput>
): Promise<number> {
  const body = buildStockMovementReasonPatchXml(id, data);
  const response = await api.patch<string>(`stock_movement_reasons/${id}`, body);
  const doc = parseXml(response.data);
  return parseInt(doc.querySelector('stock_movement_reason > id')?.textContent?.trim() ?? '0', 10);
}

// ─── GET ──────────────────────────────────────────────────────────────────────

export async function getStockMovementReason(id: number): Promise<StockMovementReasonOutput> {
  const response = await api.get<string>(`stock_movement_reasons/${id}`);
  return parseStockMovementReason(parseXml(response.data));
}

export async function listStockMovementReasonIds(params?: Record<string, string>): Promise<StockMovementReasonListItem[]> {
  const response = await api.get<string>('stock_movement_reasons', { params });
  return parseStockMovementReasonIdList(parseXml(response.data));
}

export async function listStockMovementReasons(params?: Record<string, string>): Promise<StockMovementReasonOutput[]> {
  const response = await api.get<string>('stock_movement_reasons', {
    params: { display: 'full', ...params },
  });
  return parseStockMovementReasonList(parseXml(response.data));
}

// ─── DELETE ───────────────────────────────────────────────────────────────────

export async function deleteStockMovementReason(id: number): Promise<void> {
    await api.delete(`stock_movement_reasons/${id}`);
}