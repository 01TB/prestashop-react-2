import {
  getNodeText,
  getNodeInt,
  getNodeFloat,
  getNodeBool,
} from '../../utils/xml-utils';
import type { OrderOutput, OrderRowOutput, OrderListItem } from './orders.types';

// ─── Parser d'une ligne de commande ──────────────────────────────────────────

function parseOrderRow(el: Element): OrderRowOutput {
  return {
    id:                    getNodeInt(el, 'id') ?? 0,
    product_id:            getNodeInt(el, 'product_id') ?? 0,
    product_attribute_id:  getNodeInt(el, 'product_attribute_id') ?? 0,
    product_quantity:      getNodeInt(el, 'product_quantity') ?? 0,
    product_name:          getNodeText(el, 'product_name'),
    product_reference:     getNodeText(el, 'product_reference'),
    product_ean13:         getNodeText(el, 'product_ean13'),
    product_isbn:          getNodeText(el, 'product_isbn'),
    product_upc:           getNodeText(el, 'product_upc'),
    product_price:         getNodeFloat(el, 'product_price') ?? 0,
    id_customization:      getNodeInt(el, 'id_customization') ?? 0,
    unit_price_tax_incl:   getNodeFloat(el, 'unit_price_tax_incl') ?? 0,
    unit_price_tax_excl:   getNodeFloat(el, 'unit_price_tax_excl') ?? 0,
  };
}

// ─── Parser d'un order complet ────────────────────────────────────────────────

/**
 * Parse le Document DOM renvoyé par GET /api/orders/{id}
 * et retourne un objet TypeScript typé.
 */
export function parseOrder(doc: Document): OrderOutput {
  const root = doc.querySelector('prestashop > order');
  if (!root) throw new Error('Réponse GET order invalide : nœud <order> absent');

  const orderRows = Array.from(
    root.querySelectorAll('associations > order_rows > order_row')
  ).map(parseOrderRow);

  return {
    id:                          getNodeInt(root, 'id') ?? 0,
    id_address_delivery:         getNodeInt(root, 'id_address_delivery') ?? 0,
    id_address_invoice:          getNodeInt(root, 'id_address_invoice') ?? 0,
    id_cart:                     getNodeInt(root, 'id_cart') ?? 0,
    id_currency:                 getNodeInt(root, 'id_currency') ?? 0,
    id_lang:                     getNodeInt(root, 'id_lang') ?? 0,
    id_customer:                 getNodeInt(root, 'id_customer') ?? 0,
    id_carrier:                  getNodeInt(root, 'id_carrier') ?? 0,
    current_state:               getNodeInt(root, 'current_state'),
    module:                      getNodeText(root, 'module'),
    invoice_number:              getNodeText(root, 'invoice_number'),
    invoice_date:                getNodeText(root, 'invoice_date'),
    delivery_number:             getNodeText(root, 'delivery_number'),
    delivery_date:               getNodeText(root, 'delivery_date'),
    valid:                       getNodeBool(root, 'valid'),
    date_add:                    getNodeText(root, 'date_add'),
    date_upd:                    getNodeText(root, 'date_upd'),
    shipping_number:             getNodeText(root, 'shipping_number'),
    note:                        getNodeText(root, 'note'),
    id_shop_group:               getNodeInt(root, 'id_shop_group'),
    id_shop:                     getNodeInt(root, 'id_shop'),
    secure_key:                  getNodeText(root, 'secure_key'),
    payment:                     getNodeText(root, 'payment'),
    recyclable:                  getNodeBool(root, 'recyclable'),
    gift:                        getNodeBool(root, 'gift'),
    gift_message:                getNodeText(root, 'gift_message'),
    mobile_theme:                getNodeBool(root, 'mobile_theme'),
    total_discounts:             getNodeFloat(root, 'total_discounts') ?? 0,
    total_discounts_tax_incl:    getNodeFloat(root, 'total_discounts_tax_incl') ?? 0,
    total_discounts_tax_excl:    getNodeFloat(root, 'total_discounts_tax_excl') ?? 0,
    total_paid:                  getNodeFloat(root, 'total_paid') ?? 0,
    total_paid_tax_incl:         getNodeFloat(root, 'total_paid_tax_incl') ?? 0,
    total_paid_tax_excl:         getNodeFloat(root, 'total_paid_tax_excl') ?? 0,
    total_paid_real:             getNodeFloat(root, 'total_paid_real') ?? 0,
    total_products:              getNodeFloat(root, 'total_products') ?? 0,
    total_products_wt:           getNodeFloat(root, 'total_products_wt') ?? 0,
    total_shipping:              getNodeFloat(root, 'total_shipping') ?? 0,
    total_shipping_tax_incl:     getNodeFloat(root, 'total_shipping_tax_incl') ?? 0,
    total_shipping_tax_excl:     getNodeFloat(root, 'total_shipping_tax_excl') ?? 0,
    carrier_tax_rate:            getNodeFloat(root, 'carrier_tax_rate') ?? 0,
    total_wrapping:              getNodeFloat(root, 'total_wrapping') ?? 0,
    total_wrapping_tax_incl:     getNodeFloat(root, 'total_wrapping_tax_incl') ?? 0,
    total_wrapping_tax_excl:     getNodeFloat(root, 'total_wrapping_tax_excl') ?? 0,
    round_mode:                  getNodeInt(root, 'round_mode') ?? 0,
    round_type:                  getNodeInt(root, 'round_type') ?? 0,
    conversion_rate:             getNodeFloat(root, 'conversion_rate') ?? 1,
    reference:                   getNodeText(root, 'reference'),
    order_rows:                  orderRows,
  };
}

// ─── Parser d'une liste d'orders (sans display=full) ─────────────────────────

/**
 * Parse le Document DOM renvoyé par GET /api/orders
 * Retourne la liste des IDs et hrefs (sans les détails).
 */
export function parseOrderIdList(doc: Document): OrderListItem[] {
  return Array.from(doc.querySelectorAll('prestashop > orders > order')).map(el => ({
    id:   parseInt(el.getAttribute('id') ?? '0', 10),
    href: el.getAttribute('xlink:href') ?? '',
  }));
}

/**
 * Parse le Document DOM renvoyé par GET /api/orders?display=full
 * Retourne la liste des orders complets.
 */
export function parseOrderList(doc: Document): OrderOutput[] {
  return Array.from(doc.querySelectorAll('prestashop > orders > order')).map(el =>
    // On réutilise parseOrder en wrappant l'élément dans un Document simulé
    parseOrderFromElement(el)
  );
}

/** Parse un élément <order> isolé (utilisé pour display=full). */
export function parseOrderFromElement(el: Element): OrderOutput {
  const orderRows = Array.from(
    el.querySelectorAll('associations > order_rows > order_row')
  ).map(parseOrderRow);

  return {
    id:                          getNodeInt(el, 'id') ?? 0,
    id_address_delivery:         getNodeInt(el, 'id_address_delivery') ?? 0,
    id_address_invoice:          getNodeInt(el, 'id_address_invoice') ?? 0,
    id_cart:                     getNodeInt(el, 'id_cart') ?? 0,
    id_currency:                 getNodeInt(el, 'id_currency') ?? 0,
    id_lang:                     getNodeInt(el, 'id_lang') ?? 0,
    id_customer:                 getNodeInt(el, 'id_customer') ?? 0,
    id_carrier:                  getNodeInt(el, 'id_carrier') ?? 0,
    current_state:               getNodeInt(el, 'current_state'),
    module:                      getNodeText(el, 'module'),
    invoice_number:              getNodeText(el, 'invoice_number'),
    invoice_date:                getNodeText(el, 'invoice_date'),
    delivery_number:             getNodeText(el, 'delivery_number'),
    delivery_date:               getNodeText(el, 'delivery_date'),
    valid:                       getNodeBool(el, 'valid'),
    date_add:                    getNodeText(el, 'date_add'),
    date_upd:                    getNodeText(el, 'date_upd'),
    shipping_number:             getNodeText(el, 'shipping_number'),
    note:                        getNodeText(el, 'note'),
    id_shop_group:               getNodeInt(el, 'id_shop_group'),
    id_shop:                     getNodeInt(el, 'id_shop'),
    secure_key:                  getNodeText(el, 'secure_key'),
    payment:                     getNodeText(el, 'payment'),
    recyclable:                  getNodeBool(el, 'recyclable'),
    gift:                        getNodeBool(el, 'gift'),
    gift_message:                getNodeText(el, 'gift_message'),
    mobile_theme:                getNodeBool(el, 'mobile_theme'),
    total_discounts:             getNodeFloat(el, 'total_discounts') ?? 0,
    total_discounts_tax_incl:    getNodeFloat(el, 'total_discounts_tax_incl') ?? 0,
    total_discounts_tax_excl:    getNodeFloat(el, 'total_discounts_tax_excl') ?? 0,
    total_paid:                  getNodeFloat(el, 'total_paid') ?? 0,
    total_paid_tax_incl:         getNodeFloat(el, 'total_paid_tax_incl') ?? 0,
    total_paid_tax_excl:         getNodeFloat(el, 'total_paid_tax_excl') ?? 0,
    total_paid_real:             getNodeFloat(el, 'total_paid_real') ?? 0,
    total_products:              getNodeFloat(el, 'total_products') ?? 0,
    total_products_wt:           getNodeFloat(el, 'total_products_wt') ?? 0,
    total_shipping:              getNodeFloat(el, 'total_shipping') ?? 0,
    total_shipping_tax_incl:     getNodeFloat(el, 'total_shipping_tax_incl') ?? 0,
    total_shipping_tax_excl:     getNodeFloat(el, 'total_shipping_tax_excl') ?? 0,
    carrier_tax_rate:            getNodeFloat(el, 'carrier_tax_rate') ?? 0,
    total_wrapping:              getNodeFloat(el, 'total_wrapping') ?? 0,
    total_wrapping_tax_incl:     getNodeFloat(el, 'total_wrapping_tax_incl') ?? 0,
    total_wrapping_tax_excl:     getNodeFloat(el, 'total_wrapping_tax_excl') ?? 0,
    round_mode:                  getNodeInt(el, 'round_mode') ?? 0,
    round_type:                  getNodeInt(el, 'round_type') ?? 0,
    conversion_rate:             getNodeFloat(el, 'conversion_rate') ?? 1,
    reference:                   getNodeText(el, 'reference'),
    order_rows:                  orderRows,
  };
}