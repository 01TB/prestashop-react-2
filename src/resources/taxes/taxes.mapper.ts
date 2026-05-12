import { buildLangField } from '../../utils/xml-utils';
import type { TaxCreateInput, TaxUpdateInput } from './taxes.types';

const toStr = (value: string | number | undefined | null): string =>
	value != null ? String(value) : '';

const toBool = (value: boolean | undefined): string =>
	value === true ? '1' : value === false ? '0' : '';

const toFloat = (value: number | undefined | null): string =>
	value != null ? String(value) : '';

export function buildTaxPostXml(data: TaxCreateInput): string {
	return `<?xml version="1.0" encoding="UTF-8"?>
<prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
	<tax>
		<id><![CDATA[]]></id>
		<rate><![CDATA[${toFloat(data.rate)}]]></rate>
		<active><![CDATA[${toBool(data.active)}]]></active>
		<deleted><![CDATA[${toBool(data.deleted)}]]></deleted>
		${buildLangField('name', data.name)}
	</tax>
</prestashop>`;
}

export function buildTaxPatchXml(
	id: number,
	data: Partial<TaxUpdateInput>
): string {
	const lines: string[] = [];

	const fStr = (tag: string, value: string | number | null | undefined) => {
		if (value !== undefined) lines.push(`    <${tag}><![CDATA[${value ?? ''}]]></${tag}>`);
	};

	const fBool = (tag: string, value: boolean | undefined) => {
		if (value !== undefined) lines.push(`    <${tag}><![CDATA[${value ? '1' : '0'}]]></${tag}>`);
	};

	const fLang = (tag: string, value: TaxCreateInput['name'] | undefined) => {
		if (value !== undefined) lines.push(`    ${buildLangField(tag, value)}`);
	};

	fStr('rate', data.rate);
	fBool('active', data.active);
	fBool('deleted', data.deleted);
	fLang('name', data.name);

	return `<?xml version="1.0" encoding="UTF-8"?>
<prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
	<tax>
		<id><![CDATA[${toStr(id)}]]></id>
${lines.join('\n')}
	</tax>
</prestashop>`;
}
