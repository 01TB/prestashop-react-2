import type { OrderPaymentCreateInput, OrderPaymentUpdateInput } from './order_payments.types';

const toStr = (v: string | number | undefined | null): string =>
	v != null ? String(v) : '';

const toPrice = (v: number | undefined): string =>
	v != null ? v.toFixed(6) : '';

const toFloat = (v: number | undefined): string =>
	v != null ? String(v) : '';

export function buildOrderPaymentPostXml(data: OrderPaymentCreateInput): string {
	return `<?xml version="1.0" encoding="UTF-8"?>
<prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
	<order_payment>
		<id><![CDATA[]]></id>
		<order_reference><![CDATA[${toStr(data.order_reference ?? '')}]]></order_reference>
		<id_currency><![CDATA[${toStr(data.id_currency)}]]></id_currency>
		<amount><![CDATA[${toPrice(data.amount)}]]></amount>
		<payment_method><![CDATA[${toStr(data.payment_method ?? '')}]]></payment_method>
		<conversion_rate><![CDATA[${toFloat(data.conversion_rate)}]]></conversion_rate>
		<transaction_id><![CDATA[${toStr(data.transaction_id ?? '')}]]></transaction_id>
		<card_number><![CDATA[${toStr(data.card_number ?? '')}]]></card_number>
		<card_brand><![CDATA[${toStr(data.card_brand ?? '')}]]></card_brand>
		<card_expiration><![CDATA[${toStr(data.card_expiration ?? '')}]]></card_expiration>
		<card_holder><![CDATA[${toStr(data.card_holder ?? '')}]]></card_holder>
		<date_add><![CDATA[${toStr(data.date_add ?? '')}]]></date_add>
		<id_employee><![CDATA[${toStr(data.id_employee ?? '')}]]></id_employee>
	</order_payment>
</prestashop>`;
}

export function buildOrderPaymentPatchXml(
	id: number,
	data: Partial<OrderPaymentUpdateInput>
): string {
	const lines: string[] = [];

	const fStr = (tag: string, value: string | number | null | undefined) => {
		if (value !== undefined) lines.push(`    <${tag}><![CDATA[${value ?? ''}]]></${tag}>`);
	};

	const fPrice = (tag: string, value: number | undefined) => {
		if (value !== undefined) lines.push(`    <${tag}><![CDATA[${value.toFixed(6)}]]></${tag}>`);
	};

	const fFloat = (tag: string, value: number | undefined) => {
		if (value !== undefined) lines.push(`    <${tag}><![CDATA[${value}]]></${tag}>`);
	};

	fStr('order_reference', data.order_reference);
	fStr('id_currency', data.id_currency);
	fPrice('amount', data.amount);
	fStr('payment_method', data.payment_method);
	fFloat('conversion_rate', data.conversion_rate);
	fStr('transaction_id', data.transaction_id);
	fStr('card_number', data.card_number);
	fStr('card_brand', data.card_brand);
	fStr('card_expiration', data.card_expiration);
	fStr('card_holder', data.card_holder);
	fStr('date_add', data.date_add);
	fStr('id_employee', data.id_employee);

	return `<?xml version="1.0" encoding="UTF-8"?>
<prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
	<order_payment>
		<id><![CDATA[${id}]]></id>
${lines.join('\n')}
	</order_payment>
</prestashop>`;
}
