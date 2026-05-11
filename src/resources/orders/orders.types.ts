// ─── Sous-type : ligne de commande ───────────────────────────────────────────

/** Champs requis pour ajouter une ligne (les readOnly sont exclus) */
export interface OrderRowInput {
  product_id: number;               // required, xlink vers /api/products/
  product_attribute_id: number;     // required (0 si pas de combinaison)
  product_quantity: number;         // required
  id_customization?: number;        // optionnel
  // product_name, product_reference, product_ean13, product_isbn,
  // product_upc, product_price, unit_price_tax_incl, unit_price_tax_excl
  // → readOnly, jamais envoyés
}

// ─── Création (POST) ──────────────────────────────────────────────────────────

export interface OrderCreateInput {
  // Champs required (isUnsignedId)
  id_address_delivery: number;
  id_address_invoice: number;
  id_cart: number;
  id_currency: number;
  id_lang: number;
  id_customer: number;
  id_carrier: number;

  // required string
  module: string;           // format: isModuleName  ex: "ps_checkpayment"
  payment: string;          // format: isGenericName  ex: "Chèque"

  // required prices
  total_paid: number;       // format: isPrice
  total_paid_real: number;  // format: isPrice
  total_products: number;   // format: isPrice
  total_products_wt: number;// format: isPrice

  // required float
  conversion_rate: number;  // ex: 1.0

  // Optionnels
  current_state?: number;             // format: isUnsignedId
  invoice_number?: string;
  invoice_date?: string;              // format: YYYY-MM-DD HH:MM:SS
  delivery_number?: string;
  delivery_date?: string;
  valid?: boolean;                    // format: isBool
  date_add?: string;                  // format: isDate
  date_upd?: string;                  // format: isDate
  shipping_number?: string;           // notFilterable
  note?: string;                      // maxSize: 4194303
  id_shop_group?: number;
  id_shop?: number;
  secure_key?: string;                // format: isMd5
  recyclable?: boolean;               // format: isBool
  gift?: boolean;                     // format: isBool
  gift_message?: string;              // maxSize: 4194303, isCleanHtml
  mobile_theme?: boolean;             // format: isBool
  total_discounts?: number;           // format: isPrice
  total_discounts_tax_incl?: number;
  total_discounts_tax_excl?: number;
  total_paid_tax_incl?: number;
  total_paid_tax_excl?: number;
  total_shipping?: number;
  total_shipping_tax_incl?: number;
  total_shipping_tax_excl?: number;
  carrier_tax_rate?: number;          // format: isFloat
  total_wrapping?: number;
  total_wrapping_tax_incl?: number;
  total_wrapping_tax_excl?: number;
  round_mode?: number;                // format: isUnsignedId
  round_type?: number;                // format: isUnsignedId
  reference?: string;

  // Associations
  order_rows?: OrderRowInput[];
}

// ─── Mise à jour (PATCH) ──────────────────────────────────────────────────────

/** Uniquement les champs modifiables (non readOnly) */
export type OrderUpdateInput = Omit<
  OrderCreateInput,
  'id_cart' // id_cart n'est généralement pas modifiable après création
>;

// ─── Sous-type : ligne de commande (sortie) ───────────────────────────────────

export interface OrderRowOutput {
  id: number;
  product_id: number;
  product_attribute_id: number;
  product_quantity: number;
  product_name: string;         // readOnly, rempli par PS
  product_reference: string;    // readOnly
  product_ean13: string;        // readOnly
  product_isbn: string;         // readOnly
  product_upc: string;          // readOnly
  product_price: number;        // readOnly
  id_customization: number;
  unit_price_tax_incl: number;  // readOnly
  unit_price_tax_excl: number;  // readOnly
}

// ─── GET item ─────────────────────────────────────────────────────────────────

export interface OrderOutput {
  id: number;
  id_address_delivery: number;
  id_address_invoice: number;
  id_cart: number;
  id_currency: number;
  id_lang: number;
  id_customer: number;
  id_carrier: number;
  current_state: number | null;
  module: string;
  invoice_number: string;
  invoice_date: string;
  delivery_number: string;
  delivery_date: string;
  valid: boolean;
  date_add: string;
  date_upd: string;
  shipping_number: string;
  note: string;
  id_shop_group: number | null;
  id_shop: number | null;
  secure_key: string;
  payment: string;
  recyclable: boolean;
  gift: boolean;
  gift_message: string;
  mobile_theme: boolean;
  total_discounts: number;
  total_discounts_tax_incl: number;
  total_discounts_tax_excl: number;
  total_paid: number;
  total_paid_tax_incl: number;
  total_paid_tax_excl: number;
  total_paid_real: number;
  total_products: number;
  total_products_wt: number;
  total_shipping: number;
  total_shipping_tax_incl: number;
  total_shipping_tax_excl: number;
  carrier_tax_rate: number;
  total_wrapping: number;
  total_wrapping_tax_incl: number;
  total_wrapping_tax_excl: number;
  round_mode: number;
  round_type: number;
  conversion_rate: number;
  reference: string;
  order_rows: OrderRowOutput[];
}

// ─── GET liste ────────────────────────────────────────────────────────────────

/** Résultat d'un listing sans display=full */
export interface OrderListItem {
  id: number;
  href: string;
}