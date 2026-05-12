import { buildLangField } from '../../utils/xml-utils';
import type { CarrierCreateInput, CarrierUpdateInput } from './carriers.types';

const toStr = (value: string | number | undefined | null): string =>
	value != null ? String(value) : '';

const toBool = (value: boolean | undefined): string =>
	value === true ? '1' : value === false ? '0' : '';

const toFloat = (value: number | undefined | null): string =>
	value != null ? String(value) : '';

export function buildCarrierPostXml(data: CarrierCreateInput): string {
	return `<?xml version="1.0" encoding="UTF-8"?>
<prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
	<carrier>
		<id><![CDATA[]]></id>
		<deleted><![CDATA[${toBool(data.deleted)}]]></deleted>
		<is_module><![CDATA[${toBool(data.is_module)}]]></is_module>
		<id_tax_rules_group><![CDATA[${toStr(data.id_tax_rules_group ?? '')}]]></id_tax_rules_group>
		<id_reference><![CDATA[${toStr(data.id_reference ?? '')}]]></id_reference>
		<name><![CDATA[${toStr(data.name)}]]></name>
		<active><![CDATA[${toBool(data.active)}]]></active>
		<is_free><![CDATA[${toBool(data.is_free)}]]></is_free>
		<url><![CDATA[${toStr(data.url ?? '')}]]></url>
		<shipping_handling><![CDATA[${toBool(data.shipping_handling)}]]></shipping_handling>
		<shipping_external><![CDATA[${toBool(data.shipping_external)}]]></shipping_external>
		<range_behavior><![CDATA[${toBool(data.range_behavior)}]]></range_behavior>
		<shipping_method><![CDATA[${toStr(data.shipping_method ?? '')}]]></shipping_method>
		<max_width><![CDATA[${toStr(data.max_width ?? '')}]]></max_width>
		<max_height><![CDATA[${toStr(data.max_height ?? '')}]]></max_height>
		<max_depth><![CDATA[${toStr(data.max_depth ?? '')}]]></max_depth>
		<max_weight><![CDATA[${toFloat(data.max_weight)}]]></max_weight>
		<grade><![CDATA[${toStr(data.grade ?? '')}]]></grade>
		<external_module_name><![CDATA[${toStr(data.external_module_name ?? '')}]]></external_module_name>
		<need_range><![CDATA[${toBool(data.need_range)}]]></need_range>
		<position><![CDATA[${toStr(data.position ?? '')}]]></position>
		${buildLangField('delay', data.delay)}
	</carrier>
</prestashop>`;
}

export function buildCarrierPatchXml(
	id: number,
	data: Partial<CarrierUpdateInput>
): string {
	const lines: string[] = [];

	const fStr = (tag: string, value: string | number | null | undefined) => {
		if (value !== undefined) lines.push(`    <${tag}><![CDATA[${value ?? ''}]]></${tag}>`);
	};

	const fBool = (tag: string, value: boolean | undefined) => {
		if (value !== undefined) lines.push(`    <${tag}><![CDATA[${value ? '1' : '0'}]]></${tag}>`);
	};

	const fLang = (tag: string, value: CarrierCreateInput['delay'] | undefined) => {
		if (value !== undefined) lines.push(`    ${buildLangField(tag, value)}`);
	};

	fBool('deleted', data.deleted);
	fBool('is_module', data.is_module);
	fStr('id_tax_rules_group', data.id_tax_rules_group);
	fStr('id_reference', data.id_reference);
	fStr('name', data.name);
	fBool('active', data.active);
	fBool('is_free', data.is_free);
	fStr('url', data.url);
	fBool('shipping_handling', data.shipping_handling);
	fBool('shipping_external', data.shipping_external);
	fBool('range_behavior', data.range_behavior);
	fStr('shipping_method', data.shipping_method);
	fStr('max_width', data.max_width);
	fStr('max_height', data.max_height);
	fStr('max_depth', data.max_depth);
	fStr('max_weight', data.max_weight);
	fStr('grade', data.grade);
	fStr('external_module_name', data.external_module_name);
	fBool('need_range', data.need_range);
	fStr('position', data.position);
	fLang('delay', data.delay);

	return `<?xml version="1.0" encoding="UTF-8"?>
<prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
	<carrier>
		<id><![CDATA[${toStr(id)}]]></id>
${lines.join('\n')}
	</carrier>
</prestashop>`;
}
