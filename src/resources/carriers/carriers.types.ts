import type { LangMap } from '../../utils/xml-utils';

export interface CarrierCreateInput {
  name: string;
  active: boolean;
  delay: LangMap;
  deleted?: boolean;
  is_module?: boolean;
  id_tax_rules_group?: number;
  id_reference?: number;
  is_free?: boolean;
  url?: string;
  shipping_handling?: boolean;
  shipping_external?: boolean;
  range_behavior?: boolean;
  shipping_method?: number;
  max_width?: number;
  max_height?: number;
  max_depth?: number;
  max_weight?: number;
  grade?: number;
  external_module_name?: string;
  need_range?: boolean;
  position?: number;
}

export type CarrierUpdateInput = CarrierCreateInput;

export interface CarrierOutput {
  id: number;
  deleted: boolean;
  is_module: boolean;
  id_tax_rules_group: number | null;
  id_reference: number | null;
  name: string;
  active: boolean;
  is_free: boolean;
  url: string;
  shipping_handling: boolean;
  shipping_external: boolean;
  range_behavior: boolean;
  shipping_method: number;
  max_width: number | null;
  max_height: number | null;
  max_depth: number | null;
  max_weight: number | null;
  grade: number | null;
  external_module_name: string;
  need_range: boolean;
  position: number | null;
  delay: LangMap;
}

export interface CarrierListItem {
  id: number;
  href: string;
}
