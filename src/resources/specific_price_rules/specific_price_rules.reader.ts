import {
  getNodeText,
  getNodeInt,
  getNodeBool,
} from '../../utils/xml-utils';
import type { SpecificPriceRuleOutput, SpecificPriceRuleListItem } from './specific_price_rules.types';

export function parseSpecificPriceRule(doc: Document): SpecificPriceRuleOutput {
  const root = doc.querySelector('prestashop > specific_price_rule');
  if (!root) throw new Error('Invalid specific_price_rule response: <specific_price_rule> missing');
  return parseSpecificPriceRuleFromElement(root);
}

export function parseSpecificPriceRuleList(doc: Document): SpecificPriceRuleOutput[] {
  return Array.from(doc.querySelectorAll('prestashop > specific_price_rules > specific_price_rule'))
    .map(parseSpecificPriceRuleFromElement);
}

export function parseSpecificPriceRuleFromElement(el: Element): SpecificPriceRuleOutput {
  return {
    id:               getNodeInt(el, 'id') ?? 0,
    id_shop:          getNodeInt(el, 'id_shop') ?? 0,
    id_country:       getNodeInt(el, 'id_country') ?? 0,
    id_currency:      getNodeInt(el, 'id_currency') ?? 0,
    id_group:         getNodeInt(el, 'id_group') ?? 0,
    name:             getNodeText(el, 'name'),
    from_quantity:    getNodeInt(el, 'from_quantity') ?? 0,
    price:            parseFloat(getNodeText(el, 'price') || '0'),
    reduction:        parseFloat(getNodeText(el, 'reduction') || '0'),
    reduction_tax:    getNodeBool(el, 'reduction_tax'),
    reduction_type:   getNodeText(el, 'reduction_type'),
    from:             getNodeText(el, 'from'),
    to:               getNodeText(el, 'to'),
  };
}

export function parseSpecificPriceRuleIdList(doc: Document): SpecificPriceRuleListItem[] {
  return Array.from(doc.querySelectorAll('prestashop > specific_price_rules > specific_price_rule')).map(el => ({
    id:   parseInt(el.getAttribute('id') ?? '0', 10),
    href: el.getAttribute('xlink:href') ?? '',
  }));
}
