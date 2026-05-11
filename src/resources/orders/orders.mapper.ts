/* eslint-disable @typescript-eslint/no-explicit-any */
import type { OrderCreateInput, OrderRowInput, OrderUpdateInput } from './orders.types';

// ─── Helpers de conversion ────────────────────────────────────────────────────

const toStr  = (v: string | number | undefined | null): string =>
  v != null ? String(v) : '';

const toBool = (v: boolean | undefined): string =>
  v === true ? '1' : v === false ? '0' : '';

const toPrice = (v: number | undefined): string =>
  v != null ? v.toFixed(6) : '';

const toFloat = (v: number | undefined): string =>
  v != null ? String(v) : '';

// ─── Builder de lignes de commande ───────────────────────────────────────────

function buildOrderRowXml(row: OrderRowInput): string {
  return `
  <order_row>
    <id><![CDATA[]]></id>
    <product_id><![CDATA[${toStr(row.product_id)}]]></product_id>
    <product_attribute_id><![CDATA[${toStr(row.product_attribute_id)}]]></product_attribute_id>
    <product_quantity><![CDATA[${toStr(row.product_quantity)}]]></product_quantity>
    <product_name><![CDATA[]]></product_name>
    <product_reference><![CDATA[]]></product_reference>
    <product_ean13><![CDATA[]]></product_ean13>
    <product_isbn><![CDATA[]]></product_isbn>
    <product_upc><![CDATA[]]></product_upc>
    <product_price><![CDATA[]]></product_price>
    <id_customization><![CDATA[${toStr(row.id_customization ?? 0)}]]></id_customization>
    <unit_price_tax_incl><![CDATA[]]></unit_price_tax_incl>
    <unit_price_tax_excl><![CDATA[]]></unit_price_tax_excl>
  </order_row>`;
}

// ─── POST : création complète ─────────────────────────────────────────────────

/**
 * Construit le XML body pour POST /api/orders
 * On part du blank schema et on remplit les champs depuis `data`.
 * Les champs readOnly (product_name, product_price, etc.) restent vides.
 */
export function buildOrderPostXml(data: OrderCreateInput): string {
  const rows = (data.order_rows ?? []).map(buildOrderRowXml).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
  <prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
  <order>
      <id><![CDATA[]]></id>
      <id_address_delivery><![CDATA[${toStr(data.id_address_delivery)}]]></id_address_delivery>
      <id_address_invoice><![CDATA[${toStr(data.id_address_invoice)}]]></id_address_invoice>
      <id_cart><![CDATA[${toStr(data.id_cart)}]]></id_cart>
      <id_currency><![CDATA[${toStr(data.id_currency)}]]></id_currency>
      <id_lang><![CDATA[${toStr(data.id_lang)}]]></id_lang>
      <id_customer><![CDATA[${toStr(data.id_customer)}]]></id_customer>
      <id_carrier><![CDATA[${toStr(data.id_carrier)}]]></id_carrier>
      <current_state><![CDATA[${toStr(data.current_state ?? '')}]]></current_state>
      <module><![CDATA[${toStr(data.module)}]]></module>
      <invoice_number><![CDATA[${toStr(data.invoice_number ?? '')}]]></invoice_number>
      <invoice_date><![CDATA[${toStr(data.invoice_date ?? '')}]]></invoice_date>
      <delivery_number><![CDATA[${toStr(data.delivery_number ?? '')}]]></delivery_number>
      <delivery_date><![CDATA[${toStr(data.delivery_date ?? '')}]]></delivery_date>
      <valid><![CDATA[${toBool(data.valid)}]]></valid>
      <date_add><![CDATA[${toStr(data.date_add ?? '')}]]></date_add>
      <date_upd><![CDATA[${toStr(data.date_upd ?? '')}]]></date_upd>
      <shipping_number><![CDATA[${toStr(data.shipping_number ?? '')}]]></shipping_number>
      <note><![CDATA[${toStr(data.note ?? '')}]]></note>
      <id_shop_group><![CDATA[${toStr(data.id_shop_group ?? '')}]]></id_shop_group>
      <id_shop><![CDATA[${toStr(data.id_shop ?? '')}]]></id_shop>
      <secure_key><![CDATA[${toStr(data.secure_key ?? '')}]]></secure_key>
      <payment><![CDATA[${toStr(data.payment)}]]></payment>
      <recyclable><![CDATA[${toBool(data.recyclable)}]]></recyclable>
      <gift><![CDATA[${toBool(data.gift)}]]></gift>
      <gift_message><![CDATA[${toStr(data.gift_message ?? '')}]]></gift_message>
      <mobile_theme><![CDATA[${toBool(data.mobile_theme)}]]></mobile_theme>
      <total_discounts><![CDATA[${toPrice(data.total_discounts)}]]></total_discounts>
      <total_discounts_tax_incl><![CDATA[${toPrice(data.total_discounts_tax_incl)}]]></total_discounts_tax_incl>
      <total_discounts_tax_excl><![CDATA[${toPrice(data.total_discounts_tax_excl)}]]></total_discounts_tax_excl>
      <total_paid><![CDATA[${toPrice(data.total_paid)}]]></total_paid>
      <total_paid_tax_incl><![CDATA[${toPrice(data.total_paid_tax_incl)}]]></total_paid_tax_incl>
      <total_paid_tax_excl><![CDATA[${toPrice(data.total_paid_tax_excl)}]]></total_paid_tax_excl>
      <total_paid_real><![CDATA[${toPrice(data.total_paid_real)}]]></total_paid_real>
      <total_products><![CDATA[${toPrice(data.total_products)}]]></total_products>
      <total_products_wt><![CDATA[${toPrice(data.total_products_wt)}]]></total_products_wt>
      <total_shipping><![CDATA[${toPrice(data.total_shipping)}]]></total_shipping>
      <total_shipping_tax_incl><![CDATA[${toPrice(data.total_shipping_tax_incl)}]]></total_shipping_tax_incl>
      <total_shipping_tax_excl><![CDATA[${toPrice(data.total_shipping_tax_excl)}]]></total_shipping_tax_excl>
      <carrier_tax_rate><![CDATA[${toFloat(data.carrier_tax_rate)}]]></carrier_tax_rate>
      <total_wrapping><![CDATA[${toPrice(data.total_wrapping)}]]></total_wrapping>
      <total_wrapping_tax_incl><![CDATA[${toPrice(data.total_wrapping_tax_incl)}]]></total_wrapping_tax_incl>
      <total_wrapping_tax_excl><![CDATA[${toPrice(data.total_wrapping_tax_excl)}]]></total_wrapping_tax_excl>
      <round_mode><![CDATA[${toStr(data.round_mode ?? '')}]]></round_mode>
      <round_type><![CDATA[${toStr(data.round_type ?? '')}]]></round_type>
      <conversion_rate><![CDATA[${toFloat(data.conversion_rate)}]]></conversion_rate>
      <reference><![CDATA[${toStr(data.reference ?? '')}]]></reference>
      <associations>
      <order_rows>${rows}
      </order_rows>
      </associations>
  </order>
</prestashop>`;
}

/**
 * Construit le XML body minimal pour PATCH /api/orders/{id}
 *
 * Approche XML minimal : seules les balises des champs présents dans `data`
 * sont émises. Un champ absent de `data` est absent du XML → PrestaShop
 * le laisse intact en base. Un champ présent (même à "") → PrestaShop le met à jour.
 *
 * ⚠ Ne jamais patcher les champs readOnly :
 *   product_name, product_reference, product_ean13, product_isbn,
 *   product_upc, product_price, unit_price_tax_incl, unit_price_tax_excl
 */
export function buildOrderPatchXml(
  id: number,
  data: Partial<OrderUpdateInput>
): string {
  const lines: string[] = [];

  // Helpers : poussent une ligne XML uniquement si la valeur est définie
  const fStr = (tag: string, val: string | number | null | undefined) => {
    if (val !== undefined) lines.push(`    <${tag}><![CDATA[${val ?? ''}]]></${tag}>`);
  };
  const fBool = (tag: string, val: boolean | undefined) => {
    if (val !== undefined) lines.push(`    <${tag}><![CDATA[${val ? '1' : '0'}]]></${tag}>`);
  };
  const fPrice = (tag: string, val: number | undefined) => {
    if (val !== undefined) lines.push(`    <${tag}><![CDATA[${val.toFixed(6)}]]></${tag}>`);
  };
  const fFloat = (tag: string, val: number | undefined) => {
    if (val !== undefined) lines.push(`    <${tag}><![CDATA[${val}]]></${tag}>`);
  };

  // ── champs scalaires ──────────────────────────────────────────────────────
  fStr  ('id_address_delivery',      data.id_address_delivery);
  fStr  ('id_address_invoice',       data.id_address_invoice);
  fStr  ('id_currency',              data.id_currency);
  fStr  ('id_lang',                  data.id_lang);
  fStr  ('id_customer',              data.id_customer);
  fStr  ('id_carrier',               data.id_carrier);
  fStr  ('current_state',            data.current_state);
  fStr  ('module',                   data.module);
  fStr  ('invoice_number',           data.invoice_number);
  fStr  ('invoice_date',             data.invoice_date);
  fStr  ('delivery_number',          data.delivery_number);
  fStr  ('delivery_date',            data.delivery_date);
  fBool ('valid',                    data.valid);
  fStr  ('date_add',                 data.date_add);
  fStr  ('date_upd',                 data.date_upd);
  fStr  ('shipping_number',          data.shipping_number);
  fStr  ('note',                     data.note);
  fStr  ('id_shop_group',            data.id_shop_group);
  fStr  ('id_shop',                  data.id_shop);
  fStr  ('secure_key',               data.secure_key);
  fStr  ('payment',                  data.payment);
  fBool ('recyclable',               data.recyclable);
  fBool ('gift',                     data.gift);
  fStr  ('gift_message',             data.gift_message);
  fBool ('mobile_theme',             data.mobile_theme);
  fPrice('total_discounts',          data.total_discounts);
  fPrice('total_discounts_tax_incl', data.total_discounts_tax_incl);
  fPrice('total_discounts_tax_excl', data.total_discounts_tax_excl);
  fPrice('total_paid',               data.total_paid);
  fPrice('total_paid_tax_incl',      data.total_paid_tax_incl);
  fPrice('total_paid_tax_excl',      data.total_paid_tax_excl);
  fPrice('total_paid_real',          data.total_paid_real);
  fPrice('total_products',           data.total_products);
  fPrice('total_products_wt',        data.total_products_wt);
  fPrice('total_shipping',           data.total_shipping);
  fPrice('total_shipping_tax_incl',  data.total_shipping_tax_incl);
  fPrice('total_shipping_tax_excl',  data.total_shipping_tax_excl);
  fFloat('carrier_tax_rate',         data.carrier_tax_rate);
  fPrice('total_wrapping',           data.total_wrapping);
  fPrice('total_wrapping_tax_incl',  data.total_wrapping_tax_incl);
  fPrice('total_wrapping_tax_excl',  data.total_wrapping_tax_excl);
  fStr  ('round_mode',               data.round_mode);
  fStr  ('round_type',               data.round_type);
  fFloat('conversion_rate',          data.conversion_rate);
  fStr  ('reference',                data.reference);

  // ── associations (omises si absentes de data) ─────────────────────────────
  let assocXml = '';
  if (data.order_rows !== undefined) {
    const rows = data.order_rows.map(buildOrderRowXml).join('');
    assocXml = `
    <associations>
      <order_rows>${rows}
      </order_rows>
    </associations>`;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
  <prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
    <order>
      <id><![CDATA[${id}]]></id>
  ${lines.join('\n')}${assocXml}
    </order>
  </prestashop>`;
}