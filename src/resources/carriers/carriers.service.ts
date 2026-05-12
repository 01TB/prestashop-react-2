import api from '../../services/api';
import { parseXml, getNodeText } from '../../utils/xml-utils';
import { buildCarrierPostXml, buildCarrierPatchXml } from './carriers.mapper';
import { parseCarrier, parseCarrierIdList, parseCarrierList } from './carriers.reader';
import type {
  CarrierCreateInput,
  CarrierUpdateInput,
  CarrierOutput,
  CarrierListItem,
} from './carriers.types';

export async function createCarrier(data: CarrierCreateInput): Promise<number> {
  const body = buildCarrierPostXml(data);
  const response = await api.post<string>('carriers', body);
  const doc = parseXml(response.data);
  return parseInt(getNodeText(doc.documentElement, 'id'), 10);
}

export async function updateCarrier(
  id: number,
  data: Partial<CarrierUpdateInput>
): Promise<number> {
  const body = buildCarrierPatchXml(id, data);
  const response = await api.patch<string>(`carriers/${id}`, body);
  const doc = parseXml(response.data);
  return parseInt(getNodeText(doc.documentElement, 'id'), 10);
}

export async function getCarrier(id: number): Promise<CarrierOutput> {
  const response = await api.get<string>(`carriers/${id}`);
  return parseCarrier(parseXml(response.data));
}

export async function listCarrierIds(
  params?: Record<string, string>
): Promise<CarrierListItem[]> {
  const response = await api.get<string>('carriers', { params });
  return parseCarrierIdList(parseXml(response.data));
}

export async function listCarriers(
  params?: Record<string, string>
): Promise<CarrierOutput[]> {
  const response = await api.get<string>('carriers', {
    params: { display: 'full', ...params },
  });
  return parseCarrierList(parseXml(response.data));
}
