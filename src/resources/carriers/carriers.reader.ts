import {
  getNodeBool,
  getNodeInt,
  getNodeFloat,
  getNodeLangMap,
  getNodeText,
} from '../../utils/xml-utils';
import type { CarrierOutput, CarrierListItem } from './carriers.types';

export function parseCarrier(doc: Document): CarrierOutput {
  const root = doc.querySelector('prestashop > carrier');
  if (!root) throw new Error('Invalid carrier response: <carrier> missing');
  return parseCarrierFromElement(root);
}

export function parseCarrierList(doc: Document): CarrierOutput[] {
  return Array.from(doc.querySelectorAll('prestashop > carriers > carrier'))
    .map(parseCarrierFromElement);
}

export function parseCarrierFromElement(el: Element): CarrierOutput {
  return {
    id: getNodeInt(el, 'id') ?? 0,
    deleted: getNodeBool(el, 'deleted'),
    is_module: getNodeBool(el, 'is_module'),
    id_tax_rules_group: getNodeInt(el, 'id_tax_rules_group'),
    id_reference: getNodeInt(el, 'id_reference'),
    name: getNodeText(el, 'name'),
    active: getNodeBool(el, 'active'),
    is_free: getNodeBool(el, 'is_free'),
    url: getNodeText(el, 'url'),
    shipping_handling: getNodeBool(el, 'shipping_handling'),
    shipping_external: getNodeBool(el, 'shipping_external'),
    range_behavior: getNodeBool(el, 'range_behavior'),
    shipping_method: getNodeInt(el, 'shipping_method') ?? 0,
    max_width: getNodeInt(el, 'max_width'),
    max_height: getNodeInt(el, 'max_height'),
    max_depth: getNodeInt(el, 'max_depth'),
    max_weight: getNodeFloat(el, 'max_weight'),
    grade: getNodeInt(el, 'grade'),
    external_module_name: getNodeText(el, 'external_module_name'),
    need_range: getNodeBool(el, 'need_range'),
    position: getNodeInt(el, 'position'),
    delay: getNodeLangMap(el, 'delay'),
  };
}

export function parseCarrierIdList(doc: Document): CarrierListItem[] {
  return Array.from(doc.querySelectorAll('prestashop > carriers > carrier')).map(el => ({
    id: parseInt(el.getAttribute('id') ?? '0', 10),
    href: el.getAttribute('xlink:href') ?? '',
  }));
}
