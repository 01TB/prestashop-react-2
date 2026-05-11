import { buildLangField, type LangMap } from '../../utils/xml-utils';
import type {
  ProductOptionCreateInput,
  ProductOptionUpdateInput,
  ProductOptionValueAssoc,
} from './product_options.types';

const toStr = (v: string | number | undefined | null): string =>
  v != null ? String(v) : '';

const toBool = (v: boolean | undefined): string =>
  v === true ? '1' : v === false ? '0' : '';

const buildAssocIds = (
  tag: string,
  nodeTag: string,
  items?: ProductOptionValueAssoc[]
): string => {
  if (!items?.length) return `<${tag}></${tag}>`;
  const rows = items.map(i => `
        <${nodeTag}>
          <id><![CDATA[${i.id}]]></id>
        </${nodeTag}>`).join('');
  return `<${tag}>${rows}
      </${tag}>`;
};

export function buildProductOptionPostXml(data: ProductOptionCreateInput): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
  <product_option>
    <id><![CDATA[]]></id>
    <is_color_group><![CDATA[${toBool(data.is_color_group)}]]></is_color_group>
    <group_type><![CDATA[${toStr(data.group_type)}]]></group_type>
    <position><![CDATA[${toStr(data.position ?? '')}]]></position>
    ${buildLangField('name', data.name)}
    ${buildLangField('public_name', data.public_name)}
    <associations>
      ${buildAssocIds('product_option_values', 'product_option_value', data.product_option_values)}
    </associations>
  </product_option>
</prestashop>`;
}

export function buildProductOptionPatchXml(
  id: number,
  data: Partial<ProductOptionUpdateInput>
): string {
  const lines: string[] = [];

  const fStr = (tag: string, value: string | number | null | undefined) => {
    if (value !== undefined) lines.push(`    <${tag}><![CDATA[${value ?? ''}]]></${tag}>`);
  };

  const fBool = (tag: string, value: boolean | undefined) => {
    if (value !== undefined) lines.push(`    <${tag}><![CDATA[${value ? '1' : '0'}]]></${tag}>`);
  };

  const fLang = (tag: string, value: LangMap | undefined) => {
    if (value !== undefined) lines.push(`    ${buildLangField(tag, value)}`);
  };

  fBool('is_color_group', data.is_color_group);
  fStr('group_type', data.group_type);
  fStr('position', data.position);
  fLang('name', data.name);
  fLang('public_name', data.public_name);

  const assocLines: string[] = [];
  if (data.product_option_values !== undefined)
    assocLines.push(`      ${buildAssocIds('product_option_values', 'product_option_value', data.product_option_values)}`);

  const assocXml = assocLines.length > 0
    ? `\n    <associations>\n${assocLines.join('\n')}\n    </associations>`
    : '';

  return `<?xml version="1.0" encoding="UTF-8"?>
<prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
  <product_option>
    <id><![CDATA[${id}]]></id>
${lines.join('\n')}${assocXml}
  </product_option>
</prestashop>`;
}
