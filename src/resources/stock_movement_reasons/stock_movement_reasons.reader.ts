import {
  getNodeText,
  getNodeInt,
  getNodeBool,
  getNodeLangMap,
} from '../../utils/xml-utils';
import type { 
  StockMovementReasonOutput, 
  StockMovementReasonListItem 
} from './stock_movement_reasons.types';

// ─── Parser d'un item complet ─────────────────────────────────────────────────

export function parseStockMovementReason(doc: Document): StockMovementReasonOutput {
  const root = doc.querySelector('prestashop > stock_movement_reason');
  if (!root) throw new Error('Réponse GET stock_movement_reason invalide : nœud <stock_movement_reason> absent');
  
  return parseStockMovementReasonFromElement(root);
}

export function parseStockMovementReasonFromElement(el: Element): StockMovementReasonOutput {
  return {
    id:       getNodeInt(el, 'id') ?? 0,
    sign:     getNodeInt(el, 'sign') ?? 0,
    deleted:  getNodeBool(el, 'deleted'),
    date_add: getNodeText(el, 'date_add'),
    date_upd: getNodeText(el, 'date_upd'),
    name:     getNodeLangMap(el, 'name'),
  };
}

// ─── Parsers de listes ────────────────────────────────────────────────────────

/**
 * Parse la liste des identifiants (sans display=full)
 */
export function parseStockMovementReasonIdList(doc: Document): StockMovementReasonListItem[] {
  return Array.from(doc.querySelectorAll('prestashop > stock_movement_reasons > stock_movement_reason')).map(el => ({
    id:   parseInt(el.getAttribute('id') ?? '0', 10),
    href: el.getAttribute('xlink:href') ?? '',
  }));
}

/**
 * Parse la liste complète (avec display=full)
 */
export function parseStockMovementReasonList(doc: Document): StockMovementReasonOutput[] {
  return Array.from(doc.querySelectorAll('prestashop > stock_movement_reasons > stock_movement_reason'))
    .map(parseStockMovementReasonFromElement);
}