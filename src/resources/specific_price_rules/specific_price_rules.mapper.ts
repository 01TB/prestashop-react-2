import type { SpecificPriceRuleCreateInput, SpecificPriceRuleUpdateInput } from './specific_price_rules.types';

const toStr = (v: string | number | undefined | null): string =>
  v != null ? String(v) : '';

const toBool = (v: boolean | undefined): string =>
  v === true ? '1' : v === false ? '0' : '';

export function buildSpecificPriceRulePostXml(data: SpecificPriceRuleCreateInput): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
  <specific_price_rule>
    <id><![CDATA[]]></id>
    <id_shop><![CDATA[${toStr(data.id_shop)}]]></id_shop>
    <id_country><![CDATA[${toStr(data.id_country)}]]></id_country>
    <id_currency><![CDATA[${toStr(data.id_currency)}]]></id_currency>
    <id_group><![CDATA[${toStr(data.id_group)}]]></id_group>
    <name><![CDATA[${toStr(data.name)}]]></name>
    <from_quantity><![CDATA[${toStr(data.from_quantity)}]]></from_quantity>
    <price><![CDATA[${toStr(data.price)}]]></price>
    <reduction><![CDATA[${toStr(data.reduction)}]]></reduction>
    <reduction_tax><![CDATA[${toBool(data.reduction_tax)}]]></reduction_tax>
    <reduction_type><![CDATA[${toStr(data.reduction_type)}]]></reduction_type>
    <from><![CDATA[${toStr(data.from ?? '')}]]></from>
    <to><![CDATA[${toStr(data.to ?? '')}]]></to>
  </specific_price_rule>
</prestashop>`;
}

export function buildSpecificPriceRulePutXml(id: number, data: SpecificPriceRuleUpdateInput): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
  <specific_price_rule>
    <id><![CDATA[${toStr(id)}]]></id>
    <id_shop><![CDATA[${toStr(data.id_shop)}]]></id_shop>
    <id_country><![CDATA[${toStr(data.id_country)}]]></id_country>
    <id_currency><![CDATA[${toStr(data.id_currency)}]]></id_currency>
    <id_group><![CDATA[${toStr(data.id_group)}]]></id_group>
    <name><![CDATA[${toStr(data.name)}]]></name>
    <from_quantity><![CDATA[${toStr(data.from_quantity)}]]></from_quantity>
    <price><![CDATA[${toStr(data.price)}]]></price>
    <reduction><![CDATA[${toStr(data.reduction)}]]></reduction>
    <reduction_tax><![CDATA[${toBool(data.reduction_tax)}]]></reduction_tax>
    <reduction_type><![CDATA[${toStr(data.reduction_type)}]]></reduction_type>
    <from><![CDATA[${toStr(data.from ?? '')}]]></from>
    <to><![CDATA[${toStr(data.to ?? '')}]]></to>
  </specific_price_rule>
</prestashop>`;
}

export function buildSpecificPriceRulePatchXml(
  id: number,
  data: Partial<SpecificPriceRuleUpdateInput>
): string {
  const lines: string[] = [];

  const fStr = (tag: string, value: string | number | undefined) => {
    if (value !== undefined) lines.push(`    <${tag}><![CDATA[${toStr(value)}]]></${tag}>`);
  };

  const fBool = (tag: string, value: boolean | undefined) => {
    if (value !== undefined) lines.push(`    <${tag}><![CDATA[${toBool(value)}]]></${tag}>`);
  };

  fStr('id_shop', data.id_shop);
  fStr('id_country', data.id_country);
  fStr('id_currency', data.id_currency);
  fStr('id_group', data.id_group);
  fStr('name', data.name);
  fStr('from_quantity', data.from_quantity);
  fStr('price', data.price);
  fStr('reduction', data.reduction);
  fBool('reduction_tax', data.reduction_tax);
  fStr('reduction_type', data.reduction_type);
  fStr('from', data.from);
  fStr('to', data.to);

  return `<?xml version="1.0" encoding="UTF-8"?>
<prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
  <specific_price_rule>
    <id><![CDATA[${toStr(id)}]]></id>
${lines.join('\n')}
  </specific_price_rule>
</prestashop>`;
}
