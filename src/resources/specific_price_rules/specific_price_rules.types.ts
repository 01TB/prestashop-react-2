export interface SpecificPriceRuleCreateInput {
  id_shop: number;
  id_country: number;
  id_currency: number;
  id_group: number;
  name: string;
  from_quantity: number;
  price: number;
  reduction: number;
  reduction_tax: boolean;
  reduction_type: string;
  from?: string;
  to?: string;
}

export type SpecificPriceRuleUpdateInput = SpecificPriceRuleCreateInput;

export interface SpecificPriceRuleOutput {
  id: number;
  id_shop: number;
  id_country: number;
  id_currency: number;
  id_group: number;
  name: string;
  from_quantity: number;
  price: number;
  reduction: number;
  reduction_tax: boolean;
  reduction_type: string;
  from: string;
  to: string;
}

export interface SpecificPriceRuleListItem {
  id: number;
  href: string;
}
