import api from '../../services/api';
import { parseXml, getNodeText } from '../../utils/xml-utils';
import {
  buildProductOptionPostXml,
  buildProductOptionPatchXml,
} from './product_options.mapper';
import {
  parseProductOption,
  parseProductOptionIdList,
  parseProductOptionList,
} from './product_options.reader';
import type {
  ProductOptionCreateInput,
  ProductOptionUpdateInput,
  ProductOptionOutput,
  ProductOptionListItem,
} from './product_options.types';

export async function createProductOption(data: ProductOptionCreateInput): Promise<number> {
  const body = buildProductOptionPostXml(data);
  const response = await api.post<string>('product_options', body);
  const doc = parseXml(response.data);
  return parseInt(getNodeText(doc.documentElement, 'id'), 10);
}

export async function updateProductOption(
  id: number,
  data: Partial<ProductOptionUpdateInput>
): Promise<number> {
  const body = buildProductOptionPatchXml(id, data);
  const response = await api.patch<string>(`product_options/${id}`, body);
  const doc = parseXml(response.data);
  return parseInt(getNodeText(doc.documentElement, 'id'), 10);
}

export async function getProductOption(id: number): Promise<ProductOptionOutput> {
  const response = await api.get<string>(`product_options/${id}`);
  return parseProductOption(parseXml(response.data));
}

export async function listProductOptionIds(
  params?: Record<string, string>
): Promise<ProductOptionListItem[]> {
  const response = await api.get<string>('product_options', { params });
  return parseProductOptionIdList(parseXml(response.data));
}

export async function listProductOptions(
  params?: Record<string, string>
): Promise<ProductOptionOutput[]> {
  const response = await api.get<string>('product_options', {
    params: { display: 'full', ...params },
  });
  return parseProductOptionList(parseXml(response.data));
}
