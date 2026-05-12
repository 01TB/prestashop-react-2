import api from '../../services/api';
import { parseXml, getNodeText } from '../../utils/xml-utils';
import { buildCartPostXml, buildCartPatchXml, buildCartPutXml } from './carts.mapper';
import { parseCart, parseCartIdList, parseCartList } from './carts.reader';
import type {
  CartCreateInput,
  CartUpdateInput,
  CartOutput,
  CartListItem,
} from './carts.types';

export async function createCart(data: CartCreateInput): Promise<number> {
  const body = buildCartPostXml(data);
  const response = await api.post<string>('carts', body);
  const doc = parseXml(response.data);
  return parseInt(getNodeText(doc.documentElement, 'id'), 10);
}

export async function updateCart(
  id: number,
  data: Partial<CartUpdateInput>
): Promise<number> {
  const body = buildCartPatchXml(id, data);
  const response = await api.patch<string>(`carts/${id}`, body);
  const doc = parseXml(response.data);
  return parseInt(getNodeText(doc.documentElement, 'id'), 10);
}

export async function replaceCart(
  id: number,
  data: CartUpdateInput
): Promise<number> {
  const body = buildCartPutXml(id, data);
  const response = await api.put<string>(`carts/${id}`, body);
  const doc = parseXml(response.data);
  return parseInt(getNodeText(doc.documentElement, 'id'), 10);
}

export async function getCart(id: number): Promise<CartOutput> {
  const response = await api.get<string>(`carts/${id}`);
  return parseCart(parseXml(response.data));
}

export async function listCartIds(
  params?: Record<string, string>
): Promise<CartListItem[]> {
  const response = await api.get<string>('carts', { params });
  return parseCartIdList(parseXml(response.data));
}

export async function listCarts(
  params?: Record<string, string>
): Promise<CartOutput[]> {
  const response = await api.get<string>('carts', {
    params: { display: 'full', ...params },
  });
  return parseCartList(parseXml(response.data));
}
