import api from '../../services/api';
import { parseXml, getNodeText } from '../../utils/xml-utils';
import { buildProductPostXml, buildProductPatchXml } from './products.mapper';
import {
    parseProduct,
    parseProductList,
    parseProductMyPrice, parseProductMyPriceList,
    parseProductTtc,
    parseProductTtcList
} from './products.reader';
import type {
    ProductCreateInput,
    ProductUpdateInput,
    ProductOutput,
    ProductTtcOutput,
    ProductMyPriceOutput
} from './products.types';

export async function createProduct(data: ProductCreateInput): Promise<number> {
  const body = buildProductPostXml(data);
  const response = await api.post<string>('products', body);
  const doc = parseXml(response.data);
  return parseInt(getNodeText(doc.documentElement, 'id'), 10);
}

export async function updateProduct(
  id: number,
  data: Partial<ProductUpdateInput>
): Promise<number> {
  const body = buildProductPatchXml(id, data);
  const response = await api.patch<string>(`products/${id}`, body);
  const doc = parseXml(response.data);
  return parseInt(getNodeText(doc.documentElement, 'id'), 10);
}

/** Lit un produit par son ID. */
export async function getProduct(id: number): Promise<ProductOutput> {
  const response = await api.get<string>(`products/${id}`);
  return parseProduct(parseXml(response.data));
}

export async function getProductTtc(id: number): Promise<ProductTtcOutput> {
    const response = await api.get<string>(`products/${id}`, {
        params: {
            display: 'full',
            'price[price_ttc][use_tax]':'1',
            'price[price_ttc][use_reduction]':'1',
            'price[price_ttc][id_country]':'8',
        },
    });
    return parseProductTtc(parseXml(response.data));
}

export async function getProductTtcWithParams(id: number, params?: Record<string, string>): Promise<ProductTtcOutput> {
    const response = await api.get<string>(`products/${id}`, {
        params: {
            display: 'full',
            ...params
        },
    });
    return parseProductTtc(parseXml(response.data));
}

export async function getProductMyPrice(id: number, params: Record<string, string>): Promise<ProductMyPriceOutput> {
    const response = await api.get<string>(`products/${id}`, {
        params: {
            display: 'full',
            ...params
        },
    });
    return parseProductMyPrice(parseXml(response.data));
}

/** Liste tous les produits (display=full). Filtres optionnels. */
export async function listProducts(
  params?: Record<string, string>
): Promise<ProductOutput[]> {
  const response = await api.get<string>('products', {
    params: { display: 'full', ...params },
  });
  return parseProductList(parseXml(response.data));
}

/** Liste de tous les produits avec le prix TTC **/
export async function listProductsTtc(
    params?: Record<string, string>
): Promise<ProductTtcOutput[]> {
    const response = await api.get<string>('products', {
        params: {
            display: 'full',
            'price[price_ttc][use_tax]':'1',
            'price[price_ttc][use_reduction]':'1',
            'price[price_ttc][id_country]':'8',
            ...params },
    });
    return parseProductTtcList(parseXml(response.data));
}

/** Liste tous les produits avec prix spécial (display=full). Filtres optionnels. */
export async function listProductsMyPrice(
    params: Record<string, string>
): Promise<ProductMyPriceOutput[]> {
    const response = await api.get<string>('products', {
        params: { display: 'full', ...params },
    });
    return parseProductMyPriceList(parseXml(response.data));
}

/** Liste uniquement les IDs de produits. Plus léger que display=full. */
export async function listProductIds(
  params?: Record<string, string>
): Promise<number[]> {
  const response = await api.get<string>('products', { params });
  const doc = parseXml(response.data);
  return Array.from(doc.querySelectorAll('products > product'))
    .map(el => parseInt(el.getAttribute('id') ?? '0', 10))
    .filter(id => id > 0);
}

