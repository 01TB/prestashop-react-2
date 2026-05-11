import {
  getNodeText,
  getNodeInt,
  getNodeBool,
  getNodeLangMap,
} from '../../utils/xml-utils';
import type { OrderStateOutput, OrderStateListItem } from './order_states.types';

export function parseOrderState(doc: Document): OrderStateOutput {
  const root = doc.querySelector('prestashop > order_state');
  if (!root) throw new Error('Invalid order_state response: <order_state> missing');
  return parseOrderStateFromElement(root);
}

export function parseOrderStateList(doc: Document): OrderStateOutput[] {
  return Array.from(doc.querySelectorAll('prestashop > order_states > order_state'))
    .map(parseOrderStateFromElement);
}

export function parseOrderStateFromElement(el: Element): OrderStateOutput {
  return {
    id:           getNodeInt(el, 'id') ?? 0,
    unremovable:  getNodeBool(el, 'unremovable'),
    delivery:     getNodeBool(el, 'delivery'),
    hidden:       getNodeBool(el, 'hidden'),
    send_email:   getNodeBool(el, 'send_email'),
    module_name:  getNodeText(el, 'module_name'),
    invoice:      getNodeBool(el, 'invoice'),
    color:        getNodeText(el, 'color'),
    logable:      getNodeBool(el, 'logable'),
    shipped:      getNodeBool(el, 'shipped'),
    paid:         getNodeBool(el, 'paid'),
    pdf_delivery: getNodeBool(el, 'pdf_delivery'),
    pdf_invoice:  getNodeBool(el, 'pdf_invoice'),
    deleted:      getNodeBool(el, 'deleted'),
    name:         getNodeLangMap(el, 'name'),
    template:     getNodeLangMap(el, 'template'),
  };
}

export function parseOrderStateIdList(doc: Document): OrderStateListItem[] {
  return Array.from(doc.querySelectorAll('prestashop > order_states > order_state')).map(el => ({
    id:   parseInt(el.getAttribute('id') ?? '0', 10),
    href: el.getAttribute('xlink:href') ?? '',
  }));
}
