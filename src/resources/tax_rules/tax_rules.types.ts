export interface TaxRuleCreateInput {
	id_tax_rules_group: number;
	id_state?: number;
	id_country: number;
	zipcode_from?: string;
	zipcode_to?: string;
	id_tax: number;
	behavior?: number;
	description?: string;
}

export type TaxRuleUpdateInput = TaxRuleCreateInput;

export interface TaxRuleOutput {
	id: number;
	id_tax_rules_group: number;
	id_state: number;
	id_country: number;
	zipcode_from: string;
	zipcode_to: string;
	id_tax: number;
	behavior: number;
	description: string;
}

export interface TaxRuleListItem {
	id: number;
	href: string;
}
