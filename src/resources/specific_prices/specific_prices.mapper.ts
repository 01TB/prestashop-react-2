/* eslint-disable @typescript-eslint/no-explicit-any */
import type { SpecificPriceCreateInput, SpecificPriceUpdateInput } from './specific_prices.types';

const toStr = (v: string | number | undefined | null): string => v != null ? String(v) : '';
const toBool = (v: boolean | undefined): string => v === true ? '1' : v === false ? '0' : '';
const toPrice = (v: number | undefined): string => v != null ? v.toFixed(6) : '';
const toInt = (v: number | undefined): string => v != null ? String(Math.floor(v)) : '';

export function buildSpecificPricePostXml(data: SpecificPriceCreateInput): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
  <specific_price>
    <id><![CDATA[]]></id>
    <id_shop_group><![CDATA[${toStr(data.id_shop_group ?? '')}]]></id_shop_group>
    <id_shop><![CDATA[${toStr(data.id_shop)}]]></id_shop>
    <id_cart><![CDATA[${toStr(data.id_cart)}]]></id_cart>
    <id_product><![CDATA[${toStr(data.id_product)}]]></id_product>
    <id_product_attribute><![CDATA[${toStr(data.id_product_attribute ?? '')}]]></id_product_attribute>
    <id_currency><![CDATA[${toStr(data.id_currency)}]]></id_currency>
    <id_country><![CDATA[${toStr(data.id_country)}]]></id_country>
    <id_group><![CDATA[${toStr(data.id_group)}]]></id_group>
    <id_customer><![CDATA[${toStr(data.id_customer)}]]></id_customer>
    <id_specific_price_rule><![CDATA[${toStr(data.id_specific_price_rule ?? '')}]]></id_specific_price_rule>
    <price><![CDATA[${toPrice(data.price)}]]></price>
    <from_quantity><![CDATA[${toInt(data.from_quantity)}]]></from_quantity>
    <reduction><![CDATA[${toPrice(data.reduction)}]]></reduction>
    <reduction_tax><![CDATA[${toBool(data.reduction_tax)}]]></reduction_tax>
    <reduction_type><![CDATA[${data.reduction_type}]]></reduction_type>
    <from><![CDATA[${toStr(data.from)}]]></from>
    <to><![CDATA[${toStr(data.to)}]]></to>
  </specific_price>
</prestashop>`;
}

export function buildSpecificPricePatchXml(
  id: number,
  data: Partial<SpecificPriceUpdateInput>
): string {
  const lines: string[] = [];

  const fStr = (tag: string, val: string | number | null | undefined) => {
    if (val !== undefined) lines.push(`    <${tag}><![CDATA[${val ?? ''}]]></${tag}>`);
  };
  const fBool = (tag: string, val: boolean | undefined) => {
    if (val !== undefined) lines.push(`    <${tag}><![CDATA[${val ? '1' : '0'}]]></${tag}>`);
  };
  const fPrice = (tag: string, val: number | undefined) => {
    if (val !== undefined) lines.push(`    <${tag}><![CDATA[${val.toFixed(6)}]]></${tag}>`);
  };
  const fInt = (tag: string, val: number | undefined) => {
    if (val !== undefined) lines.push(`    <${tag}><![CDATA[${Math.floor(val)}]]></${tag}>`);
  };

  fStr('id_shop_group', data.id_shop_group as any);
  fStr('id_shop', data.id_shop as any);
  fStr('id_cart', data.id_cart as any);
  fStr('id_product', data.id_product as any);
  fStr('id_product_attribute', data.id_product_attribute as any);
  fStr('id_currency', data.id_currency as any);
  fStr('id_country', data.id_country as any);
  fStr('id_group', data.id_group as any);
  fStr('id_customer', data.id_customer as any);
  fStr('id_specific_price_rule', data.id_specific_price_rule as any);
  fPrice('price', data.price as any);
  fInt('from_quantity', data.from_quantity as any);
  fPrice('reduction', data.reduction as any);
  fBool('reduction_tax', data.reduction_tax);
  fStr('reduction_type', data.reduction_type as any);
  fStr('from', data.from as any);
  fStr('to', data.to as any);

  return `<?xml version="1.0" encoding="UTF-8"?>
<prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
  <specific_price>
    <id><![CDATA[${id}]]></id>
${lines.join('\n')}
  </specific_price>
</prestashop>`;
}
