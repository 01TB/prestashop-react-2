import type { LangMap } from '../../utils/xml-utils';

/**
 * Stock Movement Input Types
 * Based on PrestaShop stock_movements schema
 */

/** Field for multilingual product_name */
export type ProductNameMap = LangMap;

/**
 * Input type for creating a stock movement (POST)
 * Required fields: id_employee, id_stock, id_stock_mvt_reason, physical_quantity, sign, price_te, date_add
 */
export interface StockMovementCreateInput {
  // Required fields (from synopsis schema)
  id_employee: number;              // required, isUnsignedId
  id_stock: number;                 // required, isUnsignedId
  id_stock_mvt_reason: number;      // required, isUnsignedId
  physical_quantity: number;        // required, isUnsignedInt
  sign: number;                     // required, isInt (typically +1 or -1)
  price_te: number;                 // required, isPrice
  date_add: string;                 // required, isDate (YYYY-MM-DD HH:MM:SS)

  // Optional fields
  id_product?: number;
  id_product_attribute?: number;
  id_warehouse?: number;
  id_currency?: number;
  management_type?: string;
  id_order?: number;
  id_supply_order?: number;
  product_name?: ProductNameMap;
  ean13?: string;
  upc?: string;
  reference?: string;
  mpn?: string;
  last_wa?: number;
  current_wa?: number;
}

/**
 * Update type for stock movement (PATCH)
 * All fields of StockMovementCreateInput are patchable
 */
export type StockMovementUpdateInput = StockMovementCreateInput;

/**
 * Output type for reading a stock movement (GET)
 * Includes all fields plus readOnly id
 */
export interface StockMovement extends StockMovementCreateInput {
  id: number;
}

/**
 * Output type for listing stock movements
 */
export interface StockMovementListItem {
  id: number;
  xlink?: string; // xlink:href attribute
}
