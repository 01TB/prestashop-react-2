import { getNodeBool, getNodeInt, getNodeText } from '../../utils/xml-utils';
import type { AddressOutput, AddressListItem } from './addresses.types';

export function parseAddress(doc: Document): AddressOutput {
  const root = doc.querySelector('prestashop > address');
  if (!root) throw new Error('Invalid address response: <address> missing');
  return parseAddressFromElement(root);
}

export function parseAddressList(doc: Document): AddressOutput[] {
  return Array.from(doc.querySelectorAll('prestashop > addresses > address'))
    .map(parseAddressFromElement);
}

export function parseAddressFromElement(el: Element): AddressOutput {
  return {
    id: getNodeInt(el, 'id') ?? 0,
    id_customer: getNodeInt(el, 'id_customer'),
    id_manufacturer: getNodeInt(el, 'id_manufacturer'),
    id_supplier: getNodeInt(el, 'id_supplier'),
    id_warehouse: getNodeInt(el, 'id_warehouse'),
    id_country: getNodeInt(el, 'id_country') ?? 0,
    id_state: getNodeInt(el, 'id_state'),
    alias: getNodeText(el, 'alias'),
    company: getNodeText(el, 'company'),
    lastname: getNodeText(el, 'lastname'),
    firstname: getNodeText(el, 'firstname'),
    vat_number: getNodeText(el, 'vat_number'),
    address1: getNodeText(el, 'address1'),
    address2: getNodeText(el, 'address2'),
    postcode: getNodeText(el, 'postcode'),
    city: getNodeText(el, 'city'),
    other: getNodeText(el, 'other'),
    phone: getNodeText(el, 'phone'),
    phone_mobile: getNodeText(el, 'phone_mobile'),
    dni: getNodeText(el, 'dni'),
    deleted: getNodeBool(el, 'deleted'),
    date_add: getNodeText(el, 'date_add'),
    date_upd: getNodeText(el, 'date_upd'),
  };
}

export function parseAddressIdList(doc: Document): AddressListItem[] {
  return Array.from(doc.querySelectorAll('prestashop > addresses > address')).map(el => ({
    id: parseInt(el.getAttribute('id') ?? '0', 10),
    href: el.getAttribute('xlink:href') ?? '',
  }));
}
