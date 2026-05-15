import type { CartCreateInput, CartUpdateInput, CartRowInput } from './carts.types';

const toStr = (v: string | number | undefined | null): string =>
  v != null ? String(v) : '';

const toBool = (v: boolean | undefined): string =>
  v === true ? '1' : v === false ? '0' : '';

function buildCartRowXml(row: CartRowInput): string {
  return `
    <cart_row>
      <id_product><![CDATA[${toStr(row.id_product)}]]></id_product>
      <id_product_attribute><![CDATA[${toStr(row.id_product_attribute)}]]></id_product_attribute>
      <id_address_delivery><![CDATA[${toStr(row.id_address_delivery)}]]></id_address_delivery>
      <id_customization><![CDATA[${toStr(row.id_customization ?? '')}]]></id_customization>
      <quantity><![CDATA[${toStr(row.quantity)}]]></quantity>
    </cart_row>`;
}

export function buildCartPostXml(data: CartCreateInput): string {
  const rows = (data.cart_rows ?? []).map(buildCartRowXml).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
  <cart>
    <id><![CDATA[]]></id>
    <id_address_delivery><![CDATA[${toStr(data.id_address_delivery ?? '')}]]></id_address_delivery>
    <id_address_invoice><![CDATA[${toStr(data.id_address_invoice ?? '')}]]></id_address_invoice>
    <id_currency><![CDATA[${toStr(data.id_currency)}]]></id_currency>
    <id_customer><![CDATA[${toStr(data.id_customer ?? '')}]]></id_customer>
    <id_guest><![CDATA[${toStr(data.id_guest ?? '')}]]></id_guest>
    <id_lang><![CDATA[${toStr(data.id_lang)}]]></id_lang>
    <id_shop_group><![CDATA[${toStr(data.id_shop_group ?? '')}]]></id_shop_group>
    <id_shop><![CDATA[${toStr(data.id_shop ?? '')}]]></id_shop>
    <id_carrier><![CDATA[${toStr(data.id_carrier ?? '')}]]></id_carrier>
    <recyclable><![CDATA[${toBool(data.recyclable)}]]></recyclable>
    <gift><![CDATA[${toBool(data.gift)}]]></gift>
    <gift_message><![CDATA[${toStr(data.gift_message ?? '')}]]></gift_message>
    <mobile_theme><![CDATA[${toBool(data.mobile_theme)}]]></mobile_theme>
    <delivery_option><![CDATA[${toStr(data.delivery_option ?? '')}]]></delivery_option>
    <secure_key><![CDATA[${toStr(data.secure_key ?? '')}]]></secure_key>
    <allow_seperated_package><![CDATA[${toBool(data.allow_seperated_package)}]]></allow_seperated_package>
    <date_add><![CDATA[${toStr(data.date_add ?? '')}]]></date_add>
    <date_upd><![CDATA[${toStr(data.date_upd ?? '')}]]></date_upd>
    <associations>
      <cart_rows>${rows}
      </cart_rows>
    </associations>
  </cart>
</prestashop>`;
}

export function buildCartPutXml(id: number, data: CartUpdateInput): string {
  const rows = (data.cart_rows ?? []).map(buildCartRowXml).join('');

  if(rows.length === 0) {
      return `<?xml version="1.0" encoding="UTF-8"?>
<prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
  <cart>
    <id><![CDATA[${toStr(id)}]]></id>
    <id_address_delivery><![CDATA[${toStr(data.id_address_delivery ?? '')}]]></id_address_delivery>
    <id_address_invoice><![CDATA[${toStr(data.id_address_invoice ?? '')}]]></id_address_invoice>
    <id_currency><![CDATA[${toStr(data.id_currency)}]]></id_currency>
    <id_customer><![CDATA[${toStr(data.id_customer ?? '')}]]></id_customer>
    <id_guest><![CDATA[${toStr(data.id_guest ?? '')}]]></id_guest>
    <id_lang><![CDATA[${toStr(data.id_lang)}]]></id_lang>
    <id_shop_group><![CDATA[${toStr(data.id_shop_group ?? '')}]]></id_shop_group>
    <id_shop><![CDATA[${toStr(data.id_shop ?? '')}]]></id_shop>
    <id_carrier><![CDATA[${toStr(data.id_carrier ?? '')}]]></id_carrier>
    <recyclable><![CDATA[${toBool(data.recyclable)}]]></recyclable>
    <gift><![CDATA[${toBool(data.gift)}]]></gift>
    <gift_message><![CDATA[${toStr(data.gift_message ?? '')}]]></gift_message>
    <mobile_theme><![CDATA[${toBool(data.mobile_theme)}]]></mobile_theme>
    <delivery_option><![CDATA[${toStr(data.delivery_option ?? '')}]]></delivery_option>
    <secure_key><![CDATA[${toStr(data.secure_key ?? '')}]]></secure_key>
    <allow_seperated_package><![CDATA[${toBool(data.allow_seperated_package)}]]></allow_seperated_package>
    <date_add><![CDATA[${toStr(data.date_add ?? '')}]]></date_add>
    <date_upd><![CDATA[${toStr(data.date_upd ?? '')}]]></date_upd>
    <associations>
      <cart_rows nodeType="cart_row" virtualEntity="true"></cart_rows>
    </associations>
  </cart>
</prestashop>`;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
  <cart>
    <id><![CDATA[${toStr(id)}]]></id>
    <id_address_delivery><![CDATA[${toStr(data.id_address_delivery ?? '')}]]></id_address_delivery>
    <id_address_invoice><![CDATA[${toStr(data.id_address_invoice ?? '')}]]></id_address_invoice>
    <id_currency><![CDATA[${toStr(data.id_currency)}]]></id_currency>
    <id_customer><![CDATA[${toStr(data.id_customer ?? '')}]]></id_customer>
    <id_guest><![CDATA[${toStr(data.id_guest ?? '')}]]></id_guest>
    <id_lang><![CDATA[${toStr(data.id_lang)}]]></id_lang>
    <id_shop_group><![CDATA[${toStr(data.id_shop_group ?? '')}]]></id_shop_group>
    <id_shop><![CDATA[${toStr(data.id_shop ?? '')}]]></id_shop>
    <id_carrier><![CDATA[${toStr(data.id_carrier ?? '')}]]></id_carrier>
    <recyclable><![CDATA[${toBool(data.recyclable)}]]></recyclable>
    <gift><![CDATA[${toBool(data.gift)}]]></gift>
    <gift_message><![CDATA[${toStr(data.gift_message ?? '')}]]></gift_message>
    <mobile_theme><![CDATA[${toBool(data.mobile_theme)}]]></mobile_theme>
    <delivery_option><![CDATA[${toStr(data.delivery_option ?? '')}]]></delivery_option>
    <secure_key><![CDATA[${toStr(data.secure_key ?? '')}]]></secure_key>
    <allow_seperated_package><![CDATA[${toBool(data.allow_seperated_package)}]]></allow_seperated_package>
    <date_add><![CDATA[${toStr(data.date_add ?? '')}]]></date_add>
    <date_upd><![CDATA[${toStr(data.date_upd ?? '')}]]></date_upd>
    <associations>
      <cart_rows>${rows}
      </cart_rows>
    </associations>
  </cart>
</prestashop>`;
}

export function buildCartPatchXml(
  id: number,
  data: Partial<CartUpdateInput>
): string {
  const lines: string[] = [];

  const fStr = (tag: string, value: string | number | null | undefined) => {
    if (value !== undefined) lines.push(`    <${tag}><![CDATA[${value ?? ''}]]></${tag}>`);
  };

  const fBool = (tag: string, value: boolean | undefined) => {
    if (value !== undefined) lines.push(`    <${tag}><![CDATA[${value ? '1' : '0'}]]></${tag}>`);
  };

  fStr('id_address_delivery', data.id_address_delivery);
  fStr('id_address_invoice', data.id_address_invoice);
  fStr('id_currency', data.id_currency);
  fStr('id_customer', data.id_customer);
  fStr('id_guest', data.id_guest);
  fStr('id_lang', data.id_lang);
  fStr('id_shop_group', data.id_shop_group);
  fStr('id_shop', data.id_shop);
  fStr('id_carrier', data.id_carrier);
  fBool('recyclable', data.recyclable);
  fBool('gift', data.gift);
  fStr('gift_message', data.gift_message);
  fBool('mobile_theme', data.mobile_theme);
  fStr('delivery_option', data.delivery_option);
  fStr('secure_key', data.secure_key);
  fBool('allow_seperated_package', data.allow_seperated_package);
  fStr('date_add', data.date_add);
  fStr('date_upd', data.date_upd);

  let assocXml = '';
  if (data.cart_rows !== undefined) {
    const rows = data.cart_rows.map(buildCartRowXml).join('');
    assocXml = `
    <associations>
      <cart_rows>${rows}
      </cart_rows>
    </associations>`;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
  <cart>
    <id><![CDATA[${id}]]></id>
${lines.join('\n')}${assocXml}
  </cart>
</prestashop>`;
}
