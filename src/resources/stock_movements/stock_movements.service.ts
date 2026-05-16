import api from '../../services/api';
import { parseXml, getNodeText } from '../../utils/xml-utils';
import {
  buildStockMovementPostXml,
  buildStockMovementPatchXml,
} from './stock_movements.mapper';
import {
  parseStockMovement,
  parseStockMovementList,
  parseStockMovementListIds,
} from './stock_movements.reader';
import type {
  StockMovement,
  StockMovementCreateInput,
  StockMovementUpdateInput,
  StockMovementListItem,
} from './stock_movements.types';

/**
 * Stock Movement Service
 * Handles all CRUD operations for stock movements
 */

/**
 * Creates a new stock movement
 * @param data Stock movement data to create
 * @returns The ID of the created stock movement
 */
export async function createStockMovement(
  data: StockMovementCreateInput
): Promise<number> {
  const body = buildStockMovementPostXml(data);
  const response = await api.post<string>('stock_movements', body);
  const doc = parseXml(response.data);
  return parseInt(getNodeText(doc.documentElement, 'id'), 10);
}

/**
 * Updates a stock movement (partial update)
 * @param id Stock movement ID to update
 * @param data Fields to update (only defined fields are sent)
 * @returns The ID of the updated stock movement
 */
export async function updateStockMovement(
  id: number,
  data: Partial<StockMovementUpdateInput>
): Promise<number> {
  const body = buildStockMovementPatchXml(id, data);
  const response = await api.put<string>(`stock_movements/${id}`, body);
  const doc = parseXml(response.data);
  return parseInt(getNodeText(doc.documentElement, 'id'), 10);
}

/**
 * Retrieves a single stock movement by ID
 * @param id Stock movement ID
 * @param params Query params
 * @returns Parsed stock movement object
 */
export async function getStockMovement(id: number, params?: Record<string, string>): Promise<StockMovement> {
  const response = await api.get<string>(`stock_movements/${id}`,{
      params: {
          display: 'full',
          ...params
      },
  });
  const doc = parseXml(response.data);
  return parseStockMovement(doc);
}

/**
 * Lists all stock movements with full details
 * @param params Query params
 * @returns Array of stock movements
 */
export async function listStockMovements(params?: Record<string, string>): Promise<StockMovement[]> {
  const response = await api.get<string>('stock_movements',{
      params: {
          display: 'full',
          ...params
      },
  });
  const doc = parseXml(response.data);
  return parseStockMovementList(doc);
}

/**
 * Lists all stock movement IDs (simple listing)
 * @returns Array of stock movement IDs with xlink references
 */
export async function listStockMovementIds(): Promise<StockMovementListItem[]> {
  const response = await api.get<string>('stock_movements');
  const doc = parseXml(response.data);
  return parseStockMovementListIds(doc);
}

/**
 * Deletes a stock movement
 * @param id Stock movement ID to delete
 */
export async function deleteStockMovement(id: number): Promise<void> {
  await api.delete(`stock_movements/${id}`);
}
