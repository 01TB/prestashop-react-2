import {
	getNodeFloat,
	getNodeInt,
	getNodeText,
} from '../../utils/xml-utils';
import type {
	OrderSlipDetailOutput,
	OrderSlipListItem,
	OrderSlipOutput,
} from './order_slip.types';

export function parseOrderSlip(doc: Document): OrderSlipOutput {
	const root = doc.querySelector('prestashop > order_slip');
	if (!root) throw new Error('Invalid order_slip response: <order_slip> missing');
	return parseOrderSlipFromElement(root);
}

export function parseOrderSlipList(doc: Document): OrderSlipOutput[] {
	return Array.from(doc.querySelectorAll('prestashop > order_slips > order_slip'))
		.map(parseOrderSlipFromElement);
}

export function parseOrderSlipFromElement(el: Element): OrderSlipOutput {
	return {
		id: getNodeInt(el, 'id') ?? 0,
		id_customer: getNodeInt(el, 'id_customer'),
		id_order: getNodeInt(el, 'id_order'),
		conversion_rate: getNodeFloat(el, 'conversion_rate'),
		total_products_tax_excl: getNodeFloat(el, 'total_products_tax_excl'),
		total_products_tax_incl: getNodeFloat(el, 'total_products_tax_incl'),
		total_shipping_tax_excl: getNodeFloat(el, 'total_shipping_tax_excl'),
		total_shipping_tax_incl: getNodeFloat(el, 'total_shipping_tax_incl'),
		amount: getNodeFloat(el, 'amount'),
		shipping_cost: getNodeText(el, 'shipping_cost'),
		shipping_cost_amount: getNodeFloat(el, 'shipping_cost_amount'),
		partial: getNodeText(el, 'partial'),
		date_add: getNodeText(el, 'date_add'),
		date_upd: getNodeText(el, 'date_upd'),
		order_slip_type: getNodeInt(el, 'order_slip_type'),
		order_slip_details: parseOrderSlipDetails(el),
	};
}

function parseOrderSlipDetails(el: Element): OrderSlipDetailOutput[] {
	const details = el.querySelector('associations > order_slip_details');
	if (!details) return [];
	return Array.from(details.querySelectorAll('order_slip_detail')).map(detail => ({
		id: parseInt(detail.querySelector('id')?.textContent?.trim() ?? '0', 10),
		id_order_detail: getNodeInt(detail, 'id_order_detail') ?? 0,
		product_quantity: getNodeInt(detail, 'product_quantity') ?? 0,
		amount_tax_excl: getNodeFloat(detail, 'amount_tax_excl') ?? 0,
		amount_tax_incl: getNodeFloat(detail, 'amount_tax_incl') ?? 0,
	}));
}

export function parseOrderSlipIdList(doc: Document): OrderSlipListItem[] {
	return Array.from(doc.querySelectorAll('prestashop > order_slips > order_slip')).map(el => ({
		id: parseInt(el.getAttribute('id') ?? '0', 10),
		href: el.getAttribute('xlink:href') ?? '',
	}));
}
