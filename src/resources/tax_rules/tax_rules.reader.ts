import {
	getNodeInt,
	getNodeText,
} from '../../utils/xml-utils';
import type { TaxRuleOutput, TaxRuleListItem } from './tax_rules.types';

export function parseTaxRule(doc: Document): TaxRuleOutput {
	const root = doc.querySelector('prestashop > tax_rule');
	if (!root) throw new Error('Invalid tax_rule response: <tax_rule> missing');
	return parseTaxRuleFromElement(root);
}

export function parseTaxRuleList(doc: Document): TaxRuleOutput[] {
	return Array.from(doc.querySelectorAll('prestashop > tax_rules > tax_rule'))
		.map(parseTaxRuleFromElement);
}

export function parseTaxRuleFromElement(el: Element): TaxRuleOutput {
	return {
		id: getNodeInt(el, 'id') ?? 0,
		id_tax_rules_group: getNodeInt(el, 'id_tax_rules_group') ?? 0,
		id_state: getNodeInt(el, 'id_state') ?? 0,
		id_country: getNodeInt(el, 'id_country') ?? 0,
		zipcode_from: getNodeText(el, 'zipcode_from'),
		zipcode_to: getNodeText(el, 'zipcode_to'),
		id_tax: getNodeInt(el, 'id_tax') ?? 0,
		behavior: getNodeInt(el, 'behavior') ?? 0,
		description: getNodeText(el, 'description'),
	};
}

export function parseTaxRuleIdList(doc: Document): TaxRuleListItem[] {
	return Array.from(doc.querySelectorAll('prestashop > tax_rules > tax_rule')).map(el => ({
		id: parseInt(el.getAttribute('id') ?? '0', 10),
		href: el.getAttribute('xlink:href') ?? '',
	}));
}
