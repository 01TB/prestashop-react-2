export interface OrderInvoiceCreateInput {
	id_order: number;
	number: number;
	delivery_number?: number;
	delivery_date?: string;
	total_discount_tax_excl?: number;
	total_discount_tax_incl?: number;
	total_paid_tax_excl?: number;
	total_paid_tax_incl?: number;
	total_products?: number;
	total_products_wt?: number;
	total_shipping_tax_excl?: number;
	total_shipping_tax_incl?: number;
	shipping_tax_computation_method?: number;
	total_wrapping_tax_excl?: number;
	total_wrapping_tax_incl?: number;
	shop_address?: string;
	note?: string;
	date_add?: string;
}

export type OrderInvoiceUpdateInput = OrderInvoiceCreateInput;

export interface OrderInvoiceOutput {
	id: number;
	id_order: number;
	number: number;
	delivery_number: number | null;
	delivery_date: string;
	total_discount_tax_excl: number;
	total_discount_tax_incl: number;
	total_paid_tax_excl: number;
	total_paid_tax_incl: number;
	total_products: number;
	total_products_wt: number;
	total_shipping_tax_excl: number;
	total_shipping_tax_incl: number;
	shipping_tax_computation_method: number | null;
	total_wrapping_tax_excl: number;
	total_wrapping_tax_incl: number;
	shop_address: string;
	note: string;
	date_add: string;
}

export interface OrderInvoiceListItem {
	id: number;
	href: string;
}
