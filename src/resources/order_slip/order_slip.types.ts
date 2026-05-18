export interface OrderSlipDetailInput {
	id_order_detail: number;
	product_quantity: number;
	amount_tax_excl: number;
	amount_tax_incl: number;
}

export interface OrderSlipDetailOutput {
	id: number;
	id_order_detail: number;
	product_quantity: number;
	amount_tax_excl: number;
	amount_tax_incl: number;
}

export interface OrderSlipCreateInput {
	id_customer: number;
	id_order: number;
	conversion_rate: number;
	total_products_tax_excl: number;
	total_products_tax_incl: number;
	total_shipping_tax_excl: number;
	total_shipping_tax_incl: number;
	amount?: number;
	shipping_cost?: string;
	shipping_cost_amount?: number;
	partial?: string;
	order_slip_type?: number;
	order_slip_details?: OrderSlipDetailInput[];
}

export type OrderSlipUpdateInput = OrderSlipCreateInput;

export interface OrderSlipOutput {
	id: number;
	id_customer: number | null;
	id_order: number | null;
	conversion_rate: number | null;
	total_products_tax_excl: number | null;
	total_products_tax_incl: number | null;
	total_shipping_tax_excl: number | null;
	total_shipping_tax_incl: number | null;
	amount: number | null;
	shipping_cost: string;
	shipping_cost_amount: number | null;
	partial: string;
	date_add: string;
	date_upd: string;
	order_slip_type: number | null;
	order_slip_details: OrderSlipDetailOutput[];
}

export interface OrderSlipListItem {
	id: number;
	href: string;
}
