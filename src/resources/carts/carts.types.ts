export interface CartRowInput {
  id_product: number;
  id_product_attribute: number;
  id_address_delivery: number;
  id_customization?: number;
  quantity: number;
}

export type CartRowOutput = CartRowInput;

export interface CartCreateInput {
  id_address_delivery?: number;
  id_address_invoice?: number;
  id_currency: number;
  id_customer?: number;
  id_guest?: number;
  id_lang: number;
  id_shop_group?: number;
  id_shop?: number;
  id_carrier?: number;
  recyclable?: boolean;
  gift?: boolean;
  gift_message?: string;
  mobile_theme?: boolean;
  delivery_option?: string;
  secure_key?: string;
  allow_seperated_package?: boolean;
  date_add?: string;
  date_upd?: string;
  cart_rows?: CartRowInput[];
}

export type CartUpdateInput = CartCreateInput;

export interface CartOutput {
  id: number;
  id_address_delivery: number | null;
  id_address_invoice: number | null;
  id_currency: number;
  id_customer: number | null;
  id_guest: number | null;
  id_lang: number;
  id_shop_group: number | null;
  id_shop: number | null;
  id_carrier: number | null;
  recyclable: boolean;
  gift: boolean;
  gift_message: string;
  mobile_theme: boolean;
  delivery_option: string;
  secure_key: string;
  allow_seperated_package: boolean;
  date_add: string;
  date_upd: string;
  cart_rows: CartRowOutput[];
}

export interface CartListItem {
  id: number;
  href: string;
}
