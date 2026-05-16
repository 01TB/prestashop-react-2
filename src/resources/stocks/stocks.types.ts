// ─── Création (POST) ──────────────────────────────────────────────────────────

export interface StockCreateInput {
  // Champs requis
  id_warehouse: number;           // format: isUnsignedId
  id_product: number;             // format: isUnsignedId
  id_product_attribute: number;   // format: isUnsignedId
  physical_quantity: number;      // format: isUnsignedInt
  usable_quantity: number;        // format: isInt
  price_te: number;               // format: isPrice

  // Champs optionnels (références)
  reference?: string;             // format: isReference
  ean13?: string;                 // format: isEan13
  isbn?: string;                  // format: isIsbn
  upc?: string;                   // format: isUpc
  mpn?: string;                   // format: isMpn

  // ⚠️ "real_quantity" est absent du schema blank et en readOnly dans le synopsis.
  // Il ne doit JAMAIS être envoyé lors d'un POST ou PATCH.
}

// ─── Mise à jour (PATCH) ──────────────────────────────────────────────────────

/** Tous les champs modifiables d'un stock */
export type StockUpdateInput = StockCreateInput;


// ─── Lecture (GET item et display=full) ───────────────────────────────────────

export interface StockOutput {
  id: number;
  id_warehouse: number;
  id_product: number;
  id_product_attribute: number;
  reference: string;
  ean13: string;
  isbn: string;
  upc: string;
  mpn: string;
  physical_quantity: number;
  usable_quantity: number;
  price_te: number;
  
  // Champs readOnly inclus par PrestaShop dans la réponse GET
  real_quantity: number;
}


// ─── Listing (GET liste sans display=full) ────────────────────────────────────

/** Résultat d'un listing classique (juste les IDs et hrefs) */
export interface StockListItem {
  id: number;
  href: string;
}