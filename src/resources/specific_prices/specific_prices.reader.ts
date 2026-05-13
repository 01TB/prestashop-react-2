import {
  getNodeText,
  getNodeInt,
  getNodeFloat,
  getNodeBool,
} from '../../utils/xml-utils';
import type { SpecificPriceOutput } from './specific_prices.types';

export function parseSpecificPrice(doc: Document): SpecificPriceOutput {
  const root = doc.querySelector('prestashop > specific_price');
  if (!root) throw new Error('Réponse GET specific_price invalide : nœud <specific_price> absent');
  return parseSpecificPriceFromElement(root);
}

export function parseSpecificPriceList(doc: Document): SpecificPriceOutput[] {
  return Array.from(doc.querySelectorAll('prestashop > specific_prices > specific_price'))
    .map(parseSpecificPriceFromElement);
}

export function parseSpecificPriceFromElement(el: Element): SpecificPriceOutput {
  return {
    id: getNodeInt(el, 'id') ?? 0,
    id_shop_group: getNodeInt(el, 'id_shop_group'),
    id_shop: getNodeInt(el, 'id_shop') ?? 0,
    id_cart: getNodeInt(el, 'id_cart') ?? 0,
    id_product: getNodeInt(el, 'id_product') ?? 0,
    id_product_attribute: getNodeInt(el, 'id_product_attribute'),
    id_currency: getNodeInt(el, 'id_currency') ?? 0,
    id_country: getNodeInt(el, 'id_country') ?? 0,
    id_group: getNodeInt(el, 'id_group') ?? 0,
    id_customer: getNodeInt(el, 'id_customer') ?? 0,
    id_specific_price_rule: getNodeInt(el, 'id_specific_price_rule'),
    price: getNodeFloat(el, 'price') ?? 0,
    from_quantity: getNodeInt(el, 'from_quantity') ?? 1,
    reduction: getNodeFloat(el, 'reduction') ?? 0,
    reduction_tax: getNodeBool(el, 'reduction_tax'),
    reduction_type: getNodeText(el, 'reduction_type'),
    from: getNodeText(el, 'from'),
    to: getNodeText(el, 'to'),
  };
}
