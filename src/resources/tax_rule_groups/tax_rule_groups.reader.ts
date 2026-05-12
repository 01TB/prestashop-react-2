import {
	getNodeBool,
	getNodeInt,
	getNodeText,
} from '../../utils/xml-utils';
import type { TaxRuleGroupOutput, TaxRuleGroupListItem } from './tax_rule_groups.types';

export function parseTaxRuleGroup(doc: Document): TaxRuleGroupOutput {
	const root = doc.querySelector('prestashop > tax_rule_group');
	if (!root) throw new Error('Invalid tax_rule_group response: <tax_rule_group> missing');
	return parseTaxRuleGroupFromElement(root);
}

export function parseTaxRuleGroupList(doc: Document): TaxRuleGroupOutput[] {
	return Array.from(doc.querySelectorAll('prestashop > tax_rule_groups > tax_rule_group'))
		.map(parseTaxRuleGroupFromElement);
}

export function parseTaxRuleGroupFromElement(el: Element): TaxRuleGroupOutput {
	return {
		id: getNodeInt(el, 'id') ?? 0,
		name: getNodeText(el, 'name'),
		active: getNodeBool(el, 'active'),
		deleted: getNodeBool(el, 'deleted'),
		date_add: getNodeText(el, 'date_add'),
		date_upd: getNodeText(el, 'date_upd'),
	};
}

export function parseTaxRuleGroupIdList(doc: Document): TaxRuleGroupListItem[] {
	return Array.from(doc.querySelectorAll('prestashop > tax_rule_groups > tax_rule_group')).map(el => ({
		id: parseInt(el.getAttribute('id') ?? '0', 10),
		href: el.getAttribute('xlink:href') ?? '',
	}));
}
