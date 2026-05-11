import type { OrderHistoryCreateInput, OrderHistoryUpdateInput } from './order_histories.types';

const toStr = (v: string | number | undefined | null): string =>
  v != null ? String(v) : '';

export function buildOrderHistoryPostXml(data: OrderHistoryCreateInput): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
  <order_history>
    <id><![CDATA[]]></id>
    <id_employee><![CDATA[${toStr(data.id_employee ?? '')}]]></id_employee>
    <id_order_state><![CDATA[${toStr(data.id_order_state)}]]></id_order_state>
    <id_order><![CDATA[${toStr(data.id_order)}]]></id_order>
    <date_add><![CDATA[${toStr(data.date_add ?? '')}]]></date_add>
  </order_history>
</prestashop>`;
}

export function buildOrderHistoryPatchXml(
  id: number,
  data: Partial<OrderHistoryUpdateInput>
): string {
  const lines: string[] = [];

  const fStr = (tag: string, value: string | number | null | undefined) => {
    if (value !== undefined) lines.push(`    <${tag}><![CDATA[${value ?? ''}]]></${tag}>`);
  };

  fStr('id_employee', data.id_employee);
  fStr('id_order_state', data.id_order_state);
  fStr('id_order', data.id_order);
  fStr('date_add', data.date_add);

  return `<?xml version="1.0" encoding="UTF-8"?>
<prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
  <order_history>
    <id><![CDATA[${id}]]></id>
${lines.join('\n')}
  </order_history>
</prestashop>`;
}
