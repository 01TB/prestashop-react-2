export interface TaxRuleGroupCreateInput {
	name: string;
	active?: boolean;
	deleted?: boolean;
	date_add?: string;
	date_upd?: string;
}

export type TaxRuleGroupUpdateInput = TaxRuleGroupCreateInput;

export interface TaxRuleGroupOutput {
	id: number;
	name: string;
	active: boolean;
	deleted: boolean;
	date_add: string;
	date_upd: string;
}

export interface TaxRuleGroupListItem {
	id: number;
	href: string;
}
