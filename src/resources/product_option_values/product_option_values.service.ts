import api from '../../services/api';
import { parseXml, getNodeText } from '../../utils/xml-utils';
import {
  buildProductOptionValuePostXml,
  buildProductOptionValuePatchXml,
} from './product_option_values.mapper';
import {
  parseProductOptionValue,
  parseProductOptionValueIdList,
  parseProductOptionValueList,
} from './product_option_values.reader';
import type {
  ProductOptionValueCreateInput,
  ProductOptionValueUpdateInput,
  ProductOptionValueOutput,
  ProductOptionValueListItem,
} from './product_option_values.types';

export async function createProductOptionValue(
  data: ProductOptionValueCreateInput
): Promise<number> {
  const body = buildProductOptionValuePostXml(data);
  const response = await api.post<string>('product_option_values', body);
  const doc = parseXml(response.data);
  return parseInt(getNodeText(doc.documentElement, 'id'), 10);
}

export async function updateProductOptionValue(
  id: number,
  data: Partial<ProductOptionValueUpdateInput>
): Promise<number> {
  const body = buildProductOptionValuePatchXml(id, data);
  const response = await api.patch<string>(`product_option_values/${id}`, body);
  const doc = parseXml(response.data);
  return parseInt(getNodeText(doc.documentElement, 'id'), 10);
}

export async function getProductOptionValue(id: number): Promise<ProductOptionValueOutput> {
  const response = await api.get<string>(`product_option_values/${id}`);
  return parseProductOptionValue(parseXml(response.data));
}

export async function listProductOptionValueIds(
  params?: Record<string, string>
): Promise<ProductOptionValueListItem[]> {
  const response = await api.get<string>('product_option_values', { params });
  return parseProductOptionValueIdList(parseXml(response.data));
}

export async function listProductOptionValues(
  params?: Record<string, string>
): Promise<ProductOptionValueOutput[]> {
  const response = await api.get<string>('product_option_values', {
    params: { display: 'full', ...params },
  });
  return parseProductOptionValueList(parseXml(response.data));
}
