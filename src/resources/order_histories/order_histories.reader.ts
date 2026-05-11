import {
  getNodeText,
  getNodeInt,
} from '../../utils/xml-utils';
import type { OrderHistoryOutput, OrderHistoryListItem } from './order_histories.types';

export function parseOrderHistory(doc: Document): OrderHistoryOutput {
  const root = doc.querySelector('prestashop > order_history');
  if (!root) throw new Error('Invalid order_history response: <order_history> missing');
  return parseOrderHistoryFromElement(root);
}

export function parseOrderHistoryList(doc: Document): OrderHistoryOutput[] {
  return Array.from(doc.querySelectorAll('prestashop > order_histories > order_history'))
    .map(parseOrderHistoryFromElement);
}

export function parseOrderHistoryFromElement(el: Element): OrderHistoryOutput {
  return {
    id:             getNodeInt(el, 'id') ?? 0,
    id_employee:    getNodeInt(el, 'id_employee'),
    id_order_state: getNodeInt(el, 'id_order_state') ?? 0,
    id_order:       getNodeInt(el, 'id_order') ?? 0,
    date_add:       getNodeText(el, 'date_add'),
  };
}

export function parseOrderHistoryIdList(doc: Document): OrderHistoryListItem[] {
  return Array.from(doc.querySelectorAll('prestashop > order_histories > order_history')).map(el => ({
    id:   parseInt(el.getAttribute('id') ?? '0', 10),
    href: el.getAttribute('xlink:href') ?? '',
  }));
}
