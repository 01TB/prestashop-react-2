import type {
	OrderSlipCreateInput,
	OrderSlipDetailInput,
	OrderSlipUpdateInput,
} from './order_slip.types';

const toStr = (value: string | number | undefined | null): string =>
	value != null ? String(value) : '';

const toFloat = (value: number | undefined): string =>
	value != null ? String(value) : '';

function buildOrderSlipDetailXml(detail: OrderSlipDetailInput): string {
	return `        <order_slip_detail>
					<id><![CDATA[]]></id>
					<id_order_detail><![CDATA[${toStr(detail.id_order_detail)}]]></id_order_detail>
					<product_quantity><![CDATA[${toStr(detail.product_quantity)}]]></product_quantity>
					<amount_tax_excl><![CDATA[${toFloat(detail.amount_tax_excl)}]]></amount_tax_excl>
					<amount_tax_incl><![CDATA[${toFloat(detail.amount_tax_incl)}]]></amount_tax_incl>
				</order_slip_detail>`;
}

function buildOrderSlipDetails(details?: OrderSlipDetailInput[]): string {
	if (!details?.length) return '<order_slip_details></order_slip_details>';
	const rows = details.map(buildOrderSlipDetailXml).join('\n');
	return `<order_slip_details>
${rows}
			</order_slip_details>`;
}

export function buildOrderSlipPostXml(data: OrderSlipCreateInput): string {
	return `<?xml version="1.0" encoding="UTF-8"?>
<prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
	<order_slip>
		<id><![CDATA[]]></id>
		<id_customer><![CDATA[${toStr(data.id_customer)}]]></id_customer>
		<id_order><![CDATA[${toStr(data.id_order)}]]></id_order>
		<conversion_rate><![CDATA[${toFloat(data.conversion_rate)}]]></conversion_rate>
		<total_products_tax_excl><![CDATA[${toFloat(data.total_products_tax_excl)}]]></total_products_tax_excl>
		<total_products_tax_incl><![CDATA[${toFloat(data.total_products_tax_incl)}]]></total_products_tax_incl>
		<total_shipping_tax_excl><![CDATA[${toFloat(data.total_shipping_tax_excl)}]]></total_shipping_tax_excl>
		<total_shipping_tax_incl><![CDATA[${toFloat(data.total_shipping_tax_incl)}]]></total_shipping_tax_incl>
		<amount><![CDATA[${toFloat(data.amount)}]]></amount>
		<shipping_cost><![CDATA[${toStr(data.shipping_cost)}]]></shipping_cost>
		<shipping_cost_amount><![CDATA[${toFloat(data.shipping_cost_amount)}]]></shipping_cost_amount>
		<partial><![CDATA[${toStr(data.partial)}]]></partial>
		<date_add><![CDATA[]]></date_add>
		<date_upd><![CDATA[]]></date_upd>
		<order_slip_type><![CDATA[${toStr(data.order_slip_type)}]]></order_slip_type>
		<associations>
			${buildOrderSlipDetails(data.order_slip_details)}
		</associations>
	</order_slip>
</prestashop>`;
}

export function buildOrderSlipPatchXml(
	id: number,
	data: Partial<OrderSlipUpdateInput>
): string {
	const lines: string[] = [];

	const pushStr = (tag: string, value: string | number | null | undefined) => {
		if (value !== undefined) lines.push(`    <${tag}><![CDATA[${value ?? ''}]]></${tag}>`);
	};

	const pushFloat = (tag: string, value: number | undefined) => {
		if (value !== undefined) lines.push(`    <${tag}><![CDATA[${value}]]></${tag}>`);
	};

	pushStr('id_customer', data.id_customer);
	pushStr('id_order', data.id_order);
	pushFloat('conversion_rate', data.conversion_rate);
	pushFloat('total_products_tax_excl', data.total_products_tax_excl);
	pushFloat('total_products_tax_incl', data.total_products_tax_incl);
	pushFloat('total_shipping_tax_excl', data.total_shipping_tax_excl);
	pushFloat('total_shipping_tax_incl', data.total_shipping_tax_incl);
	pushFloat('amount', data.amount);
	pushStr('shipping_cost', data.shipping_cost);
	pushFloat('shipping_cost_amount', data.shipping_cost_amount);
	pushStr('partial', data.partial);
	pushStr('date_add', data.date_add);
	pushStr('date_upd', data.date_upd);
	pushStr('order_slip_type', data.order_slip_type);

	const assocXml = data.order_slip_details !== undefined
		? `\n    <associations>\n      ${buildOrderSlipDetails(data.order_slip_details)}\n    </associations>`
		: '';

	return `<?xml version="1.0" encoding="UTF-8"?>
<prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
	<order_slip>
		<id><![CDATA[${id}]]></id>
${lines.join('\n')}${assocXml}
	</order_slip>
</prestashop>`;
}
