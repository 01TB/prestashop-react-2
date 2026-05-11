import type { LangMap } from '../../utils/xml-utils';

export interface ProductOptionValueAssoc {
  id: number;
}

export interface ProductOptionCreateInput {
  is_color_group?: boolean;
  group_type: string;
  position?: number;
  name: LangMap;
  public_name: LangMap;
  product_option_values?: ProductOptionValueAssoc[];
}

export type ProductOptionUpdateInput = ProductOptionCreateInput;

export interface ProductOptionOutput {
  id: number;
  is_color_group: boolean;
  group_type: string;
  position: number;
  name: LangMap;
  public_name: LangMap;
  product_option_values: number[];
}

export interface ProductOptionListItem {
  id: number;
  href: string;
}
