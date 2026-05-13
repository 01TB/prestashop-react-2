import api from '../../services/api';
import { parseXml, getNodeText } from '../../utils/xml-utils';
import { buildCategoryPostXml, buildCategoryPatchXml } from './categories.mapper';
import { parseCategory, parseCategoryList } from './categories.reader';
import type { CategoryCreateInput, CategoryUpdateInput, CategoryOutput } from './categories.types';

export async function createCategory(data: CategoryCreateInput): Promise<number> {
	const body = buildCategoryPostXml(data);
	const response = await api.post<string>('categories', body);
	const doc = parseXml(response.data);
	return parseInt(getNodeText(doc.documentElement, 'id'), 10);
}

export async function updateCategory(
	id: number,
	data: Partial<CategoryUpdateInput>
): Promise<number> {
	const body = buildCategoryPatchXml(id, data);
	const response = await api.patch<string>(`categories/${id}`, body);
	const doc = parseXml(response.data);
	return parseInt(getNodeText(doc.documentElement, 'id'), 10);
}

export async function getCategory(id: number): Promise<CategoryOutput> {
	const response = await api.get<string>(`categories/${id}`);
	return parseCategory(parseXml(response.data));
}

export async function listCategories(params?: Record<string, string>): Promise<CategoryOutput[]> {
	const response = await api.get<string>('categories', { params: { display: 'full', ...params } });
	return parseCategoryList(parseXml(response.data));
}

export async function listCategoryIds(params?: Record<string, string>): Promise<number[]> {
	const response = await api.get<string>('categories', { params });
	const doc = parseXml(response.data);
	return Array.from(doc.querySelectorAll('categories > category'))
		.map(el => parseInt(el.getAttribute('id') ?? '0', 10))
		.filter(id => id > 0);
}

