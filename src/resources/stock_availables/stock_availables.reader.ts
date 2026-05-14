import {
  getNodeText,
  getNodeInt,
  getNodeBool,
} from '../../utils/xml-utils';
import type { StockAvailableOutput } from './stock_availables.types';

export function parseStockAvailable(doc: Document): StockAvailableOutput {
  const root = doc.querySelector('prestashop > stock_available');
  if (!root) throw new Error('Réponse GET stock_available invalide : nœud <stock_available> absent');
  return parseStockAvailableFromElement(root);
}

export function parseStockAvailableList(doc: Document): StockAvailableOutput[] {
  return Array.from(doc.querySelectorAll('prestashop > stock_availables > stock_available'))
    .map(parseStockAvailableFromElement);
}

export function parseStockAvailableFromElement(el: Element): StockAvailableOutput {
  return {
    id: getNodeInt(el, 'id') ?? 0,
    id_product: getNodeInt(el, 'id_product') ?? 0,
    id_product_attribute: getNodeInt(el, 'id_product_attribute') ?? 0,
    id_shop: getNodeInt(el, 'id_shop'),
    id_shop_group: getNodeInt(el, 'id_shop_group'),
    quantity: getNodeInt(el, 'quantity') ?? 0,
    depends_on_stock: getNodeBool(el, 'depends_on_stock'),
    out_of_stock: getNodeInt(el, 'out_of_stock') ?? 0,
    location: getNodeText(el, 'location'),
  };
}
