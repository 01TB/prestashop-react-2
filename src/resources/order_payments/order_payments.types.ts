export interface OrderPaymentCreateInput {
	order_reference?: string;
	id_currency: number;
	amount: number;
	payment_method?: string;
	conversion_rate?: number;
	transaction_id?: string;
	card_number?: string;
	card_brand?: string;
	card_expiration?: string;
	card_holder?: string;
	date_add?: string;
	id_employee?: number;
}

export type OrderPaymentUpdateInput = OrderPaymentCreateInput;

export interface OrderPaymentOutput {
	id: number;
	order_reference: string;
	id_currency: number;
	amount: number;
	payment_method: string;
	conversion_rate: number;
	transaction_id: string;
	card_number: string;
	card_brand: string;
	card_expiration: string;
	card_holder: string;
	date_add: string;
	id_employee: number | null;
}

export interface OrderPaymentListItem {
	id: number;
	href: string;
}
