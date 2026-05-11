import type { LangMap } from '../../utils/xml-utils';

export interface OrderStateCreateInput {
  name: LangMap;
  template?: LangMap;
  unremovable?: boolean;
  delivery?: boolean;
  hidden?: boolean;
  send_email?: boolean;
  module_name?: string;
  invoice?: boolean;
  color?: string;
  logable?: boolean;
  shipped?: boolean;
  paid?: boolean;
  pdf_delivery?: boolean;
  pdf_invoice?: boolean;
  deleted?: boolean;
}

export type OrderStateUpdateInput = OrderStateCreateInput;

export interface OrderStateOutput {
  id: number;
  unremovable: boolean;
  delivery: boolean;
  hidden: boolean;
  send_email: boolean;
  module_name: string;
  invoice: boolean;
  color: string;
  logable: boolean;
  shipped: boolean;
  paid: boolean;
  pdf_delivery: boolean;
  pdf_invoice: boolean;
  deleted: boolean;
  name: LangMap;
  template: LangMap;
}

export interface OrderStateListItem {
  id: number;
  href: string;
}
