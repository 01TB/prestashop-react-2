/* eslint-disable @typescript-eslint/no-explicit-any */
import { buildLangField, type LangMap } from '../../utils/xml-utils';
import type { CategoryCreateInput, CategoryUpdateInput, AssocId } from './categories.types';

const toStr = (v: string | number | undefined | null): string => v != null ? String(v) : '';
const toBool = (v: boolean | undefined): string => v === true ? '1' : v === false ? '0' : '';

const buildAssocIds = (tag: string, nodeTag: string, items?: AssocId[]): string => {
	if (!items?.length) return `<${tag}></${tag}>`;
	const rows = items.map(i => `\n        <${nodeTag}>\n          <id><![CDATA[${i.id}]]></id>\n        </${nodeTag}>`).join('');
	return `<${tag}>${rows}\n      </${tag}>`;
};

export function buildCategoryPostXml(data: CategoryCreateInput): string {
	return `<?xml version="1.0" encoding="UTF-8"?>
    <prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
      <category>
        <id><![CDATA[]]></id>
        <id_parent><![CDATA[${toStr(data.id_parent ?? '')}]]></id_parent>
        <active><![CDATA[${toBool(data.active)}]]></active>
        <id_shop_default><![CDATA[${toStr(data.id_shop_default ?? '')}]]></id_shop_default>
        <is_root_category><![CDATA[${toBool(data.is_root_category)}]]></is_root_category>
        <position><![CDATA[${toStr(data.position ?? '')}]]></position>
        <date_add><![CDATA[${toStr(data.date_add ?? '')}]]></date_add>
        <date_upd><![CDATA[${toStr(data.date_upd ?? '')}]]></date_upd>
        ${buildLangField('name', data.name)}
        ${buildLangField('link_rewrite', data.link_rewrite)}
        ${buildLangField('description', data.description)}
        ${buildLangField('additional_description', data.additional_description)}
        ${buildLangField('meta_title', data.meta_title)}
        ${buildLangField('meta_description', data.meta_description)}
        ${buildLangField('meta_keywords', data.meta_keywords)}
        <associations>
          ${buildAssocIds('categories', 'category', data.categories)}
          ${buildAssocIds('products', 'product', data.products)}
        </associations>
      </category>
    </prestashop>`;
}

export function buildCategoryPatchXml(
	id: number,
	data: Partial<CategoryUpdateInput>
): string {
	const lines: string[] = [];

	const fStr = (tag: string, val: string | number | null | undefined) => {
		if (val !== undefined) lines.push(`    <${tag}><![CDATA[${val ?? ''}]]></${tag}>`);
	};
	const fBool = (tag: string, val: boolean | undefined) => {
		if (val !== undefined) lines.push(`    <${tag}><![CDATA[${val ? '1' : '0'}]]></${tag}>`);
	};
	const fLang = (tag: string, val: LangMap | undefined) => {
		if (val !== undefined) lines.push(`    ${buildLangField(tag, val)}`);
	};

	fStr('id_parent', data.id_parent as any);
	fBool('active', data.active);
	fStr('id_shop_default', data.id_shop_default as any);
	fBool('is_root_category', data.is_root_category);
	fStr('position', data.position as any);
	fStr('date_add', data.date_add as any);
	fStr('date_upd', data.date_upd as any);

	fLang('name', data.name as any);
	fLang('link_rewrite', data.link_rewrite as any);
	fLang('description', data.description as any);
	fLang('additional_description', data.additional_description as any);
	fLang('meta_title', data.meta_title as any);
	fLang('meta_description', data.meta_description as any);
	fLang('meta_keywords', data.meta_keywords as any);

	const assocLines: string[] = [];
	if (data.categories !== undefined) assocLines.push(`      ${buildAssocIds('categories', 'category', data.categories)}`);
	if (data.products !== undefined) assocLines.push(`      ${buildAssocIds('products', 'product', data.products)}`);

	const assocXml = assocLines.length > 0 ? `\n    <associations>\n${assocLines.join('\n')}\n    </associations>` : '';

	return `<?xml version="1.0" encoding="UTF-8"?>\n<prestashop xmlns:xlink="http://www.w3.org/1999/xlink">\n  <category>\n    <id><![CDATA[${id}]]></id>\n${lines.join('\n')}${assocXml}\n  </category>\n</prestashop>`;
}

