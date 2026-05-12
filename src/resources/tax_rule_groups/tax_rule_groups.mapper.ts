import type { TaxRuleGroupCreateInput, TaxRuleGroupUpdateInput } from './tax_rule_groups.types';

const toStr = (value: string | number | undefined | null): string =>
	value != null ? String(value) : '';

const toBool = (value: boolean | undefined): string =>
	value === true ? '1' : value === false ? '0' : '';

export function buildTaxRuleGroupPostXml(data: TaxRuleGroupCreateInput): string {
	return `<?xml version="1.0" encoding="UTF-8"?>
<prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
	<tax_rule_group>
		<id><![CDATA[]]></id>
		<name><![CDATA[${toStr(data.name)}]]></name>
		<active><![CDATA[${toBool(data.active)}]]></active>
		<deleted><![CDATA[${toBool(data.deleted)}]]></deleted>
		<date_add><![CDATA[${toStr(data.date_add ?? '')}]]></date_add>
		<date_upd><![CDATA[${toStr(data.date_upd ?? '')}]]></date_upd>
	</tax_rule_group>
</prestashop>`;
}

export function buildTaxRuleGroupPatchXml(
	id: number,
	data: Partial<TaxRuleGroupUpdateInput>
): string {
	const lines: string[] = [];

	const fStr = (tag: string, value: string | number | null | undefined) => {
		if (value !== undefined) lines.push(`    <${tag}><![CDATA[${value ?? ''}]]></${tag}>`);
	};

	const fBool = (tag: string, value: boolean | undefined) => {
		if (value !== undefined) lines.push(`    <${tag}><![CDATA[${value ? '1' : '0'}]]></${tag}>`);
	};

	fStr('name', data.name);
	fBool('active', data.active);
	fBool('deleted', data.deleted);
	fStr('date_add', data.date_add);
	fStr('date_upd', data.date_upd);

	return `<?xml version="1.0" encoding="UTF-8"?>
<prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
	<tax_rule_group>
		<id><![CDATA[${toStr(id)}]]></id>
${lines.join('\n')}
	</tax_rule_group>
</prestashop>`;
}
