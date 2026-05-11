import {
  getNodeText,
  getNodeInt,
  getNodeFloat,
  getNodeBool,
  getNodeLangMap,
  getAssocIds,
} from '../../utils/xml-utils';
import type { CombinationOutput, CombinationListItem } from './combinations.types';

export function parseCombination(doc: Document): CombinationOutput {
  const root = doc.querySelector('prestashop > combination');
  if (!root) throw new Error('Invalid combination response: <combination> missing');
  return parseCombinationFromElement(root);
}

export function parseCombinationList(doc: Document): CombinationOutput[] {
  return Array.from(doc.querySelectorAll('prestashop > combinations > combination'))
    .map(parseCombinationFromElement);
}

export function parseCombinationFromElement(el: Element): CombinationOutput {
  const productOptionValues = getAssocIds(el, 'associations > product_option_values', 'product_option_value');
  const images = getAssocIds(el, 'associations > images', 'image');

  return {
    id:                 getNodeInt(el, 'id') ?? 0,
    id_product:         getNodeInt(el, 'id_product') ?? 0,
    ean13:              getNodeText(el, 'ean13'),
    isbn:               getNodeText(el, 'isbn'),
    upc:                getNodeText(el, 'upc'),
    mpn:                getNodeText(el, 'mpn'),
    reference:          getNodeText(el, 'reference'),
    supplier_reference: getNodeText(el, 'supplier_reference'),
    wholesale_price:    getNodeFloat(el, 'wholesale_price') ?? 0,
    price:              getNodeFloat(el, 'price') ?? 0,
    ecotax:             getNodeFloat(el, 'ecotax') ?? 0,
    weight:             getNodeFloat(el, 'weight') ?? 0,
    unit_price_impact:  getNodeFloat(el, 'unit_price_impact') ?? 0,
    minimal_quantity:   getNodeInt(el, 'minimal_quantity') ?? 1,
    low_stock_threshold: getNodeInt(el, 'low_stock_threshold'),
    low_stock_alert:    getNodeBool(el, 'low_stock_alert'),
    default_on:         getNodeBool(el, 'default_on'),
    available_date:     getNodeText(el, 'available_date'),
    available_now:      getNodeLangMap(el, 'available_now'),
    available_later:    getNodeLangMap(el, 'available_later'),
    product_option_values: productOptionValues,
    images,
  };
}

export function parseCombinationIdList(doc: Document): CombinationListItem[] {
  return Array.from(doc.querySelectorAll('prestashop > combinations > combination')).map(el => ({
    id:   parseInt(el.getAttribute('id') ?? '0', 10),
    href: el.getAttribute('xlink:href') ?? '',
  }));
}
