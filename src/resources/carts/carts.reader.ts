import {
  getNodeText,
  getNodeInt,
  getNodeBool,
} from '../../utils/xml-utils';
import type { CartOutput, CartRowOutput, CartListItem } from './carts.types';

function parseCartRow(el: Element): CartRowOutput {
  return {
    id_product:          getNodeInt(el, 'id_product') ?? 0,
    id_product_attribute: getNodeInt(el, 'id_product_attribute') ?? 0,
    id_address_delivery: getNodeInt(el, 'id_address_delivery') ?? 0,
    id_customization:    getNodeInt(el, 'id_customization') ?? 0,
    quantity:            getNodeInt(el, 'quantity') ?? 0,
  };
}

export function parseCart(doc: Document): CartOutput {
  const root = doc.querySelector('prestashop > cart');
  if (!root) throw new Error('Invalid cart response: <cart> missing');
  return parseCartFromElement(root);
}

export function parseCartList(doc: Document): CartOutput[] {
  return Array.from(doc.querySelectorAll('prestashop > carts > cart'))
    .map(parseCartFromElement);
}

export function parseCartFromElement(el: Element): CartOutput {
  const cartRows = Array.from(
    el.querySelectorAll('associations > cart_rows > cart_row')
  ).map(parseCartRow);

  return {
    id:                       getNodeInt(el, 'id') ?? 0,
    id_address_delivery:      getNodeInt(el, 'id_address_delivery'),
    id_address_invoice:       getNodeInt(el, 'id_address_invoice'),
    id_currency:              getNodeInt(el, 'id_currency') ?? 0,
    id_customer:              getNodeInt(el, 'id_customer'),
    id_guest:                 getNodeInt(el, 'id_guest'),
    id_lang:                  getNodeInt(el, 'id_lang') ?? 0,
    id_shop_group:            getNodeInt(el, 'id_shop_group'),
    id_shop:                  getNodeInt(el, 'id_shop'),
    id_carrier:               getNodeInt(el, 'id_carrier'),
    recyclable:               getNodeBool(el, 'recyclable'),
    gift:                     getNodeBool(el, 'gift'),
    gift_message:             getNodeText(el, 'gift_message'),
    mobile_theme:             getNodeBool(el, 'mobile_theme'),
    delivery_option:          getNodeText(el, 'delivery_option'),
    secure_key:               getNodeText(el, 'secure_key'),
    allow_seperated_package:  getNodeBool(el, 'allow_seperated_package'),
    date_add:                 getNodeText(el, 'date_add'),
    date_upd:                 getNodeText(el, 'date_upd'),
    cart_rows:                cartRows,
  };
}

export function parseCartIdList(doc: Document): CartListItem[] {
  return Array.from(doc.querySelectorAll('prestashop > carts > cart')).map(el => ({
    id:   parseInt(el.getAttribute('id') ?? '0', 10),
    href: el.getAttribute('xlink:href') ?? '',
  }));
}
