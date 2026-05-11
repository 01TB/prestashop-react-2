import type { LangMap } from '../../utils/xml-utils';

export interface CombinationAssocId {
  id: number;
}

export interface CombinationCreateInput {
  id_product: number;
  ean13?: string;
  isbn?: string;
  upc?: string;
  mpn?: string;
  reference?: string;
  supplier_reference?: string;
  wholesale_price?: number;
  price?: number;
  ecotax?: number;
  weight?: number;
  unit_price_impact?: number;
  minimal_quantity: number;
  low_stock_threshold?: number;
  low_stock_alert?: boolean;
  default_on?: boolean;
  available_date?: string;
  available_now?: LangMap;
  available_later?: LangMap;
  product_option_values?: CombinationAssocId[];
  images?: CombinationAssocId[];
}

export type CombinationUpdateInput = CombinationCreateInput;

export interface CombinationOutput {
  id: number;
  id_product: number;
  ean13: string;
  isbn: string;
  upc: string;
  mpn: string;
  reference: string;
  supplier_reference: string;
  wholesale_price: number;
  price: number;
  ecotax: number;
  weight: number;
  unit_price_impact: number;
  minimal_quantity: number;
  low_stock_threshold: number | null;
  low_stock_alert: boolean;
  default_on: boolean;
  available_date: string;
  available_now: LangMap;
  available_later: LangMap;
  product_option_values: number[];
  images: number[];
}

export interface CombinationListItem {
  id: number;
  href: string;
}
