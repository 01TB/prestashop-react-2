import { buildLangField } from '../../utils/xml-utils';
import type {
  CombinationCreateInput,
  CombinationUpdateInput,
  CombinationAssocId,
} from './combinations.types';

const toStr = (v: string | number | undefined | null): string =>
  v != null ? String(v) : '';

const toBool = (v: boolean | undefined): string =>
  v === true ? '1' : v === false ? '0' : '';

const toPrice = (v: number | undefined): string =>
  v != null ? v.toFixed(6) : '';

const toFloat = (v: number | undefined): string =>
  v != null ? String(v) : '';

const buildAssocIds = (tag: string, nodeTag: string, items?: CombinationAssocId[]): string => {
  if (!items?.length) return `<${tag}></${tag}>`;
  const rows = items.map(i => `
        <${nodeTag}>
          <id><![CDATA[${i.id}]]></id>
        </${nodeTag}>`).join('');
  return `<${tag}>${rows}
      </${tag}>`;
};

export function buildCombinationPostXml(data: CombinationCreateInput): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
  <combination>
    <id><![CDATA[]]></id>
    <id_product><![CDATA[${toStr(data.id_product)}]]></id_product>
    <ean13><![CDATA[${toStr(data.ean13 ?? '')}]]></ean13>
    <isbn><![CDATA[${toStr(data.isbn ?? '')}]]></isbn>
    <upc><![CDATA[${toStr(data.upc ?? '')}]]></upc>
    <mpn><![CDATA[${toStr(data.mpn ?? '')}]]></mpn>
    <reference><![CDATA[${toStr(data.reference ?? '')}]]></reference>
    <supplier_reference><![CDATA[${toStr(data.supplier_reference ?? '')}]]></supplier_reference>
    <wholesale_price><![CDATA[${toPrice(data.wholesale_price)}]]></wholesale_price>
    <price><![CDATA[${toPrice(data.price)}]]></price>
    <ecotax><![CDATA[${toPrice(data.ecotax)}]]></ecotax>
    <weight><![CDATA[${toFloat(data.weight)}]]></weight>
    <unit_price_impact><![CDATA[${toPrice(data.unit_price_impact)}]]></unit_price_impact>
    <minimal_quantity><![CDATA[${toStr(data.minimal_quantity)}]]></minimal_quantity>
    <low_stock_threshold><![CDATA[${toStr(data.low_stock_threshold ?? '')}]]></low_stock_threshold>
    <low_stock_alert><![CDATA[${toBool(data.low_stock_alert)}]]></low_stock_alert>
    <default_on><![CDATA[${toBool(data.default_on)}]]></default_on>
    <available_date><![CDATA[${toStr(data.available_date ?? '')}]]></available_date>
    ${buildLangField('available_now', data.available_now)}
    ${buildLangField('available_later', data.available_later)}
    <associations>
      ${buildAssocIds('product_option_values', 'product_option_value', data.product_option_values)}
      ${buildAssocIds('images', 'image', data.images)}
    </associations>
  </combination>
</prestashop>`;
}

export function buildCombinationPatchXml(
  id: number,
  data: Partial<CombinationUpdateInput>
): string {
  const lines: string[] = [];

  const fStr = (tag: string, value: string | number | null | undefined) => {
    if (value !== undefined) lines.push(`    <${tag}><![CDATA[${value ?? ''}]]></${tag}>`);
  };

  const fBool = (tag: string, value: boolean | undefined) => {
    if (value !== undefined) lines.push(`    <${tag}><![CDATA[${value ? '1' : '0'}]]></${tag}>`);
  };

  const fPrice = (tag: string, value: number | undefined) => {
    if (value !== undefined) lines.push(`    <${tag}><![CDATA[${value.toFixed(6)}]]></${tag}>`);
  };

  const fFloat = (tag: string, value: number | undefined) => {
    if (value !== undefined) lines.push(`    <${tag}><![CDATA[${value}]]></${tag}>`);
  };

  const fLang = (tag: string, value: CombinationUpdateInput['available_now'] | undefined) => {
    if (value !== undefined) lines.push(`    ${buildLangField(tag, value)}`);
  };

  fStr('id_product', data.id_product);
  fStr('ean13', data.ean13);
  fStr('isbn', data.isbn);
  fStr('upc', data.upc);
  fStr('mpn', data.mpn);
  fStr('reference', data.reference);
  fStr('supplier_reference', data.supplier_reference);
  fPrice('wholesale_price', data.wholesale_price);
  fPrice('price', data.price);
  fPrice('ecotax', data.ecotax);
  fFloat('weight', data.weight);
  fPrice('unit_price_impact', data.unit_price_impact);
  fStr('minimal_quantity', data.minimal_quantity);
  fStr('low_stock_threshold', data.low_stock_threshold);
  fBool('low_stock_alert', data.low_stock_alert);
  fBool('default_on', data.default_on);
  fStr('available_date', data.available_date);
  fLang('available_now', data.available_now);
  fLang('available_later', data.available_later);

  const assocLines: string[] = [];
  if (data.product_option_values !== undefined)
    assocLines.push(`      ${buildAssocIds('product_option_values', 'product_option_value', data.product_option_values)}`);
  if (data.images !== undefined)
    assocLines.push(`      ${buildAssocIds('images', 'image', data.images)}`);

  const assocXml = assocLines.length > 0
    ? `\n    <associations>\n${assocLines.join('\n')}\n    </associations>`
    : '';

  return `<?xml version="1.0" encoding="UTF-8"?>
<prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
  <combination>
    <id><![CDATA[${id}]]></id>
${lines.join('\n')}${assocXml}
  </combination>
</prestashop>`;
}
