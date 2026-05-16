import { getNodeText, getNodeInt, getNodeFloat } from '../../utils/xml-utils';
import type { StockOutput, StockListItem } from './stocks.types';

/**
 * Parse un élément DOM <stock> et le convertit en StockOutput
 */
export function parseStockFromElement(el: Element): StockOutput {
  return {
    id:                   getNodeInt(el, 'id') ?? 0,
    id_warehouse:         getNodeInt(el, 'id_warehouse') ?? 0,
    id_product:           getNodeInt(el, 'id_product') ?? 0,
    id_product_attribute: getNodeInt(el, 'id_product_attribute') ?? 0,
    reference:            getNodeText(el, 'reference'),
    ean13:                getNodeText(el, 'ean13'),
    isbn:                 getNodeText(el, 'isbn'),
    upc:                  getNodeText(el, 'upc'),
    mpn:                  getNodeText(el, 'mpn'),
    physical_quantity:    getNodeInt(el, 'physical_quantity') ?? 0,
    usable_quantity:      getNodeInt(el, 'usable_quantity') ?? 0,
    price_te:             getNodeFloat(el, 'price_te') ?? 0,
    real_quantity:        getNodeInt(el, 'real_quantity') ?? 0,
  };
}

/**
 * Parse le Document XML de réponse GET /api/stocks/{id}
 */
export function parseStock(doc: Document): StockOutput {
  const root = doc.querySelector('prestashop > stock');
  if (!root) throw new Error('Réponse GET stock invalide : nœud <stock> absent');
  return parseStockFromElement(root);
}

/**
 * Parse le Document XML de réponse GET /api/stocks?display=full
 */
export function parseStockList(doc: Document): StockOutput[] {
  return Array.from(doc.querySelectorAll('prestashop > stocks > stock')).map(
    parseStockFromElement
  );
}

/**
 * Parse le Document XML de réponse GET /api/stocks
 * Retourne juste les listes de IDs/hrefs
 */
export function parseStockIdList(doc: Document): StockListItem[] {
  return Array.from(doc.querySelectorAll('prestashop > stocks > stock')).map(
    (el) => ({
      id: parseInt(el.getAttribute('id') ?? '0', 10),
      href: el.getAttribute('xlink:href') ?? '',
    })
  );
}