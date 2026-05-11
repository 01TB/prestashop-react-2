import {
  getNodeText,
  getNodeInt,
  getNodeFloat,
  getAssocIds,
} from '../../utils/xml-utils';
import type { OrderDetailOutput, OrderDetailListItem } from './order_details.types';

export function parseOrderDetail(doc: Document): OrderDetailOutput {
  const root = doc.querySelector('prestashop > order_detail');
  if (!root) throw new Error('Invalid order_detail response: <order_detail> missing');
  return parseOrderDetailFromElement(root);
}

export function parseOrderDetailList(doc: Document): OrderDetailOutput[] {
  return Array.from(doc.querySelectorAll('prestashop > order_details > order_detail'))
    .map(parseOrderDetailFromElement);
}

export function parseOrderDetailFromElement(el: Element): OrderDetailOutput {
  const taxes = getAssocIds(el, 'associations > taxes', 'tax');

  return {
    id:                            getNodeInt(el, 'id') ?? 0,
    id_order:                      getNodeInt(el, 'id_order') ?? 0,
    product_id:                    getNodeInt(el, 'product_id'),
    product_attribute_id:          getNodeInt(el, 'product_attribute_id'),
    product_quantity_reinjected:   getNodeInt(el, 'product_quantity_reinjected'),
    group_reduction:               getNodeFloat(el, 'group_reduction') ?? 0,
    discount_quantity_applied:     getNodeInt(el, 'discount_quantity_applied'),
    download_hash:                 getNodeText(el, 'download_hash'),
    download_deadline:             getNodeText(el, 'download_deadline'),
    id_order_invoice:              getNodeInt(el, 'id_order_invoice'),
    id_warehouse:                  getNodeInt(el, 'id_warehouse') ?? 0,
    id_shop:                       getNodeInt(el, 'id_shop') ?? 0,
    id_customization:              getNodeInt(el, 'id_customization'),
    product_name:                  getNodeText(el, 'product_name'),
    product_quantity:              getNodeInt(el, 'product_quantity') ?? 0,
    product_quantity_in_stock:     getNodeInt(el, 'product_quantity_in_stock') ?? 0,
    product_quantity_return:       getNodeInt(el, 'product_quantity_return') ?? 0,
    product_quantity_refunded:     getNodeInt(el, 'product_quantity_refunded') ?? 0,
    product_price:                 getNodeFloat(el, 'product_price') ?? 0,
    reduction_percent:             getNodeFloat(el, 'reduction_percent') ?? 0,
    reduction_amount:              getNodeFloat(el, 'reduction_amount') ?? 0,
    reduction_amount_tax_incl:     getNodeFloat(el, 'reduction_amount_tax_incl') ?? 0,
    reduction_amount_tax_excl:     getNodeFloat(el, 'reduction_amount_tax_excl') ?? 0,
    product_quantity_discount:     getNodeFloat(el, 'product_quantity_discount') ?? 0,
    product_ean13:                 getNodeText(el, 'product_ean13'),
    product_isbn:                  getNodeText(el, 'product_isbn'),
    product_upc:                   getNodeText(el, 'product_upc'),
    product_mpn:                   getNodeText(el, 'product_mpn'),
    product_reference:             getNodeText(el, 'product_reference'),
    product_supplier_reference:    getNodeText(el, 'product_supplier_reference'),
    product_weight:                getNodeFloat(el, 'product_weight') ?? 0,
    tax_computation_method:        getNodeInt(el, 'tax_computation_method'),
    id_tax_rules_group:            getNodeInt(el, 'id_tax_rules_group'),
    ecotax:                        getNodeFloat(el, 'ecotax') ?? 0,
    ecotax_tax_rate:               getNodeFloat(el, 'ecotax_tax_rate') ?? 0,
    download_nb:                   getNodeInt(el, 'download_nb'),
    unit_price_tax_incl:           getNodeFloat(el, 'unit_price_tax_incl') ?? 0,
    unit_price_tax_excl:           getNodeFloat(el, 'unit_price_tax_excl') ?? 0,
    total_price_tax_incl:          getNodeFloat(el, 'total_price_tax_incl') ?? 0,
    total_price_tax_excl:          getNodeFloat(el, 'total_price_tax_excl') ?? 0,
    total_shipping_price_tax_excl: getNodeFloat(el, 'total_shipping_price_tax_excl') ?? 0,
    total_shipping_price_tax_incl: getNodeFloat(el, 'total_shipping_price_tax_incl') ?? 0,
    purchase_supplier_price:       getNodeFloat(el, 'purchase_supplier_price') ?? 0,
    original_product_price:        getNodeFloat(el, 'original_product_price') ?? 0,
    original_wholesale_price:      getNodeFloat(el, 'original_wholesale_price') ?? 0,
    total_refunded_tax_excl:       getNodeFloat(el, 'total_refunded_tax_excl') ?? 0,
    total_refunded_tax_incl:       getNodeFloat(el, 'total_refunded_tax_incl') ?? 0,
    taxes,
  };
}

export function parseOrderDetailIdList(doc: Document): OrderDetailListItem[] {
  return Array.from(doc.querySelectorAll('prestashop > order_details > order_detail')).map(el => ({
    id:   parseInt(el.getAttribute('id') ?? '0', 10),
    href: el.getAttribute('xlink:href') ?? '',
  }));
}
