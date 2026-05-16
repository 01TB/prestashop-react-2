import type { StockCreateInput, StockUpdateInput } from './stocks.types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const toStr = (v: string | number | undefined | null): string =>
  v != null ? String(v) : '';

const toPrice = (v: number | undefined): string =>
  v != null ? v.toFixed(6) : '';

// ─── POST : création ──────────────────────────────────────────────────────────

/**
 * Construit le XML pour POST /api/stocks
 * Basé strictement sur le schema blank.
 * Le champ 'real_quantity' est exclu car absent du blank.
 */
export function buildStockPostXml(data: StockCreateInput): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
  <stock>
    <id><![CDATA[]]></id>
    <id_warehouse><![CDATA[${toStr(data.id_warehouse)}]]></id_warehouse>
    <id_product><![CDATA[${toStr(data.id_product)}]]></id_product>
    <id_product_attribute><![CDATA[${toStr(data.id_product_attribute)}]]></id_product_attribute>
    <reference><![CDATA[${toStr(data.reference ?? '')}]]></reference>
    <ean13><![CDATA[${toStr(data.ean13 ?? '')}]]></ean13>
    <isbn><![CDATA[${toStr(data.isbn ?? '')}]]></isbn>
    <upc><![CDATA[${toStr(data.upc ?? '')}]]></upc>
    <mpn><![CDATA[${toStr(data.mpn ?? '')}]]></mpn>
    <physical_quantity><![CDATA[${toStr(data.physical_quantity)}]]></physical_quantity>
    <usable_quantity><![CDATA[${toStr(data.usable_quantity)}]]></usable_quantity>
    <price_te><![CDATA[${toPrice(data.price_te)}]]></price_te>
  </stock>
</prestashop>`;
}

// ─── PATCH : mise à jour partielle ────────────────────────────────────────────

/**
 * Construit le XML minimal pour PATCH /api/stocks/{id}
 * Uniquement les champs présents dans `data` sont émis (approche XML minimal).
 */
export function buildStockPatchXml(
  id: number,
  data: Partial<StockUpdateInput>
): string {
  const lines: string[] = [];

  const fStr = (tag: string, val: string | number | null | undefined) => {
    if (val !== undefined) lines.push(`    <${tag}><![CDATA[${val ?? ''}]]></${tag}>`);
  };
  const fPrice = (tag: string, val: number | undefined) => {
    if (val !== undefined) lines.push(`    <${tag}><![CDATA[${val.toFixed(6)}]]></${tag}>`);
  };

  fStr('id_warehouse',         data.id_warehouse);
  fStr('id_product',           data.id_product);
  fStr('id_product_attribute', data.id_product_attribute);
  fStr('reference',            data.reference);
  fStr('ean13',                data.ean13);
  fStr('isbn',                 data.isbn);
  fStr('upc',                  data.upc);
  fStr('mpn',                  data.mpn);
  fStr('physical_quantity',    data.physical_quantity);
  fStr('usable_quantity',      data.usable_quantity);
  fPrice('price_te',           data.price_te);

  return `<?xml version="1.0" encoding="UTF-8"?>
<prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
  <stock>
    <id><![CDATA[${id}]]></id>
${lines.join('\n')}
  </stock>
</prestashop>`;
}