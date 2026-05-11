import api from '../../services/api';
import { parseXml, getNodeText } from '../../utils/xml-utils';
import { buildCustomerPostXml, buildCustomerPatchXml } from './customers.mapper';
import { parseCustomer, parseCustomerIdList, parseCustomerList } from './customers.reader';
import type {
  CustomerCreateInput,
  CustomerUpdateInput,
  CustomerOutput,
  CustomerListItem,
} from './customers.types';

export async function createCustomer(data: CustomerCreateInput): Promise<number> {
  const body = buildCustomerPostXml(data);
  const response = await api.post<string>('customers', body);
  const doc = parseXml(response.data);
  return parseInt(getNodeText(doc.documentElement, 'id'), 10);
}

export async function updateCustomer(
  id: number,
  data: Partial<CustomerUpdateInput>
): Promise<number> {
  const body = buildCustomerPatchXml(id, data);
  const response = await api.patch<string>(`customers/${id}`, body);
  const doc = parseXml(response.data);
  return parseInt(getNodeText(doc.documentElement, 'id'), 10);
}

export async function getCustomer(id: number): Promise<CustomerOutput> {
  const response = await api.get<string>(`customers/${id}`);
  return parseCustomer(parseXml(response.data));
}

export async function listCustomerIds(
  params?: Record<string, string>
): Promise<CustomerListItem[]> {
  const response = await api.get<string>('customers', { params });
  return parseCustomerIdList(parseXml(response.data));
}

export async function listCustomers(
  params?: Record<string, string>
): Promise<CustomerOutput[]> {
  const response = await api.get<string>('customers', {
    params: { display: 'full', ...params },
  });
  return parseCustomerList(parseXml(response.data));
}
