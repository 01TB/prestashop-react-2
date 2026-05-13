// ─── Création (POST) ──────────────────────────────────────────────────────────

export interface SpecificPriceCreateInput {
  // Required fields (isUnsignedId)
  id_shop: number;                  // required
  id_cart: number;                  // required
  id_product: number;               // required
  id_currency: number;              // required
  id_country: number;               // required
  id_group: number;                 // required
  id_customer: number;              // required

  // Required fields (other)
  price: number;                    // required, isNegativePrice
  from_quantity: number;            // required, isUnsignedInt
  reduction: number;                // required, isPrice
  reduction_tax: boolean;           // required, isBool
  reduction_type: 'amount' | 'percentage'; // required, isReductionType
  from: string;                     // required, isDateFormat (YYYY-MM-DD HH:MM:SS)
  to: string;                       // required, isDateFormat

  // Optional fields
  id_shop_group?: number;           // isUnsignedId
  id_product_attribute?: number;    // isUnsignedId
  id_specific_price_rule?: number;  // isUnsignedId
}

// ─── Mise à jour (PATCH) ──────────────────────────────────────────────────────

/** Pour le PATCH, tous les champs modifiables sont optionnels */
export type SpecificPriceUpdateInput = Partial<SpecificPriceCreateInput>;

// ─── GET item (output) ───────────────────────────────────────────────────────

export interface SpecificPriceOutput {
  id: number;
  id_shop_group: number | null;
  id_shop: number;
  id_cart: number;
  id_product: number;
  id_product_attribute: number | null;
  id_currency: number;
  id_country: number;
  id_group: number;
  id_customer: number;
  id_specific_price_rule: number | null;
  price: number;
  from_quantity: number;
  reduction: number;
  reduction_tax: boolean;
  reduction_type: string;
  from: string;
  to: string;
}
