import api from '../../services/api';
import { parseXml } from '../../utils/xml-utils';
import { parseOrder, parseOrderIdList, parseOrderList } from './orders.reader';
import { buildOrderPostXml, buildOrderPatchXml } from './orders.mapper';
import type {
  OrderCreateInput,
  OrderUpdateInput,
  OrderOutput,
  OrderListItem,
} from './orders.types';

// ─── POST ─────────────────────────────────────────────────────────────────────

export async function createOrder(data: OrderCreateInput): Promise<number> {
  const body = buildOrderPostXml(data);
  const response = await api.post<string>('orders', body);
  const doc = parseXml(response.data);
  return parseInt(doc.querySelector('order > id')?.textContent?.trim() ?? '0', 10);
}

// ─── PATCH ────────────────────────────────────────────────────────────────────

export async function updateOrder(id: number, data: Partial<OrderUpdateInput>): Promise<number> {
  const body = buildOrderPatchXml(id, data);
  const response = await api.patch<string>(`orders/${id}`, body);
  const doc = parseXml(response.data);
  return parseInt(doc.querySelector('order > id')?.textContent?.trim() ?? '0', 10);
}

// ─── GET item ─────────────────────────────────────────────────────────────────

/** Lit une commande par son ID. Retourne un objet TypeScript typé. */
export async function getOrder(id: number): Promise<OrderOutput> {
  const response = await api.get<string>(`orders/${id}`);
  return parseOrder(parseXml(response.data));
}

// ─── GET liste (IDs seulement) ────────────────────────────────────────────────

/** Liste les IDs de toutes les commandes. Rapide, sans les détails. */
export async function listOrderIds(params?: Record<string, string>): Promise<OrderListItem[]> {
  const response = await api.get<string>('orders', { params });
  return parseOrderIdList(parseXml(response.data));
}

// ─── GET liste complète ───────────────────────────────────────────────────────

/** Liste toutes les commandes avec tous leurs champs (display=full). */
export async function listOrders(params?: Record<string, string>): Promise<OrderOutput[]> {
  const response = await api.get<string>('orders', {
    params: { display: 'full', ...params },
  });
  return parseOrderList(parseXml(response.data));
}