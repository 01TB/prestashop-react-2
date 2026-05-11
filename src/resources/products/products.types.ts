import type { LangMap } from '../../utils/xml-utils';

// ─── Associations ─────────────────────────────────────────────────────────────

/** Association simple : juste un id vers une ressource existante */
export interface AssocId {
  id: number;
}

/** Association product_feature : id + id_feature_value (les deux required) */
export interface ProductFeatureAssoc {
  id: number;              // id de la feature (required)
  id_feature_value: number; // id de la valeur (required)
}

/** Association product_bundle : produit dans un pack */
export interface ProductBundleAssoc {
  id: number;
  id_product_attribute?: number;  // 0 si pas de combinaison
  quantity?: number;
}

/** Association stock_available (readonly en pratique, géré par PS) */
export interface StockAvailableAssoc {
  id: number;
  id_product_attribute: number;   // 0 = produit sans combinaison
}

// ─── Création (POST) ──────────────────────────────────────────────────────────

export interface ProductCreateInput {
  // ── Champ required ──
  price: number;                    // required, isPrice

  // ── IDs (isUnsignedId, optionnels) ──
  id_manufacturer?: number;
  id_supplier?: number;
  id_category_default?: number;
  id_tax_rules_group?: number;
  id_shop_default?: number;
  id_type_redirected?: number;

  // ── Références (isReference, maxSize:64) ──
  reference?: string;
  supplier_reference?: string;

  // ── Dimensions/poids (isUnsignedFloat) ──
  width?: number;
  height?: number;
  depth?: number;
  weight?: number;

  // ── Codes produit ──
  ean13?: string;                   // maxSize:13, isEan13
  isbn?: string;                    // maxSize:32, isIsbn
  upc?: string;                     // maxSize:12, isUpc
  mpn?: string;                     // maxSize:40, isMpn

  // ── Booléens (isBool → "0"|"1") ──
  quantity_discount?: boolean;
  cache_is_pack?: boolean;
  cache_has_attachments?: boolean;
  is_virtual?: boolean;
  on_sale?: boolean;
  online_only?: boolean;
  low_stock_alert?: boolean;
  active?: boolean;
  available_for_order?: boolean;
  show_condition?: boolean;
  show_price?: boolean;
  indexed?: boolean;
  advanced_stock_management?: boolean;

  // ── Entiers (isUnsignedId / isUnsignedInt / isInt) ──
  state?: number;                   // isUnsignedId
  additional_delivery_times?: number; // isUnsignedId
  minimal_quantity?: number;        // isPositiveInt
  low_stock_threshold?: number;     // isInt (peut être négatif)
  customizable?: number;            // isUnsignedInt
  text_fields?: number;             // isUnsignedInt
  uploadable_files?: number;        // isUnsignedInt
  pack_stock_type?: number;         // isUnsignedInt

  // ── Prix (isPrice) ──
  ecotax?: number;
  wholesale_price?: number;
  unit_price?: number;
  additional_shipping_cost?: number;

  // ── Autres scalaires ──
  location?: string;                // maxSize:255, isString
  unity?: string;                   // isString
  unit_price_ratio?: number;
  redirect_type?: string;           // isString ('404'|'301'|'302'|'')
  available_date?: string;          // isDateFormat (YYYY-MM-DD)
  condition?: string;               // isGenericName ('new'|'used'|'refurbished')
  visibility?: 'both' | 'catalog' | 'search' | 'none'; // isProductVisibility
  product_type?: string;            // isGenericName
  date_add?: string;                // isDate
  date_upd?: string;                // isDate

  // ── Champs multilingues (LangMap) ──
  // Clé = id langue (ex: 1 pour français)
  name?: LangMap;                   // maxSize:128, isCatalogName — fortement recommandé
  description?: LangMap;            // maxSize:4194303, isCleanHtml
  description_short?: LangMap;      // maxSize:4194303, isCleanHtml
  link_rewrite?: LangMap;           // maxSize:128, isLinkRewrite — fortement recommandé
  meta_title?: LangMap;             // maxSize:255, isGenericName
  meta_description?: LangMap;       // maxSize:512, isGenericName
  meta_keywords?: LangMap;          // maxSize:255, isGenericName
  available_now?: LangMap;          // maxSize:255, isGenericName
  available_later?: LangMap;        // maxSize:255, IsGenericName
  delivery_in_stock?: LangMap;      // maxSize:255, isGenericName
  delivery_out_stock?: LangMap;     // maxSize:255, isGenericName

  // ── Associations (listes de références) ──
  categories?: AssocId[];           // catégories associées (id required)
  images?: AssocId[];               // images (en lecture, géré via /api/images)
  combinations?: AssocId[];         // combinaisons (id required)
  product_option_values?: AssocId[];// valeurs d'options (id required)
  product_features?: ProductFeatureAssoc[]; // features (id + id_feature_value required)
  tags?: AssocId[];                 // tags (id required)
  stock_availables?: StockAvailableAssoc[]; // stocks (généralement auto-géré par PS)
  attachments?: AssocId[];          // pièces jointes (id required)
  accessories?: AssocId[];          // accessoires (id required, xlink vers products)
  product_bundle?: ProductBundleAssoc[]; // produits du pack

  // ── Champs présents dans le blank mais PAS dans le synopsis ──
  // (pas de format → string libre, inclus dans le blank schema)
  new?: string;
  cache_default_attribute?: string;
  // id_default_image, id_default_combination, position_in_category
  // → notFilterable, gérés par PrestaShop, à laisser vides

  // ── JAMAIS envoyés (readOnly, absents du blank ou virtuels) ──
  // manufacturer_name → readOnly (présent dans synopsis, ABSENT du blank → ne pas inclure)
  // quantity          → readOnly (idem)
}

// ─── Mise à jour (PATCH) ──────────────────────────────────────────────────────

/** Tous les champs de ProductCreateInput sont patchables */
export type ProductUpdateInput = ProductCreateInput;

// ─── GET item ─────────────────────────────────────────────────────────────────

export interface ProductOutput {
  id: number;
  id_manufacturer: number | null;
  id_supplier: number | null;
  id_category_default: number;
  new: boolean;
  cache_default_attribute: number;
  id_default_image: number | null;
  id_default_combination: number | null;
  id_tax_rules_group: number;
  position_in_category: number;
  manufacturer_name: string;       // readOnly
  quantity: number;                // readOnly (calculé via stock)
  type: string;
  id_shop_default: number;
  reference: string;
  supplier_reference: string;
  location: string;
  width: number;
  height: number;
  depth: number;
  weight: number;
  quantity_discount: boolean;
  ean13: string;
  isbn: string;
  upc: string;
  mpn: string;
  cache_is_pack: boolean;
  cache_has_attachments: boolean;
  is_virtual: boolean;
  on_sale: boolean;
  online_only: boolean;
  ecotax: number;
  minimal_quantity: number;
  low_stock_threshold: number | null;
  low_stock_alert: boolean;
  price: number;
  wholesale_price: number;
  unity: string;
  unit_price: number;
  additional_shipping_cost: number;
  customizable: number;
  text_fields: number;
  uploadable_files: number;
  active: boolean;
  redirect_type: string;
  id_type_redirected: number | null;
  available_for_order: boolean;
  available_date: string;
  show_condition: boolean;
  condition: string;
  show_price: boolean;
  indexed: boolean;
  visibility: string;
  advanced_stock_management: boolean;
  date_add: string;
  date_upd: string;
  pack_stock_type: number;
  meta_description: LangMap;
  meta_keywords: LangMap;
  meta_title: LangMap;
  link_rewrite: LangMap;
  name: LangMap;
  description: LangMap;
  description_short: LangMap;
  available_now: LangMap;
  available_later: LangMap;
  // associations
  categories: number[];
  images: number[];
  combinations: number[];
  product_option_values: number[];
  product_features: { id: number; id_feature_value: number }[];
  tags: number[];
  stock_availables: { id: number; id_product_attribute: number }[];
  attachments: number[];
  accessories: number[];
  product_bundle: { id: number; id_product_attribute: number; quantity: number }[];
}