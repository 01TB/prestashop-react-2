import {
	getNodeBool,
	getNodeFloat,
	getNodeInt,
	getNodeLangMap,
} from '../../utils/xml-utils';
import type { TaxOutput, TaxListItem } from './taxes.types';

export function parseTax(doc: Document): TaxOutput {
	const root = doc.querySelector('prestashop > tax');
	if (!root) throw new Error('Invalid tax response: <tax> missing');
	return parseTaxFromElement(root);
}

export function parseTaxList(doc: Document): TaxOutput[] {
	return Array.from(doc.querySelectorAll('prestashop > taxes > tax'))
		.map(parseTaxFromElement);
}

export function parseTaxFromElement(el: Element): TaxOutput {
	return {
		id: getNodeInt(el, 'id') ?? 0,
		rate: getNodeFloat(el, 'rate') ?? 0,
		active: getNodeBool(el, 'active'),
		deleted: getNodeBool(el, 'deleted'),
		name: getNodeLangMap(el, 'name'),
	};
}

export function parseTaxIdList(doc: Document): TaxListItem[] {
	return Array.from(doc.querySelectorAll('prestashop > taxes > tax')).map(el => ({
		id: parseInt(el.getAttribute('id') ?? '0', 10),
		href: el.getAttribute('xlink:href') ?? '',
	}));
}
