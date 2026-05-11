export interface OrderDetailTaxAssoc {
  id: number;
}

export interface OrderDetailCreateInput {
  id_order: number;
  product_id?: number;
  product_attribute_id?: number;
  product_quantity_reinjected?: number;
  group_reduction?: number;
  discount_quantity_applied?: number;
  download_hash?: string;
  download_deadline?: string;
  id_order_invoice?: number;
  id_warehouse: number;
  id_shop: number;
  id_customization?: number;
  product_name: string;
  product_quantity: number;
  product_quantity_in_stock?: number;
  product_quantity_return?: number;
  product_quantity_refunded?: number;
  product_price: number;
  reduction_percent?: number;
  reduction_amount?: number;
  reduction_amount_tax_incl?: number;
  reduction_amount_tax_excl?: number;
  product_quantity_discount?: number;
  product_ean13?: string;
  product_isbn?: string;
  product_upc?: string;
  product_mpn?: string;
  product_reference?: string;
  product_supplier_reference?: string;
  product_weight?: number;
  tax_computation_method?: number;
  id_tax_rules_group?: number;
  ecotax?: number;
  ecotax_tax_rate?: number;
  download_nb?: number;
  unit_price_tax_incl?: number;
  unit_price_tax_excl?: number;
  total_price_tax_incl?: number;
  total_price_tax_excl?: number;
  total_shipping_price_tax_excl?: number;
  total_shipping_price_tax_incl?: number;
  purchase_supplier_price?: number;
  original_product_price?: number;
  original_wholesale_price?: number;
  total_refunded_tax_excl?: number;
  total_refunded_tax_incl?: number;
  taxes?: OrderDetailTaxAssoc[];
}

export type OrderDetailUpdateInput = OrderDetailCreateInput;

export interface OrderDetailOutput {
  id: number;
  id_order: number;
  product_id: number | null;
  product_attribute_id: number | null;
  product_quantity_reinjected: number | null;
  group_reduction: number;
  discount_quantity_applied: number | null;
  download_hash: string;
  download_deadline: string;
  id_order_invoice: number | null;
  id_warehouse: number;
  id_shop: number;
  id_customization: number | null;
  product_name: string;
  product_quantity: number;
  product_quantity_in_stock: number;
  product_quantity_return: number;
  product_quantity_refunded: number;
  product_price: number;
  reduction_percent: number;
  reduction_amount: number;
  reduction_amount_tax_incl: number;
  reduction_amount_tax_excl: number;
  product_quantity_discount: number;
  product_ean13: string;
  product_isbn: string;
  product_upc: string;
  product_mpn: string;
  product_reference: string;
  product_supplier_reference: string;
  product_weight: number;
  tax_computation_method: number | null;
  id_tax_rules_group: number | null;
  ecotax: number;
  ecotax_tax_rate: number;
  download_nb: number | null;
  unit_price_tax_incl: number;
  unit_price_tax_excl: number;
  total_price_tax_incl: number;
  total_price_tax_excl: number;
  total_shipping_price_tax_excl: number;
  total_shipping_price_tax_incl: number;
  purchase_supplier_price: number;
  original_product_price: number;
  original_wholesale_price: number;
  total_refunded_tax_excl: number;
  total_refunded_tax_incl: number;
  taxes: number[];
}

export interface OrderDetailListItem {
  id: number;
  href: string;
}
