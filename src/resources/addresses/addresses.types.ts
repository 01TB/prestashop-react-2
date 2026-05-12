export interface AddressCreateInput {
  id_customer?: number | null;
  id_manufacturer?: number | null;
  id_supplier?: number | null;
  id_warehouse?: number | null;
  id_country: number;
  id_state?: number | null;
  alias: string;
  company?: string;
  lastname: string;
  firstname: string;
  vat_number?: string;
  address1: string;
  address2?: string;
  postcode?: string;
  city: string;
  other?: string;
  phone?: string;
  phone_mobile?: string;
  dni?: string;
  deleted?: boolean;
  date_add?: string;
  date_upd?: string;
}

export type AddressUpdateInput = AddressCreateInput;

export interface AddressOutput {
  id: number;
  id_customer: number | null;
  id_manufacturer: number | null;
  id_supplier: number | null;
  id_warehouse: number | null;
  id_country: number;
  id_state: number | null;
  alias: string;
  company: string;
  lastname: string;
  firstname: string;
  vat_number: string;
  address1: string;
  address2: string;
  postcode: string;
  city: string;
  other: string;
  phone: string;
  phone_mobile: string;
  dni: string;
  deleted: boolean;
  date_add: string;
  date_upd: string;
}

export interface AddressListItem {
  id: number;
  href: string;
}
