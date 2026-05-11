import {
	getNodeText,
	getNodeInt,
	getNodeFloat,
} from '../../utils/xml-utils';
import type { OrderInvoiceOutput, OrderInvoiceListItem } from './order_invoices.types';

export function parseOrderInvoice(doc: Document): OrderInvoiceOutput {
	const root = doc.querySelector('prestashop > order_invoice');
	if (!root) throw new Error('Invalid order_invoice response: <order_invoice> missing');
	return parseOrderInvoiceFromElement(root);
}

export function parseOrderInvoiceList(doc: Document): OrderInvoiceOutput[] {
	return Array.from(doc.querySelectorAll('prestashop > order_invoices > order_invoice'))
		.map(parseOrderInvoiceFromElement);
}

export function parseOrderInvoiceFromElement(el: Element): OrderInvoiceOutput {
	return {
		id:                             getNodeInt(el, 'id') ?? 0,
		id_order:                       getNodeInt(el, 'id_order') ?? 0,
		number:                         getNodeInt(el, 'number') ?? 0,
		delivery_number:                getNodeInt(el, 'delivery_number'),
		delivery_date:                  getNodeText(el, 'delivery_date'),
		total_discount_tax_excl:        getNodeFloat(el, 'total_discount_tax_excl') ?? 0,
		total_discount_tax_incl:        getNodeFloat(el, 'total_discount_tax_incl') ?? 0,
		total_paid_tax_excl:            getNodeFloat(el, 'total_paid_tax_excl') ?? 0,
		total_paid_tax_incl:            getNodeFloat(el, 'total_paid_tax_incl') ?? 0,
		total_products:                 getNodeFloat(el, 'total_products') ?? 0,
		total_products_wt:              getNodeFloat(el, 'total_products_wt') ?? 0,
		total_shipping_tax_excl:        getNodeFloat(el, 'total_shipping_tax_excl') ?? 0,
		total_shipping_tax_incl:        getNodeFloat(el, 'total_shipping_tax_incl') ?? 0,
		shipping_tax_computation_method: getNodeInt(el, 'shipping_tax_computation_method'),
		total_wrapping_tax_excl:        getNodeFloat(el, 'total_wrapping_tax_excl') ?? 0,
		total_wrapping_tax_incl:        getNodeFloat(el, 'total_wrapping_tax_incl') ?? 0,
		shop_address:                   getNodeText(el, 'shop_address'),
		note:                           getNodeText(el, 'note'),
		date_add:                       getNodeText(el, 'date_add'),
	};
}

export function parseOrderInvoiceIdList(doc: Document): OrderInvoiceListItem[] {
	return Array.from(doc.querySelectorAll('prestashop > order_invoices > order_invoice')).map(el => ({
		id:   parseInt(el.getAttribute('id') ?? '0', 10),
		href: el.getAttribute('xlink:href') ?? '',
	}));
}
