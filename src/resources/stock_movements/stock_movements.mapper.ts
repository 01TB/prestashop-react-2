import { buildLangField } from '../../utils/xml-utils';
import type { StockMovementCreateInput, StockMovementUpdateInput } from './stock_movements.types';

/**
 * Stock Movement Mapper
 * Handles XML building for POST (create) and PATCH (update) operations
 */

// ─── Conversion Helpers ────────────────────────────────────────────────────────

const toStr = (v: string | number | undefined | null): string =>
  v != null ? String(v) : '';

const toInt = (v: number | undefined): string =>
  v != null ? String(v) : '';

const toPrice = (v: number | undefined): string =>
  v != null ? v.toFixed(6) : '';

const toDate = (v: string | undefined): string =>
  v ?? '';

// ─── POST: Create Stock Movement ───────────────────────────────────────────────

/**
 * Constructs the XML body for POST /api/stock_movements
 * Includes all required and optional fields based on input data
 */
export function buildStockMovementPostXml(data: StockMovementCreateInput): string {
  const productNameXml = data.product_name 
    ? buildLangField('product_name', data.product_name)
    : '<product_name></product_name>';

  return `<?xml version="1.0" encoding="UTF-8"?>
<prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
  <stock_mvt>
    <id_product>${toStr(data.id_product)}</id_product>
    <id_product_attribute>${toStr(data.id_product_attribute)}</id_product_attribute>
    <id_warehouse>${toStr(data.id_warehouse)}</id_warehouse>
    <id_currency>${toStr(data.id_currency)}</id_currency>
    <management_type>${toStr(data.management_type)}</management_type>
    <id_employee>${toStr(data.id_employee)}</id_employee>
    <id_stock>${toStr(data.id_stock)}</id_stock>
    <id_stock_mvt_reason>${toStr(data.id_stock_mvt_reason)}</id_stock_mvt_reason>
    <id_order>${toStr(data.id_order ?? '')}</id_order>
    <id_supply_order>${toStr(data.id_supply_order ?? '')}</id_supply_order>
    ${productNameXml}
    <ean13>${toStr(data.ean13)}</ean13>
    <upc>${toStr(data.upc)}</upc>
    <reference>${toStr(data.reference)}</reference>
    <mpn>${toStr(data.mpn)}</mpn>
    <physical_quantity>${toInt(data.physical_quantity)}</physical_quantity>
    <sign>${toInt(data.sign)}</sign>
    <last_wa>${toPrice(data.last_wa)}</last_wa>
    <current_wa>${toPrice(data.current_wa)}</current_wa>
    <price_te>${toPrice(data.price_te)}</price_te>
    <date_add>${toDate(data.date_add)}</date_add>
  </stock_mvt>
</prestashop>`;
}

// ─── PATCH: Update Stock Movement (Partial) ────────────────────────────────────

/**
 * Constructs the XML body for PATCH /api/stock_movements/{id}
 * Only includes fields that are defined in the update data (minimal XML approach)
 * Undefined fields are omitted to preserve existing data
 */
export function buildStockMovementPatchXml(
  id: number,
  data: Partial<StockMovementUpdateInput>
): string {
  const lines: string[] = [];

  lines.push(`    <id>${id}</id>`);

  // Add only defined fields
  if (data.id_product !== undefined) {
    lines.push(`    <id_product>${toStr(data.id_product)}</id_product>`);
  }

  if (data.id_product_attribute !== undefined) {
    lines.push(`    <id_product_attribute>${toStr(data.id_product_attribute)}</id_product_attribute>`);
  }

  if (data.id_warehouse !== undefined) {
    lines.push(`    <id_warehouse>${toStr(data.id_warehouse)}</id_warehouse>`);
  }

  if (data.id_currency !== undefined) {
    lines.push(`    <id_currency>${toStr(data.id_currency)}</id_currency>`);
  }

  if (data.management_type !== undefined) {
    lines.push(`    <management_type>${toStr(data.management_type)}</management_type>`);
  }

  if (data.id_employee !== undefined) {
    lines.push(`    <id_employee>${toStr(data.id_employee)}</id_employee>`);
  }

  if (data.id_stock !== undefined) {
    lines.push(`    <id_stock>${toStr(data.id_stock)}</id_stock>`);
  }

  if (data.id_stock_mvt_reason !== undefined) {
    lines.push(`    <id_stock_mvt_reason>${toStr(data.id_stock_mvt_reason)}</id_stock_mvt_reason>`);
  }

  if (data.id_order !== undefined) {
    lines.push(`    <id_order>${toStr(data.id_order ?? '')}</id_order>`);
  }

  if (data.id_supply_order !== undefined) {
    lines.push(`    <id_supply_order>${toStr(data.id_supply_order ?? '')}</id_supply_order>`);
  }

  if (data.product_name !== undefined) {
    const productNameXml = buildLangField('product_name', data.product_name).replace(/^/gm, '    ');
    lines.push(productNameXml);
  }

  if (data.ean13 !== undefined) {
    lines.push(`    <ean13>${toStr(data.ean13)}</ean13>`);
  }

  if (data.upc !== undefined) {
    lines.push(`    <upc>${toStr(data.upc)}</upc>`);
  }

  if (data.reference !== undefined) {
    lines.push(`    <reference>${toStr(data.reference)}</reference>`);
  }

  if (data.mpn !== undefined) {
    lines.push(`    <mpn>${toStr(data.mpn)}</mpn>`);
  }

  if (data.physical_quantity !== undefined) {
    lines.push(`    <physical_quantity>${toInt(data.physical_quantity)}</physical_quantity>`);
  }

  if (data.sign !== undefined) {
    lines.push(`    <sign>${toInt(data.sign)}</sign>`);
  }

  if (data.last_wa !== undefined) {
    lines.push(`    <last_wa>${toPrice(data.last_wa)}</last_wa>`);
  }

  if (data.current_wa !== undefined) {
    lines.push(`    <current_wa>${toPrice(data.current_wa)}</current_wa>`);
  }

  if (data.price_te !== undefined) {
    lines.push(`    <price_te>${toPrice(data.price_te)}</price_te>`);
  }

  if (data.date_add !== undefined) {
    lines.push(`    <date_add>${toDate(data.date_add)}</date_add>`);
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
  <stock_mvt>
${lines.join('\n')}
  </stock_mvt>
</prestashop>`;
}
