/* eslint-disable @typescript-eslint/no-explicit-any */
import { buildLangField, type LangMap } from '../../utils/xml-utils';
import type {
  ProductCreateInput, ProductUpdateInput,
  AssocId, ProductFeatureAssoc, ProductBundleAssoc, StockAvailableAssoc
} from './products.types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const toStr   = (v: string | number | undefined | null): string => v != null ? String(v) : '';
const toBool  = (v: boolean | undefined): string => v === true ? '1' : v === false ? '0' : '';
const toPrice = (v: number | undefined): string => v != null ? v.toFixed(6) : '';
const toFloat = (v: number | undefined): string => v != null ? String(v) : '';

// ─── Builders d'associations ──────────────────────────────────────────────────

const buildAssocIds = (tag: string, nodeTag: string, items?: AssocId[]): string => {
  if (!items?.length) return `<${tag}></${tag}>`;
  const rows = items.map(i => `
        <${nodeTag}>
          <id><![CDATA[${i.id}]]></id>
        </${nodeTag}>`).join('');
  return `<${tag}>${rows}\n      </${tag}>`;
};

const buildProductFeatures = (items?: ProductFeatureAssoc[]): string => {
  if (!items?.length) return `<product_features></product_features>`;
  const rows = items.map(i => `
        <product_feature>
          <id><![CDATA[${i.id}]]></id>
          <id_feature_value><![CDATA[${i.id_feature_value}]]></id_feature_value>
        </product_feature>`).join('');
  return `<product_features>${rows}\n      </product_features>`;
};

const buildStockAvailables = (items?: StockAvailableAssoc[]): string => {
  if (!items?.length) return `<stock_availables></stock_availables>`;
  const rows = items.map(i => `
        <stock_available>
          <id><![CDATA[${i.id}]]></id>
          <id_product_attribute><![CDATA[${i.id_product_attribute}]]></id_product_attribute>
        </stock_available>`).join('');
  return `<stock_availables>${rows}\n      </stock_availables>`;
};

const buildProductBundle = (items?: ProductBundleAssoc[]): string => {
  if (!items?.length) return `<product_bundle></product_bundle>`;
  const rows = items.map(i => `
        <product>
          <id><![CDATA[${i.id}]]></id>
          <id_product_attribute><![CDATA[${toStr(i.id_product_attribute ?? 0)}]]></id_product_attribute>
          <quantity><![CDATA[${toStr(i.quantity ?? 1)}]]></quantity>
        </product>`).join('');
  return `<product_bundle>${rows}\n      </product_bundle>`;
};

// ─── POST : création ──────────────────────────────────────────────────────────

/**
 * Construit le XML body pour POST /api/products
 *
 * Points d'attention :
 * - Les champs readOnly (manufacturer_name, quantity) sont ABSENTS du blank schema
 *   → on ne les inclut pas du tout dans le XML.
 * - Les champs multilingues utilisent buildLangField().
 * - Les associations "liste d'IDs" utilisent les builders dédiés.
 * - id_default_image, id_default_combination, position_in_category
 *   sont notFilterable → on les laisse vides (PS les gère).
 */
export function buildProductPostXml(data: ProductCreateInput): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
  <product>
    <id><![CDATA[]]></id>
    <id_manufacturer><![CDATA[${toStr(data.id_manufacturer ?? '')}]]></id_manufacturer>
    <id_supplier><![CDATA[${toStr(data.id_supplier ?? '')}]]></id_supplier>
    <id_category_default><![CDATA[${toStr(data.id_category_default ?? '')}]]></id_category_default>
    <new><![CDATA[${toStr(data.new ?? '')}]]></new>
    <cache_default_attribute><![CDATA[]]></cache_default_attribute>
    <id_default_image><![CDATA[]]></id_default_image>
    <id_default_combination><![CDATA[]]></id_default_combination>
    <id_tax_rules_group><![CDATA[${toStr(data.id_tax_rules_group ?? '')}]]></id_tax_rules_group>
    <position_in_category><![CDATA[]]></position_in_category>
    <type><![CDATA[${toStr(data.product_type ?? '')}]]></type>
    <id_shop_default><![CDATA[${toStr(data.id_shop_default ?? '')}]]></id_shop_default>
    <reference><![CDATA[${toStr(data.reference ?? '')}]]></reference>
    <supplier_reference><![CDATA[${toStr(data.supplier_reference ?? '')}]]></supplier_reference>
    <location><![CDATA[${toStr(data.location ?? '')}]]></location>
    <width><![CDATA[${toFloat(data.width)}]]></width>
    <height><![CDATA[${toFloat(data.height)}]]></height>
    <depth><![CDATA[${toFloat(data.depth)}]]></depth>
    <weight><![CDATA[${toFloat(data.weight)}]]></weight>
    <quantity_discount><![CDATA[${toBool(data.quantity_discount)}]]></quantity_discount>
    <ean13><![CDATA[${toStr(data.ean13 ?? '')}]]></ean13>
    <isbn><![CDATA[${toStr(data.isbn ?? '')}]]></isbn>
    <upc><![CDATA[${toStr(data.upc ?? '')}]]></upc>
    <mpn><![CDATA[${toStr(data.mpn ?? '')}]]></mpn>
    <cache_is_pack><![CDATA[${toBool(data.cache_is_pack)}]]></cache_is_pack>
    <cache_has_attachments><![CDATA[${toBool(data.cache_has_attachments)}]]></cache_has_attachments>
    <is_virtual><![CDATA[${toBool(data.is_virtual)}]]></is_virtual>
    <state><![CDATA[${toStr(data.state ?? '')}]]></state>
    <additional_delivery_times><![CDATA[${toStr(data.additional_delivery_times ?? '')}]]></additional_delivery_times>
    ${buildLangField('delivery_in_stock', data.delivery_in_stock)}
    ${buildLangField('delivery_out_stock', data.delivery_out_stock)}
    <product_type><![CDATA[${toStr(data.product_type ?? '')}]]></product_type>
    <on_sale><![CDATA[${toBool(data.on_sale)}]]></on_sale>
    <online_only><![CDATA[${toBool(data.online_only)}]]></online_only>
    <ecotax><![CDATA[${toPrice(data.ecotax)}]]></ecotax>
    <minimal_quantity><![CDATA[${toStr(data.minimal_quantity ?? '')}]]></minimal_quantity>
    <low_stock_threshold><![CDATA[${toStr(data.low_stock_threshold ?? '')}]]></low_stock_threshold>
    <low_stock_alert><![CDATA[${toBool(data.low_stock_alert)}]]></low_stock_alert>
    <price><![CDATA[${toPrice(data.price)}]]></price>
    <wholesale_price><![CDATA[${toPrice(data.wholesale_price)}]]></wholesale_price>
    <unity><![CDATA[${toStr(data.unity ?? '')}]]></unity>
    <unit_price><![CDATA[${toPrice(data.unit_price)}]]></unit_price>
    <unit_price_ratio><![CDATA[${toStr(data.unit_price_ratio ?? '')}]]></unit_price_ratio>
    <additional_shipping_cost><![CDATA[${toPrice(data.additional_shipping_cost)}]]></additional_shipping_cost>
    <customizable><![CDATA[${toStr(data.customizable ?? '')}]]></customizable>
    <text_fields><![CDATA[${toStr(data.text_fields ?? '')}]]></text_fields>
    <uploadable_files><![CDATA[${toStr(data.uploadable_files ?? '')}]]></uploadable_files>
    <active><![CDATA[${toBool(data.active)}]]></active>
    <redirect_type><![CDATA[${toStr(data.redirect_type ?? '')}]]></redirect_type>
    <id_type_redirected><![CDATA[${toStr(data.id_type_redirected ?? '')}]]></id_type_redirected>
    <available_for_order><![CDATA[${toBool(data.available_for_order)}]]></available_for_order>
    <available_date><![CDATA[${toStr(data.available_date ?? '')}]]></available_date>
    <show_condition><![CDATA[${toBool(data.show_condition)}]]></show_condition>
    <condition><![CDATA[${toStr(data.condition ?? '')}]]></condition>
    <show_price><![CDATA[${toBool(data.show_price)}]]></show_price>
    <indexed><![CDATA[${toBool(data.indexed)}]]></indexed>
    <visibility><![CDATA[${toStr(data.visibility ?? '')}]]></visibility>
    <advanced_stock_management><![CDATA[${toBool(data.advanced_stock_management)}]]></advanced_stock_management>
    <date_add><![CDATA[${toStr(data.date_add ?? '')}]]></date_add>
    <date_upd><![CDATA[${toStr(data.date_upd ?? '')}]]></date_upd>
    <pack_stock_type><![CDATA[${toStr(data.pack_stock_type ?? '')}]]></pack_stock_type>
    ${buildLangField('meta_description', data.meta_description)}
    ${buildLangField('meta_keywords', data.meta_keywords)}
    ${buildLangField('meta_title', data.meta_title)}
    ${buildLangField('link_rewrite', data.link_rewrite)}
    ${buildLangField('name', data.name)}
    ${buildLangField('description', data.description)}
    ${buildLangField('description_short', data.description_short)}
    ${buildLangField('available_now', data.available_now)}
    ${buildLangField('available_later', data.available_later)}
    <associations>
      ${buildAssocIds('categories', 'category', data.categories)}
      ${buildAssocIds('images', 'image', data.images)}
      ${buildAssocIds('combinations', 'combination', data.combinations)}
      ${buildAssocIds('product_option_values', 'product_option_value', data.product_option_values)}
      ${buildProductFeatures(data.product_features)}
      ${buildAssocIds('tags', 'tag', data.tags)}
      ${buildStockAvailables(data.stock_availables)}
      ${buildAssocIds('attachments', 'attachment', data.attachments)}
      ${buildAssocIds('accessories', 'product', data.accessories)}
      ${buildProductBundle(data.product_bundle)}
    </associations>
  </product>
</prestashop>`;
}

/**
 * Construit le XML body minimal pour PATCH /api/products/{id}
 *
 * Approche XML minimal : seules les balises des champs présents dans `data`
 * sont émises. Un champ absent de `data` → absent du XML → PS le laisse intact.
 *
 * Pour les champs multilingues : si `data.name` est undefined → aucune balise
 * <name> n'est émise. Si fourni → toutes les langues passées sont mises à jour.
 *
 * Pour les associations : si `data.categories` est undefined → aucun bloc
 * <categories> n'est émis → PS laisse les catégories existantes intactes.
 */
export function buildProductPatchXml(
  id: number,
  data: Partial<ProductUpdateInput>
): string {
  const lines: string[] = [];

  // ── Helpers scalaires ─────────────────────────────────────────────────────
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

  // ── Helper multilingue : émet la balise uniquement si définie ─────────────
  const fLang = (tag: string, val: LangMap | undefined) => {
    if (val !== undefined) lines.push(`    ${buildLangField(tag, val)}`);
  };

  // ── Champs scalaires ──────────────────────────────────────────────────────
  fStr  ('id_manufacturer',            data.id_manufacturer);
  fStr  ('id_supplier',                data.id_supplier);
  fStr  ('id_category_default',        data.id_category_default);
  fStr  ('new',                        data.new);
  fStr  ('id_tax_rules_group',         data.id_tax_rules_group);
  fStr  ('type',                       data.product_type);
  fStr  ('id_shop_default',            data.id_shop_default);
  fStr  ('reference',                  data.reference);
  fStr  ('supplier_reference',         data.supplier_reference);
  fStr  ('location',                   data.location);
  fFloat('width',                      data.width);
  fFloat('height',                     data.height);
  fFloat('depth',                      data.depth);
  fFloat('weight',                     data.weight);
  fBool ('quantity_discount',          data.quantity_discount);
  fStr  ('ean13',                      data.ean13);
  fStr  ('isbn',                       data.isbn);
  fStr  ('upc',                        data.upc);
  fStr  ('mpn',                        data.mpn);
  fBool ('cache_is_pack',              data.cache_is_pack);
  fBool ('cache_has_attachments',      data.cache_has_attachments);
  fBool ('is_virtual',                 data.is_virtual);
  fStr  ('state',                      data.state);
  fStr  ('additional_delivery_times',  data.additional_delivery_times);
  fStr  ('product_type',               data.product_type);
  fBool ('on_sale',                    data.on_sale);
  fBool ('online_only',                data.online_only);
  fPrice('ecotax',                     data.ecotax);
  fStr  ('minimal_quantity',           data.minimal_quantity);
  fStr  ('low_stock_threshold',        data.low_stock_threshold);
  fBool ('low_stock_alert',            data.low_stock_alert);
  fPrice('price',                      data.price);
  fPrice('wholesale_price',            data.wholesale_price);
  fStr  ('unity',                      data.unity);
  fPrice('unit_price',                 data.unit_price);
  fStr  ('unit_price_ratio',           data.unit_price_ratio);
  fPrice('additional_shipping_cost',   data.additional_shipping_cost);
  fStr  ('customizable',               data.customizable);
  fStr  ('text_fields',                data.text_fields);
  fStr  ('uploadable_files',           data.uploadable_files);
  fBool ('active',                     data.active);
  fStr  ('redirect_type',              data.redirect_type);
  fStr  ('id_type_redirected',         data.id_type_redirected);
  fBool ('available_for_order',        data.available_for_order);
  fStr  ('available_date',             data.available_date);
  fBool ('show_condition',             data.show_condition);
  fStr  ('condition',                  data.condition);
  fBool ('show_price',                 data.show_price);
  fBool ('indexed',                    data.indexed);
  fStr  ('visibility',                 data.visibility);
  fBool ('advanced_stock_management',  data.advanced_stock_management);
  fStr  ('date_add',                   data.date_add);
  fStr  ('date_upd',                   data.date_upd);
  fStr  ('pack_stock_type',            data.pack_stock_type);

  // ── Champs multilingues ───────────────────────────────────────────────────
  fLang('delivery_in_stock',   data.delivery_in_stock);
  fLang('delivery_out_stock',  data.delivery_out_stock);
  fLang('meta_description',    data.meta_description);
  fLang('meta_keywords',       data.meta_keywords);
  fLang('meta_title',          data.meta_title);
  fLang('link_rewrite',        data.link_rewrite);
  fLang('name',                data.name);
  fLang('description',         data.description);
  fLang('description_short',   data.description_short);
  fLang('available_now',       data.available_now);
  fLang('available_later',     data.available_later);

  // ── Associations (bloc <associations> omis si aucune n'est définie) ───────
  const assocLines: string[] = [];
  if (data.categories !== undefined)
    assocLines.push(`      ${buildAssocIds('categories', 'category', data.categories)}`);
  if (data.images !== undefined)
    assocLines.push(`      ${buildAssocIds('images', 'image', data.images)}`);
  if (data.combinations !== undefined)
    assocLines.push(`      ${buildAssocIds('combinations', 'combination', data.combinations)}`);
  if (data.product_option_values !== undefined)
    assocLines.push(`      ${buildAssocIds('product_option_values', 'product_option_value', data.product_option_values)}`);
  if (data.product_features !== undefined)
    assocLines.push(`      ${buildProductFeatures(data.product_features)}`);
  if (data.tags !== undefined)
    assocLines.push(`      ${buildAssocIds('tags', 'tag', data.tags)}`);
  if (data.stock_availables !== undefined)
    assocLines.push(`      ${buildStockAvailables(data.stock_availables)}`);
  if (data.attachments !== undefined)
    assocLines.push(`      ${buildAssocIds('attachments', 'attachment', data.attachments)}`);
  if (data.accessories !== undefined)
    assocLines.push(`      ${buildAssocIds('accessories', 'product', data.accessories)}`);
  if (data.product_bundle !== undefined)
    assocLines.push(`      ${buildProductBundle(data.product_bundle)}`);

  const assocXml = assocLines.length > 0
    ? `\n    <associations>\n${assocLines.join('\n')}\n    </associations>`
    : '';

  return `<?xml version="1.0" encoding="UTF-8"?>
<prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
  <product>
    <id><![CDATA[${id}]]></id>
${lines.join('\n')}${assocXml}
  </product>
</prestashop>`;
}