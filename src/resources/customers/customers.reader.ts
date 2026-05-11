import {
  getNodeText,
  getNodeInt,
  getNodeFloat,
  getNodeBool,
  getAssocIds,
} from '../../utils/xml-utils';
import type { CustomerOutput, CustomerListItem } from './customers.types';

export function parseCustomer(doc: Document): CustomerOutput {
  const root = doc.querySelector('prestashop > customer');
  if (!root) throw new Error('Invalid customer response: <customer> missing');
  return parseCustomerFromElement(root);
}

export function parseCustomerList(doc: Document): CustomerOutput[] {
  return Array.from(doc.querySelectorAll('prestashop > customers > customer'))
    .map(parseCustomerFromElement);
}

export function parseCustomerFromElement(el: Element): CustomerOutput {
  const groups = getAssocIds(el, 'associations > groups', 'group');

  return {
    id:                        getNodeInt(el, 'id') ?? 0,
    id_default_group:          getNodeInt(el, 'id_default_group') ?? 0,
    id_lang:                   getNodeInt(el, 'id_lang') ?? 0,
    newsletter_date_add:       getNodeText(el, 'newsletter_date_add'),
    ip_registration_newsletter: getNodeText(el, 'ip_registration_newsletter'),
    last_passwd_gen:           getNodeText(el, 'last_passwd_gen'),
    secure_key:                getNodeText(el, 'secure_key'),
    deleted:                   getNodeBool(el, 'deleted'),
    passwd:                    getNodeText(el, 'passwd'),
    lastname:                  getNodeText(el, 'lastname'),
    firstname:                 getNodeText(el, 'firstname'),
    email:                     getNodeText(el, 'email'),
    id_gender:                 getNodeInt(el, 'id_gender'),
    birthday:                  getNodeText(el, 'birthday'),
    newsletter:                getNodeBool(el, 'newsletter'),
    optin:                     getNodeBool(el, 'optin'),
    website:                   getNodeText(el, 'website'),
    company:                   getNodeText(el, 'company'),
    siret:                     getNodeText(el, 'siret'),
    ape:                       getNodeText(el, 'ape'),
    outstanding_allow_amount:  getNodeFloat(el, 'outstanding_allow_amount') ?? 0,
    show_public_prices:        getNodeBool(el, 'show_public_prices'),
    id_risk:                   getNodeInt(el, 'id_risk'),
    max_payment_days:          getNodeInt(el, 'max_payment_days'),
    active:                    getNodeBool(el, 'active'),
    note:                      getNodeText(el, 'note'),
    is_guest:                  getNodeBool(el, 'is_guest'),
    id_shop:                   getNodeInt(el, 'id_shop'),
    id_shop_group:             getNodeInt(el, 'id_shop_group'),
    date_add:                  getNodeText(el, 'date_add'),
    date_upd:                  getNodeText(el, 'date_upd'),
    reset_password_token:      getNodeText(el, 'reset_password_token'),
    reset_password_validity:   getNodeText(el, 'reset_password_validity'),
    groups,
  };
}

export function parseCustomerIdList(doc: Document): CustomerListItem[] {
  return Array.from(doc.querySelectorAll('prestashop > customers > customer')).map(el => ({
    id:   parseInt(el.getAttribute('id') ?? '0', 10),
    href: el.getAttribute('xlink:href') ?? '',
  }));
}
