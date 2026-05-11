/* eslint-disable @typescript-eslint/no-explicit-any */
import { buildLangField } from '../../utils/xml-utils';
import type { OrderStateCreateInput, OrderStateUpdateInput } from './order_states.types';

const toStr = (v: string | number | undefined | null): string =>
  v != null ? String(v) : '';

const toBool = (v: boolean | undefined): string =>
  v === true ? '1' : v === false ? '0' : '';

export function buildOrderStatePostXml(data: OrderStateCreateInput): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
  <order_state>
    <id><![CDATA[]]></id>
    <unremovable><![CDATA[${toBool(data.unremovable)}]]></unremovable>
    <delivery><![CDATA[${toBool(data.delivery)}]]></delivery>
    <hidden><![CDATA[${toBool(data.hidden)}]]></hidden>
    <send_email><![CDATA[${toBool(data.send_email)}]]></send_email>
    <module_name><![CDATA[${toStr(data.module_name)}]]></module_name>
    <invoice><![CDATA[${toBool(data.invoice)}]]></invoice>
    <color><![CDATA[${toStr(data.color)}]]></color>
    <logable><![CDATA[${toBool(data.logable)}]]></logable>
    <shipped><![CDATA[${toBool(data.shipped)}]]></shipped>
    <paid><![CDATA[${toBool(data.paid)}]]></paid>
    <pdf_delivery><![CDATA[${toBool(data.pdf_delivery)}]]></pdf_delivery>
    <pdf_invoice><![CDATA[${toBool(data.pdf_invoice)}]]></pdf_invoice>
    <deleted><![CDATA[${toBool(data.deleted)}]]></deleted>
    ${buildLangField('name', data.name)}
    ${buildLangField('template', data.template)}
  </order_state>
</prestashop>`;
}

export function buildOrderStatePatchXml(
  id: number,
  data: Partial<OrderStateUpdateInput>
): string {
  const lines: string[] = [];

  const fStr = (tag: string, value: string | number | null | undefined) => {
    if (value !== undefined) lines.push(`    <${tag}><![CDATA[${value ?? ''}]]></${tag}>`);
  };

  const fBool = (tag: string, value: boolean | undefined) => {
    if (value !== undefined) lines.push(`    <${tag}><![CDATA[${value ? '1' : '0'}]]></${tag}>`);
  };

  const fLang = (tag: string, value: OrderStateUpdateInput['name'] | undefined) => {
    if (value !== undefined) lines.push(`    ${buildLangField(tag, value)}`);
  };

  fBool('unremovable', data.unremovable);
  fBool('delivery', data.delivery);
  fBool('hidden', data.hidden);
  fBool('send_email', data.send_email);
  fStr('module_name', data.module_name);
  fBool('invoice', data.invoice);
  fStr('color', data.color);
  fBool('logable', data.logable);
  fBool('shipped', data.shipped);
  fBool('paid', data.paid);
  fBool('pdf_delivery', data.pdf_delivery);
  fBool('pdf_invoice', data.pdf_invoice);
  fBool('deleted', data.deleted);
  fLang('name', data.name);
  fLang('template', data.template);

  return `<?xml version="1.0" encoding="UTF-8"?>
<prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
  <order_state>
    <id><![CDATA[${id}]]></id>
${lines.join('\n')}
  </order_state>
</prestashop>`;
}
