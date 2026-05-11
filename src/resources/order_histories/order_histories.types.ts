export interface OrderHistoryCreateInput {
  id_employee?: number;
  id_order_state: number;
  id_order: number;
  date_add?: string;
}

export type OrderHistoryUpdateInput = OrderHistoryCreateInput;

export interface OrderHistoryOutput {
  id: number;
  id_employee: number | null;
  id_order_state: number;
  id_order: number;
  date_add: string;
}

export interface OrderHistoryListItem {
  id: number;
  href: string;
}
