// ─── Création (POST) ──────────────────────────────────────────────────────────

export interface StockAvailableCreateInput {
  // Required fields (isUnsignedId)
  id_product: number;               // required
  id_product_attribute: number;     // required

  // Required fields (other)
  quantity: number;                 // required, isInt
  depends_on_stock: boolean;        // required, isBool
  out_of_stock: number;             // required, isInt

  // Optional fields
  id_shop?: number;                 // isUnsignedId
  id_shop_group?: number;           // isUnsignedId
  location?: string;                // maxSize:255, isString
}

// ─── Mise à jour (PATCH) ──────────────────────────────────────────────────────

/** Pour le PATCH, tous les champs modifiables sont optionnels */
export type StockAvailableUpdateInput = Partial<StockAvailableCreateInput>;

// ─── GET item (output) ───────────────────────────────────────────────────────

export interface StockAvailableOutput {
  id: number;
  id_product: number;
  id_product_attribute: number;
  id_shop: number | null;
  id_shop_group: number | null;
  quantity: number;
  depends_on_stock: boolean;
  out_of_stock: number;
  location: string;
}
