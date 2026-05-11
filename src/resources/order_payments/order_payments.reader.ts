import {
	getNodeText,
	getNodeInt,
	getNodeFloat,
} from '../../utils/xml-utils';
import type { OrderPaymentOutput, OrderPaymentListItem } from './order_payments.types';

export function parseOrderPayment(doc: Document): OrderPaymentOutput {
	const root = doc.querySelector('prestashop > order_payment');
	if (!root) throw new Error('Invalid order_payment response: <order_payment> missing');
	return parseOrderPaymentFromElement(root);
}

export function parseOrderPaymentList(doc: Document): OrderPaymentOutput[] {
	return Array.from(doc.querySelectorAll('prestashop > order_payments > order_payment'))
		.map(parseOrderPaymentFromElement);
}

export function parseOrderPaymentFromElement(el: Element): OrderPaymentOutput {
	return {
		id:              getNodeInt(el, 'id') ?? 0,
		order_reference: getNodeText(el, 'order_reference'),
		id_currency:     getNodeInt(el, 'id_currency') ?? 0,
		amount:          getNodeFloat(el, 'amount') ?? 0,
		payment_method:  getNodeText(el, 'payment_method'),
		conversion_rate: getNodeFloat(el, 'conversion_rate') ?? 0,
		transaction_id:  getNodeText(el, 'transaction_id'),
		card_number:     getNodeText(el, 'card_number'),
		card_brand:      getNodeText(el, 'card_brand'),
		card_expiration: getNodeText(el, 'card_expiration'),
		card_holder:     getNodeText(el, 'card_holder'),
		date_add:        getNodeText(el, 'date_add'),
		id_employee:     getNodeInt(el, 'id_employee'),
	};
}

export function parseOrderPaymentIdList(doc: Document): OrderPaymentListItem[] {
	return Array.from(doc.querySelectorAll('prestashop > order_payments > order_payment')).map(el => ({
		id:   parseInt(el.getAttribute('id') ?? '0', 10),
		href: el.getAttribute('xlink:href') ?? '',
	}));
}
