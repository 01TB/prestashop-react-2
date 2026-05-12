import api from '../../services/api';
import { parseXml, getNodeText } from '../../utils/xml-utils';
import { buildGuestPostXml, buildGuestPatchXml } from './guests.mapper';
import { parseGuest, parseGuestIdList, parseGuestList } from './guests.reader';
import type {
  GuestCreateInput,
  GuestUpdateInput,
  GuestOutput,
  GuestListItem,
} from './guests.types';

export async function createGuest(data: GuestCreateInput | number = 0): Promise<number> {
  const payload: GuestCreateInput =
    typeof data === 'number' ? { id_customer: data } : data;
  const body = buildGuestPostXml(payload);
  const response = await api.post<string>('guests', body);
  const doc = parseXml(response.data);
  return parseInt(getNodeText(doc.documentElement, 'id'), 10);
}

export async function updateGuest(
  id: number,
  data: Partial<GuestUpdateInput>
): Promise<number> {
  const body = buildGuestPatchXml(id, data);
  const response = await api.patch<string>(`guests/${id}`, body);
  const doc = parseXml(response.data);
  return parseInt(getNodeText(doc.documentElement, 'id'), 10);
}

export async function getGuest(id: number): Promise<GuestOutput> {
  const response = await api.get<string>(`guests/${id}`);
  return parseGuest(parseXml(response.data));
}

export async function listGuestIds(
  params?: Record<string, string>
): Promise<GuestListItem[]> {
  const response = await api.get<string>('guests', { params });
  return parseGuestIdList(parseXml(response.data));
}

export async function listGuests(
  params?: Record<string, string>
): Promise<GuestOutput[]> {
  const response = await api.get<string>('guests', {
    params: { display: 'full', ...params },
  });
  return parseGuestList(parseXml(response.data));
}
