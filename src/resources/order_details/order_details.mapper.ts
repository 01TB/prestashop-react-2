import type {
  OrderDetailCreateInput,
  OrderDetailUpdateInput,
  OrderDetailTaxAssoc,
} from './order_details.types';

const toStr = (v: string | number | undefined | null): string =>
  v != null ? String(v) : '';

const toPrice = (v: number | undefined): string =>
  v != null ? v.toFixed(6) : '';

const toFloat = (v: number | undefined): string =>
  v != null ? String(v) : '';

const buildTaxes = (items?: OrderDetailTaxAssoc[]): string => {
  if (!items?.length) return '<taxes></taxes>';
  const rows = items.map(t => `
        <tax>
          <id><![CDATA[${t.id}]]></id>
        </tax>`).join('');
  return `<taxes>${rows}
      </taxes>`;
};

export function buildOrderDetailPostXml(data: OrderDetailCreateInput): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
  <order_detail>
    <id><![CDATA[]]></id>
    <id_order><![CDATA[${toStr(data.id_order)}]]></id_order>
    <product_id><![CDATA[${toStr(data.product_id ?? '')}]]></product_id>
    <product_attribute_id><![CDATA[${toStr(data.product_attribute_id ?? '')}]]></product_attribute_id>
    <product_quantity_reinjected><![CDATA[${toStr(data.product_quantity_reinjected ?? '')}]]></product_quantity_reinjected>
    <group_reduction><![CDATA[${toFloat(data.group_reduction)}]]></group_reduction>
    <discount_quantity_applied><![CDATA[${toStr(data.discount_quantity_applied ?? '')}]]></discount_quantity_applied>
    <download_hash><![CDATA[${toStr(data.download_hash ?? '')}]]></download_hash>
    <download_deadline><![CDATA[${toStr(data.download_deadline ?? '')}]]></download_deadline>
    <id_order_invoice><![CDATA[${toStr(data.id_order_invoice ?? '')}]]></id_order_invoice>
    <id_warehouse><![CDATA[${toStr(data.id_warehouse)}]]></id_warehouse>
    <id_shop><![CDATA[${toStr(data.id_shop)}]]></id_shop>
    <id_customization><![CDATA[${toStr(data.id_customization ?? '')}]]></id_customization>
    <product_name><![CDATA[${toStr(data.product_name)}]]></product_name>
    <product_quantity><![CDATA[${toStr(data.product_quantity)}]]></product_quantity>
    <product_quantity_in_stock><![CDATA[${toStr(data.product_quantity_in_stock ?? '')}]]></product_quantity_in_stock>
    <product_quantity_return><![CDATA[${toStr(data.product_quantity_return ?? '')}]]></product_quantity_return>
    <product_quantity_refunded><![CDATA[${toStr(data.product_quantity_refunded ?? '')}]]></product_quantity_refunded>
    <product_price><![CDATA[${toPrice(data.product_price)}]]></product_price>
    <reduction_percent><![CDATA[${toFloat(data.reduction_percent)}]]></reduction_percent>
    <reduction_amount><![CDATA[${toPrice(data.reduction_amount)}]]></reduction_amount>
    <reduction_amount_tax_incl><![CDATA[${toPrice(data.reduction_amount_tax_incl)}]]></reduction_amount_tax_incl>
    <reduction_amount_tax_excl><![CDATA[${toPrice(data.reduction_amount_tax_excl)}]]></reduction_amount_tax_excl>
    <product_quantity_discount><![CDATA[${toFloat(data.product_quantity_discount)}]]></product_quantity_discount>
    <product_ean13><![CDATA[${toStr(data.product_ean13 ?? '')}]]></product_ean13>
    <product_isbn><![CDATA[${toStr(data.product_isbn ?? '')}]]></product_isbn>
    <product_upc><![CDATA[${toStr(data.product_upc ?? '')}]]></product_upc>
    <product_mpn><![CDATA[${toStr(data.product_mpn ?? '')}]]></product_mpn>
    <product_reference><![CDATA[${toStr(data.product_reference ?? '')}]]></product_reference>
    <product_supplier_reference><![CDATA[${toStr(data.product_supplier_reference ?? '')}]]></product_supplier_reference>
    <product_weight><![CDATA[${toFloat(data.product_weight)}]]></product_weight>
    <tax_computation_method><![CDATA[${toStr(data.tax_computation_method ?? '')}]]></tax_computation_method>
    <id_tax_rules_group><![CDATA[${toStr(data.id_tax_rules_group ?? '')}]]></id_tax_rules_group>
    <ecotax><![CDATA[${toFloat(data.ecotax)}]]></ecotax>
    <ecotax_tax_rate><![CDATA[${toFloat(data.ecotax_tax_rate)}]]></ecotax_tax_rate>
    <download_nb><![CDATA[${toStr(data.download_nb ?? '')}]]></download_nb>
    <unit_price_tax_incl><![CDATA[${toPrice(data.unit_price_tax_incl)}]]></unit_price_tax_incl>
    <unit_price_tax_excl><![CDATA[${toPrice(data.unit_price_tax_excl)}]]></unit_price_tax_excl>
    <total_price_tax_incl><![CDATA[${toPrice(data.total_price_tax_incl)}]]></total_price_tax_incl>
    <total_price_tax_excl><![CDATA[${toPrice(data.total_price_tax_excl)}]]></total_price_tax_excl>
    <total_shipping_price_tax_excl><![CDATA[${toPrice(data.total_shipping_price_tax_excl)}]]></total_shipping_price_tax_excl>
    <total_shipping_price_tax_incl><![CDATA[${toPrice(data.total_shipping_price_tax_incl)}]]></total_shipping_price_tax_incl>
    <purchase_supplier_price><![CDATA[${toPrice(data.purchase_supplier_price)}]]></purchase_supplier_price>
    <original_product_price><![CDATA[${toPrice(data.original_product_price)}]]></original_product_price>
    <original_wholesale_price><![CDATA[${toPrice(data.original_wholesale_price)}]]></original_wholesale_price>
    <total_refunded_tax_excl><![CDATA[${toPrice(data.total_refunded_tax_excl)}]]></total_refunded_tax_excl>
    <total_refunded_tax_incl><![CDATA[${toPrice(data.total_refunded_tax_incl)}]]></total_refunded_tax_incl>
    <associations>
      ${buildTaxes(data.taxes)}
    </associations>
  </order_detail>
</prestashop>`;
}

export function buildOrderDetailPatchXml(
  id: number,
  data: Partial<OrderDetailUpdateInput>
): string {
  const lines: string[] = [];

  const fStr = (tag: string, value: string | number | null | undefined) => {
    if (value !== undefined) lines.push(`    <${tag}><![CDATA[${value ?? ''}]]></${tag}>`);
  };

  const fPrice = (tag: string, value: number | undefined) => {
    if (value !== undefined) lines.push(`    <${tag}><![CDATA[${value.toFixed(6)}]]></${tag}>`);
  };

  const fFloat = (tag: string, value: number | undefined) => {
    if (value !== undefined) lines.push(`    <${tag}><![CDATA[${value}]]></${tag}>`);
  };

  fStr('id_order', data.id_order);
  fStr('product_id', data.product_id);
  fStr('product_attribute_id', data.product_attribute_id);
  fStr('product_quantity_reinjected', data.product_quantity_reinjected);
  fFloat('group_reduction', data.group_reduction);
  fStr('discount_quantity_applied', data.discount_quantity_applied);
  fStr('download_hash', data.download_hash);
  fStr('download_deadline', data.download_deadline);
  fStr('id_order_invoice', data.id_order_invoice);
  fStr('id_warehouse', data.id_warehouse);
  fStr('id_shop', data.id_shop);
  fStr('id_customization', data.id_customization);
  fStr('product_name', data.product_name);
  fStr('product_quantity', data.product_quantity);
  fStr('product_quantity_in_stock', data.product_quantity_in_stock);
  fStr('product_quantity_return', data.product_quantity_return);
  fStr('product_quantity_refunded', data.product_quantity_refunded);
  fPrice('product_price', data.product_price);
  fFloat('reduction_percent', data.reduction_percent);
  fPrice('reduction_amount', data.reduction_amount);
  fPrice('reduction_amount_tax_incl', data.reduction_amount_tax_incl);
  fPrice('reduction_amount_tax_excl', data.reduction_amount_tax_excl);
  fFloat('product_quantity_discount', data.product_quantity_discount);
  fStr('product_ean13', data.product_ean13);
  fStr('product_isbn', data.product_isbn);
  fStr('product_upc', data.product_upc);
  fStr('product_mpn', data.product_mpn);
  fStr('product_reference', data.product_reference);
  fStr('product_supplier_reference', data.product_supplier_reference);
  fFloat('product_weight', data.product_weight);
  fStr('tax_computation_method', data.tax_computation_method);
  fStr('id_tax_rules_group', data.id_tax_rules_group);
  fFloat('ecotax', data.ecotax);
  fFloat('ecotax_tax_rate', data.ecotax_tax_rate);
  fStr('download_nb', data.download_nb);
  fPrice('unit_price_tax_incl', data.unit_price_tax_incl);
  fPrice('unit_price_tax_excl', data.unit_price_tax_excl);
  fPrice('total_price_tax_incl', data.total_price_tax_incl);
  fPrice('total_price_tax_excl', data.total_price_tax_excl);
  fPrice('total_shipping_price_tax_excl', data.total_shipping_price_tax_excl);
  fPrice('total_shipping_price_tax_incl', data.total_shipping_price_tax_incl);
  fPrice('purchase_supplier_price', data.purchase_supplier_price);
  fPrice('original_product_price', data.original_product_price);
  fPrice('original_wholesale_price', data.original_wholesale_price);
  fPrice('total_refunded_tax_excl', data.total_refunded_tax_excl);
  fPrice('total_refunded_tax_incl', data.total_refunded_tax_incl);

  const assocLines: string[] = [];
  if (data.taxes !== undefined)
    assocLines.push(`      ${buildTaxes(data.taxes)}`);

  const assocXml = assocLines.length > 0
    ? `\n    <associations>\n${assocLines.join('\n')}\n    </associations>`
    : '';

  return `<?xml version="1.0" encoding="UTF-8"?>
<prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
  <order_detail>
    <id><![CDATA[${id}]]></id>
${lines.join('\n')}${assocXml}
  </order_detail>
</prestashop>`;
}
