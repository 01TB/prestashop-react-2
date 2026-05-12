import type { LangMap } from '../../utils/xml-utils';

export interface TaxCreateInput {
	rate: number;
	active?: boolean;
	deleted?: boolean;
	name: LangMap;
}

export type TaxUpdateInput = TaxCreateInput;

export interface TaxOutput {
	id: number;
	rate: number;
	active: boolean;
	deleted: boolean;
	name: LangMap;
}

export interface TaxListItem {
	id: number;
	href: string;
}
