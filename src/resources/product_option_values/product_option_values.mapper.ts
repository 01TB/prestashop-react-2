import { buildLangField, type LangMap } from '../../utils/xml-utils';
import type {
  ProductOptionValueCreateInput,
  ProductOptionValueUpdateInput,
} from './product_option_values.types';

const toStr = (v: string | number | undefined | null): string =>
  v != null ? String(v) : '';

export function buildProductOptionValuePostXml(
  data: ProductOptionValueCreateInput
): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
  <product_option_value>
    <id><![CDATA[]]></id>
    <id_attribute_group><![CDATA[${toStr(data.id_attribute_group)}]]></id_attribute_group>
    <color><![CDATA[${toStr(data.color ?? '')}]]></color>
    <position><![CDATA[${toStr(data.position ?? '')}]]></position>
    ${buildLangField('name', data.name)}
  </product_option_value>
</prestashop>`;
}

export function buildProductOptionValuePatchXml(
  id: number,
  data: Partial<ProductOptionValueUpdateInput>
): string {
  const lines: string[] = [];

  const fStr = (tag: string, value: string | number | null | undefined) => {
    if (value !== undefined) lines.push(`    <${tag}><![CDATA[${value ?? ''}]]></${tag}>`);
  };

  const fLang = (tag: string, value: LangMap | undefined) => {
    if (value !== undefined) lines.push(`    ${buildLangField(tag, value)}`);
  };

  fStr('id_attribute_group', data.id_attribute_group);
  fStr('color', data.color);
  fStr('position', data.position);
  fLang('name', data.name);

  return `<?xml version="1.0" encoding="UTF-8"?>
<prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
  <product_option_value>
    <id><![CDATA[${id}]]></id>
${lines.join('\n')}
  </product_option_value>
</prestashop>`;
}
