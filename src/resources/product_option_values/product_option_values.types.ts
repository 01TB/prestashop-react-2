import type { LangMap } from '../../utils/xml-utils';

export interface ProductOptionValueCreateInput {
  id_attribute_group: number;
  color?: string;
  position?: number;
  name: LangMap;
}

export type ProductOptionValueUpdateInput = ProductOptionValueCreateInput;

export interface ProductOptionValueOutput {
  id: number;
  id_attribute_group: number;
  color: string;
  position: number;
  name: LangMap;
}

export interface ProductOptionValueListItem {
  id: number;
  href: string;
}
