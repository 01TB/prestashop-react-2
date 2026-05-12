import type { TaxRuleCreateInput, TaxRuleUpdateInput } from './tax_rules.types';

const toStr = (value: string | number | undefined | null): string =>
	value != null ? String(value) : '';

export function buildTaxRulePostXml(data: TaxRuleCreateInput): string {
	return `<?xml version="1.0" encoding="UTF-8"?>
<prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
	<tax_rule>
		<id><![CDATA[]]></id>
		<id_tax_rules_group><![CDATA[${toStr(data.id_tax_rules_group)}]]></id_tax_rules_group>
		<id_state><![CDATA[${toStr(data.id_state)}]]></id_state>
		<id_country><![CDATA[${toStr(data.id_country)}]]></id_country>
		<zipcode_from><![CDATA[${toStr(data.zipcode_from)}]]></zipcode_from>
		<zipcode_to><![CDATA[${toStr(data.zipcode_to)}]]></zipcode_to>
		<id_tax><![CDATA[${toStr(data.id_tax)}]]></id_tax>
		<behavior><![CDATA[${toStr(data.behavior)}]]></behavior>
		<description><![CDATA[${toStr(data.description)}]]></description>
	</tax_rule>
</prestashop>`;
}

export function buildTaxRulePatchXml(
	id: number,
	data: Partial<TaxRuleUpdateInput>
): string {
	const lines: string[] = [];

	const fStr = (tag: string, value: string | number | null | undefined) => {
		if (value !== undefined) lines.push(`    <${tag}><![CDATA[${value ?? ''}]]></${tag}>`);
	};

	fStr('id_tax_rules_group', data.id_tax_rules_group);
	fStr('id_state', data.id_state);
	fStr('id_country', data.id_country);
	fStr('zipcode_from', data.zipcode_from);
	fStr('zipcode_to', data.zipcode_to);
	fStr('id_tax', data.id_tax);
	fStr('behavior', data.behavior);
	fStr('description', data.description);

	return `<?xml version="1.0" encoding="UTF-8"?>
<prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
	<tax_rule>
		<id><![CDATA[${toStr(id)}]]></id>
${lines.join('\n')}
	</tax_rule>
</prestashop>`;
}
