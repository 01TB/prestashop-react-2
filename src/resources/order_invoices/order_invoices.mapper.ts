import type { OrderInvoiceCreateInput, OrderInvoiceUpdateInput } from './order_invoices.types';

const toStr = (v: string | number | undefined | null): string =>
	v != null ? String(v) : '';

const toPrice = (v: number | undefined): string =>
	v != null ? v.toFixed(6) : '';

export function buildOrderInvoicePostXml(data: OrderInvoiceCreateInput): string {
	return `<?xml version="1.0" encoding="UTF-8"?>
<prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
	<order_invoice>
		<id><![CDATA[]]></id>
		<id_order><![CDATA[${toStr(data.id_order)}]]></id_order>
		<number><![CDATA[${toStr(data.number)}]]></number>
		<delivery_number><![CDATA[${toStr(data.delivery_number ?? '')}]]></delivery_number>
		<delivery_date><![CDATA[${toStr(data.delivery_date ?? '')}]]></delivery_date>
		<total_discount_tax_excl><![CDATA[${toPrice(data.total_discount_tax_excl)}]]></total_discount_tax_excl>
		<total_discount_tax_incl><![CDATA[${toPrice(data.total_discount_tax_incl)}]]></total_discount_tax_incl>
		<total_paid_tax_excl><![CDATA[${toPrice(data.total_paid_tax_excl)}]]></total_paid_tax_excl>
		<total_paid_tax_incl><![CDATA[${toPrice(data.total_paid_tax_incl)}]]></total_paid_tax_incl>
		<total_products><![CDATA[${toPrice(data.total_products)}]]></total_products>
		<total_products_wt><![CDATA[${toPrice(data.total_products_wt)}]]></total_products_wt>
		<total_shipping_tax_excl><![CDATA[${toPrice(data.total_shipping_tax_excl)}]]></total_shipping_tax_excl>
		<total_shipping_tax_incl><![CDATA[${toPrice(data.total_shipping_tax_incl)}]]></total_shipping_tax_incl>
		<shipping_tax_computation_method><![CDATA[${toStr(data.shipping_tax_computation_method ?? '')}]]></shipping_tax_computation_method>
		<total_wrapping_tax_excl><![CDATA[${toPrice(data.total_wrapping_tax_excl)}]]></total_wrapping_tax_excl>
		<total_wrapping_tax_incl><![CDATA[${toPrice(data.total_wrapping_tax_incl)}]]></total_wrapping_tax_incl>
		<shop_address><![CDATA[${toStr(data.shop_address ?? '')}]]></shop_address>
		<note><![CDATA[${toStr(data.note ?? '')}]]></note>
		<date_add><![CDATA[${toStr(data.date_add ?? '')}]]></date_add>
	</order_invoice>
</prestashop>`;
}

export function buildOrderInvoicePatchXml(
	id: number,
	data: Partial<OrderInvoiceUpdateInput>
): string {
	const lines: string[] = [];

	const fStr = (tag: string, value: string | number | null | undefined) => {
		if (value !== undefined) lines.push(`    <${tag}><![CDATA[${value ?? ''}]]></${tag}>`);
	};

	const fPrice = (tag: string, value: number | undefined) => {
		if (value !== undefined) lines.push(`    <${tag}><![CDATA[${value.toFixed(6)}]]></${tag}>`);
	};

	fStr('id_order', data.id_order);
	fStr('number', data.number);
	fStr('delivery_number', data.delivery_number);
	fStr('delivery_date', data.delivery_date);
	fPrice('total_discount_tax_excl', data.total_discount_tax_excl);
	fPrice('total_discount_tax_incl', data.total_discount_tax_incl);
	fPrice('total_paid_tax_excl', data.total_paid_tax_excl);
	fPrice('total_paid_tax_incl', data.total_paid_tax_incl);
	fPrice('total_products', data.total_products);
	fPrice('total_products_wt', data.total_products_wt);
	fPrice('total_shipping_tax_excl', data.total_shipping_tax_excl);
	fPrice('total_shipping_tax_incl', data.total_shipping_tax_incl);
	fStr('shipping_tax_computation_method', data.shipping_tax_computation_method);
	fPrice('total_wrapping_tax_excl', data.total_wrapping_tax_excl);
	fPrice('total_wrapping_tax_incl', data.total_wrapping_tax_incl);
	fStr('shop_address', data.shop_address);
	fStr('note', data.note);
	fStr('date_add', data.date_add);

	return `<?xml version="1.0" encoding="UTF-8"?>
<prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
	<order_invoice>
		<id><![CDATA[${id}]]></id>
${lines.join('\n')}
	</order_invoice>
</prestashop>`;
}
