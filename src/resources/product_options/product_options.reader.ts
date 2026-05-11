import {
  getNodeText,
  getNodeInt,
  getNodeBool,
  getNodeLangMap,
  getAssocIds,
} from '../../utils/xml-utils';
import type { ProductOptionOutput, ProductOptionListItem } from './product_options.types';

export function parseProductOption(doc: Document): ProductOptionOutput {
  const root = doc.querySelector('prestashop > product_option');
  if (!root) throw new Error('Invalid product_option response: <product_option> missing');
  return parseProductOptionFromElement(root);
}

export function parseProductOptionList(doc: Document): ProductOptionOutput[] {
  return Array.from(doc.querySelectorAll('prestashop > product_options > product_option'))
    .map(parseProductOptionFromElement);
}

export function parseProductOptionFromElement(el: Element): ProductOptionOutput {
  const productOptionValues = getAssocIds(el, 'associations > product_option_values', 'product_option_value');

  return {
    id:                 getNodeInt(el, 'id') ?? 0,
    is_color_group:     getNodeBool(el, 'is_color_group'),
    group_type:         getNodeText(el, 'group_type'),
    position:           getNodeInt(el, 'position') ?? 0,
    name:               getNodeLangMap(el, 'name'),
    public_name:        getNodeLangMap(el, 'public_name'),
    product_option_values: productOptionValues,
  };
}

export function parseProductOptionIdList(doc: Document): ProductOptionListItem[] {
  return Array.from(doc.querySelectorAll('prestashop > product_options > product_option')).map(el => ({
    id:   parseInt(el.getAttribute('id') ?? '0', 10),
    href: el.getAttribute('xlink:href') ?? '',
  }));
}
