import {
  getNodeText,
  getNodeInt,
  getNodeLangMap,
} from '../../utils/xml-utils';
import type {
  ProductOptionValueOutput,
  ProductOptionValueListItem,
} from './product_option_values.types';

export function parseProductOptionValue(doc: Document): ProductOptionValueOutput {
  const root = doc.querySelector('prestashop > product_option_value');
  if (!root) throw new Error('Invalid product_option_value response: <product_option_value> missing');
  return parseProductOptionValueFromElement(root);
}

export function parseProductOptionValueList(doc: Document): ProductOptionValueOutput[] {
  return Array.from(doc.querySelectorAll('prestashop > product_option_values > product_option_value'))
    .map(parseProductOptionValueFromElement);
}

export function parseProductOptionValueFromElement(el: Element): ProductOptionValueOutput {
  return {
    id:                 getNodeInt(el, 'id') ?? 0,
    id_attribute_group: getNodeInt(el, 'id_attribute_group') ?? 0,
    color:              getNodeText(el, 'color'),
    position:           getNodeInt(el, 'position') ?? 0,
    name:               getNodeLangMap(el, 'name'),
  };
}

export function parseProductOptionValueIdList(doc: Document): ProductOptionValueListItem[] {
  return Array.from(doc.querySelectorAll('prestashop > product_option_values > product_option_value')).map(el => ({
    id:   parseInt(el.getAttribute('id') ?? '0', 10),
    href: el.getAttribute('xlink:href') ?? '',
  }));
}
