import type { AddressCreateInput, AddressUpdateInput } from './addresses.types';

const toStr = (value: string | number | undefined | null): string =>
	value != null ? String(value) : '';

const toBool = (value: boolean | undefined): string =>
	value === true ? '1' : value === false ? '0' : '';

export function buildAddressPostXml(data: AddressCreateInput): string {
	return `<?xml version="1.0" encoding="UTF-8"?>
<prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
	<address>
		<id><![CDATA[]]></id>
		<id_customer><![CDATA[${toStr(data.id_customer ?? '')}]]></id_customer>
		<id_manufacturer><![CDATA[${toStr(data.id_manufacturer ?? '')}]]></id_manufacturer>
		<id_supplier><![CDATA[${toStr(data.id_supplier ?? '')}]]></id_supplier>
		<id_warehouse><![CDATA[${toStr(data.id_warehouse ?? '')}]]></id_warehouse>
		<id_country><![CDATA[${toStr(data.id_country)}]]></id_country>
		<id_state><![CDATA[${toStr(data.id_state ?? '')}]]></id_state>
		<alias><![CDATA[${toStr(data.alias)}]]></alias>
		<company><![CDATA[${toStr(data.company ?? '')}]]></company>
		<lastname><![CDATA[${toStr(data.lastname)}]]></lastname>
		<firstname><![CDATA[${toStr(data.firstname)}]]></firstname>
		<vat_number><![CDATA[${toStr(data.vat_number ?? '')}]]></vat_number>
		<address1><![CDATA[${toStr(data.address1)}]]></address1>
		<address2><![CDATA[${toStr(data.address2 ?? '')}]]></address2>
		<postcode><![CDATA[${toStr(data.postcode ?? '')}]]></postcode>
		<city><![CDATA[${toStr(data.city)}]]></city>
		<other><![CDATA[${toStr(data.other ?? '')}]]></other>
		<phone><![CDATA[${toStr(data.phone ?? '')}]]></phone>
		<phone_mobile><![CDATA[${toStr(data.phone_mobile ?? '')}]]></phone_mobile>
		<dni><![CDATA[${toStr(data.dni ?? '')}]]></dni>
		<deleted><![CDATA[${toBool(data.deleted)}]]></deleted>
		<date_add><![CDATA[${toStr(data.date_add ?? '')}]]></date_add>
		<date_upd><![CDATA[${toStr(data.date_upd ?? '')}]]></date_upd>
	</address>
</prestashop>`;
}

export function buildAddressPatchXml(
	id: number,
	data: Partial<AddressUpdateInput>
): string {
	const lines: string[] = [];

	const fStr = (tag: string, value: string | number | null | undefined) => {
		if (value !== undefined) lines.push(`    <${tag}><![CDATA[${value ?? ''}]]></${tag}>`);
	};

	const fBool = (tag: string, value: boolean | undefined) => {
		if (value !== undefined) lines.push(`    <${tag}><![CDATA[${value ? '1' : '0'}]]></${tag}>`);
	};

	fStr('id_customer', data.id_customer);
	fStr('id_manufacturer', data.id_manufacturer);
	fStr('id_supplier', data.id_supplier);
	fStr('id_warehouse', data.id_warehouse);
	fStr('id_country', data.id_country);
	fStr('id_state', data.id_state);
	fStr('alias', data.alias);
	fStr('company', data.company);
	fStr('lastname', data.lastname);
	fStr('firstname', data.firstname);
	fStr('vat_number', data.vat_number);
	fStr('address1', data.address1);
	fStr('address2', data.address2);
	fStr('postcode', data.postcode);
	fStr('city', data.city);
	fStr('other', data.other);
	fStr('phone', data.phone);
	fStr('phone_mobile', data.phone_mobile);
	fStr('dni', data.dni);
	fBool('deleted', data.deleted);
	fStr('date_add', data.date_add);
	fStr('date_upd', data.date_upd);

	return `<?xml version="1.0" encoding="UTF-8"?>
<prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
	<address>
		<id><![CDATA[${toStr(id)}]]></id>
${lines.join('\n')}
	</address>
</prestashop>`;
}
