import api from '../../services/api';
import { parseXml, getNodeText } from '../../utils/xml-utils';
import { buildAddressPostXml, buildAddressPatchXml } from './addresses.mapper';
import { parseAddress, parseAddressIdList, parseAddressList } from './addresses.reader';
import type {
  AddressCreateInput,
  AddressUpdateInput,
  AddressOutput,
  AddressListItem,
} from './addresses.types';

export async function createAddress(data: AddressCreateInput): Promise<number> {
  const body = buildAddressPostXml(data);
  const response = await api.post<string>('addresses', body);
  const doc = parseXml(response.data);
  return parseInt(getNodeText(doc.documentElement, 'id'), 10);
}

export async function updateAddress(
  id: number,
  data: Partial<AddressUpdateInput>
): Promise<number> {
  const body = buildAddressPatchXml(id, data);
  const response = await api.patch<string>(`addresses/${id}`, body);
  const doc = parseXml(response.data);
  return parseInt(getNodeText(doc.documentElement, 'id'), 10);
}

export async function getAddress(id: number): Promise<AddressOutput> {
  const response = await api.get<string>(`addresses/${id}`);
  return parseAddress(parseXml(response.data));
}

export async function listAddressIds(
  params?: Record<string, string>
): Promise<AddressListItem[]> {
  const response = await api.get<string>('addresses', { params });
  return parseAddressIdList(parseXml(response.data));
}

export async function listAddresses(
  params?: Record<string, string>
): Promise<AddressOutput[]> {
  const response = await api.get<string>('addresses', {
    params: { display: 'full', ...params },
  });
  return parseAddressList(parseXml(response.data));
}

export async function deleteAddress(id: number): Promise<void> {
  await api.delete(`addresses/${id}`);
}
