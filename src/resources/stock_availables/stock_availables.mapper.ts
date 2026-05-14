/* eslint-disable @typescript-eslint/no-explicit-any */
import type { StockAvailableCreateInput, StockAvailableUpdateInput } from './stock_availables.types';

const toStr = (v: string | number | undefined | null): string => v != null ? String(v) : '';
const toInt = (v: number | undefined): string => v != null ? String(Math.floor(v)) : '';
const toBool = (v: boolean | undefined): string => v === true ? '1' : v === false ? '0' : '';

export function buildStockAvailablePostXml(data: StockAvailableCreateInput): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
  <stock_available>
    <id><![CDATA[]]></id>
    <id_product><![CDATA[${toStr(data.id_product)}]]></id_product>
    <id_product_attribute><![CDATA[${toStr(data.id_product_attribute)}]]></id_product_attribute>
    <id_shop><![CDATA[${toStr(data.id_shop ?? '')}]]></id_shop>
    <id_shop_group><![CDATA[${toStr(data.id_shop_group ?? '')}]]></id_shop_group>
    <quantity><![CDATA[${toInt(data.quantity)}]]></quantity>
    <depends_on_stock><![CDATA[${toBool(data.depends_on_stock)}]]></depends_on_stock>
    <out_of_stock><![CDATA[${toInt(data.out_of_stock)}]]></out_of_stock>
    <location><![CDATA[${toStr(data.location ?? '')}]]></location>
  </stock_available>
</prestashop>`;
}

export function buildStockAvailablePatchXml(
  id: number,
  data: Partial<StockAvailableUpdateInput>
): string {
  const lines: string[] = [];

  const fStr = (tag: string, val: string | number | null | undefined) => {
    if (val !== undefined) lines.push(`    <${tag}><![CDATA[${val ?? ''}]]></${tag}>`);
  };
  const fInt = (tag: string, val: number | undefined) => {
    if (val !== undefined) lines.push(`    <${tag}><![CDATA[${Math.floor(val)}]]></${tag}>`);
  };
  const fBool = (tag: string, val: boolean | undefined) => {
    if (val !== undefined) lines.push(`    <${tag}><![CDATA[${val ? '1' : '0'}]]></${tag}>`);
  };

  fStr('id_product', data.id_product as any);
  fStr('id_product_attribute', data.id_product_attribute as any);
  fStr('id_shop', data.id_shop as any);
  fStr('id_shop_group', data.id_shop_group as any);
  fInt('quantity', data.quantity);
  fBool('depends_on_stock', data.depends_on_stock);
  fInt('out_of_stock', data.out_of_stock);
  fStr('location', data.location as any);

  return `<?xml version="1.0" encoding="UTF-8"?>
<prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
  <stock_available>
    <id><![CDATA[${id}]]></id>
${lines.join('\n')}
  </stock_available>
</prestashop>`;
}
