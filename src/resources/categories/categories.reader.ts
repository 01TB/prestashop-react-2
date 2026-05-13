import {
	getNodeText,
	getNodeInt,
	getNodeBool,
	getNodeLangMap,
	getAssocIds,
} from '../../utils/xml-utils';
import type { CategoryOutput } from './categories.types';

export function parseCategory(doc: Document): CategoryOutput {
	const root = doc.querySelector('prestashop > category');
	if (!root) throw new Error('Réponse GET category invalide : nœud <category> absent');
	return parseCategoryFromElement(root);
}

export function parseCategoryList(doc: Document): CategoryOutput[] {
	return Array.from(doc.querySelectorAll('prestashop > categories > category'))
		.map(parseCategoryFromElement);
}

export function parseCategoryFromElement(el: Element): CategoryOutput {
	const categories = getAssocIds(el, 'associations > categories', 'category');
	const products = getAssocIds(el, 'associations > products', 'product');

	return {
		id: getNodeInt(el, 'id') ?? 0,
		id_parent: getNodeInt(el, 'id_parent'),
		level_depth: getNodeInt(el, 'level_depth'),
		nb_products_recursive: getNodeInt(el, 'nb_products_recursive'),
		active: getNodeBool(el, 'active'),
		id_shop_default: getNodeInt(el, 'id_shop_default'),
		is_root_category: getNodeBool(el, 'is_root_category'),
		position: getNodeInt(el, 'position'),
		date_add: getNodeText(el, 'date_add'),
		date_upd: getNodeText(el, 'date_upd'),
		name: getNodeLangMap(el, 'name'),
		link_rewrite: getNodeLangMap(el, 'link_rewrite'),
		description: getNodeLangMap(el, 'description'),
		additional_description: getNodeLangMap(el, 'additional_description'),
		meta_title: getNodeLangMap(el, 'meta_title'),
		meta_description: getNodeLangMap(el, 'meta_description'),
		meta_keywords: getNodeLangMap(el, 'meta_keywords'),
		categories,
		products,
	};
}

