import type { CartOutput, CartRowInput, CartUpdateInput } from '../../resources/carts/carts.types';
import { createCart, getCart, replaceCart } from '../../resources/carts/carts.service';
import { createGuest } from '../../resources/guests/guests.service';
import { listProducts } from '../../resources/products/products.service';
import { listCombinations } from '../../resources/combinations/combinations.service';
import { listProductOptionValues } from '../../resources/product_option_values/product_option_values.service';
import { listProductOptions } from '../../resources/product_options/product_options.service';
import type { ProductOutput } from '../../resources/products/products.types';
import type { CombinationOutput } from '../../resources/combinations/combinations.types';
import type { ProductOptionValueOutput } from '../../resources/product_option_values/product_option_values.types';
import type { ProductOptionOutput } from '../../resources/product_options/product_options.types';

const CART_ID_KEY = 'frontofficeCartId';
const GUEST_ID_KEY = 'frontofficeGuestId';

const parseStoredNumber = (value: string | null): number | null => {
  if (!value) return null;
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
};

const uniqueNumbers = (values: number[]): number[] =>
  Array.from(new Set(values.filter(value => value > 0)));

const buildIdFilter = (values: number[]): string => `[${values.join('|')}]`;

export const getStoredCartId = (): number | null =>
  parseStoredNumber(localStorage.getItem(CART_ID_KEY));

export const getStoredGuestId = (): number | null =>
  parseStoredNumber(localStorage.getItem(GUEST_ID_KEY));

export const setStoredCartId = (cartId: number) => {
  localStorage.setItem(CART_ID_KEY, String(cartId));
};

export const setStoredGuestId = (guestId: number) => {
  localStorage.setItem(GUEST_ID_KEY, String(guestId));
};

export const clearStoredCart = () => {
  localStorage.removeItem(CART_ID_KEY);
};

export const clearStoredGuest = () => {
  localStorage.removeItem(GUEST_ID_KEY);
};

export const clearCartStorage = () => {
  clearStoredCart();
  clearStoredGuest();
};

const toCartUpdateInput = (
  cart: CartOutput,
  overrides: Partial<CartUpdateInput> = {}
): CartUpdateInput => ({
  id_address_delivery: overrides.id_address_delivery ?? cart.id_address_delivery ?? 0,
  id_address_invoice: overrides.id_address_invoice ?? cart.id_address_invoice ?? 0,
  id_currency: overrides.id_currency ?? cart.id_currency ?? 1,
  id_customer: overrides.id_customer ?? cart.id_customer ?? 0,
  id_guest: overrides.id_guest ?? cart.id_guest ?? 0,
  id_lang: overrides.id_lang ?? cart.id_lang ?? 1,
  id_shop_group: overrides.id_shop_group ?? cart.id_shop_group ?? 0,
  id_shop: overrides.id_shop ?? cart.id_shop ?? 0,
  id_carrier: overrides.id_carrier ?? cart.id_carrier ?? 0,
  recyclable: overrides.recyclable ?? cart.recyclable,
  gift: overrides.gift ?? cart.gift,
  gift_message: overrides.gift_message ?? cart.gift_message,
  mobile_theme: overrides.mobile_theme ?? cart.mobile_theme,
  delivery_option: overrides.delivery_option ?? cart.delivery_option,
  secure_key: overrides.secure_key ?? cart.secure_key,
  allow_seperated_package: overrides.allow_seperated_package ?? cart.allow_seperated_package,
  date_add: overrides.date_add ?? cart.date_add,
  date_upd: overrides.date_upd ?? cart.date_upd,
  cart_rows: overrides.cart_rows ?? cart.cart_rows.map(row => ({
    id_product: row.id_product,
    id_product_attribute: row.id_product_attribute,
    id_address_delivery: row.id_address_delivery ?? 0,
    id_customization: row.id_customization,
    quantity: row.quantity,
  })),
});

export async function ensureCartId(options: {
  customerId?: number;
  secureKey?: string;
  currencyId?: number;
  langId?: number;
}): Promise<{ cartId: number; guestId?: number }>{
  const existingCartId = getStoredCartId();
  if (existingCartId) {
    try {
      await getCart(existingCartId);
      return { cartId: existingCartId, guestId: getStoredGuestId() ?? undefined };
    } catch {
      clearStoredCart();
    }
  }

  let guestId = options.customerId ? undefined : getStoredGuestId() ?? undefined;
  if (options.customerId) {
    clearStoredGuest();
  }
  if (!options.customerId && !guestId) {
    guestId = await createGuest(0);
    setStoredGuestId(guestId);
  }

  const cartId = await createCart({
    id_currency: options.currencyId ?? 1,
    id_lang: options.langId ?? 1,
    id_customer: options.customerId,
    id_guest: guestId,
    id_address_delivery: 0,
    id_address_invoice: 0,
    secure_key: options.secureKey ?? '',
  });

  setStoredCartId(cartId);
  return { cartId, guestId };
}

export async function addToCart(options: {
  productId: number;
  productAttributeId: number;
  quantity: number;
  customerId?: number;
  secureKey?: string;
}): Promise<number> {
  const { cartId } = await ensureCartId({
    customerId: options.customerId,
    secureKey: options.secureKey,
  });
  const cart = await getCart(cartId);
  const rows = [...cart.cart_rows];

  const existing = rows.find(
    row => row.id_product === options.productId && row.id_product_attribute === options.productAttributeId
  );

  if (existing) {
    existing.quantity += options.quantity;
  } else {
    rows.push({
      id_product: options.productId,
      id_product_attribute: options.productAttributeId,
      id_address_delivery: cart.id_address_delivery ?? 0,
      id_customization: 0,
      quantity: options.quantity,
    });
  }

  await replaceCart(cartId, toCartUpdateInput(cart, { cart_rows: rows }));
  return cartId;
}

export async function updateCartRows(
  cart: CartOutput,
  rows: CartRowInput[]
): Promise<CartOutput> {
  await replaceCart(cart.id, toCartUpdateInput(cart, { cart_rows: rows }));
  return getCart(cart.id);
}

export async function updateCartMetadata(
  cart: CartOutput,
  overrides: Partial<CartUpdateInput>
): Promise<CartOutput> {
  await replaceCart(cart.id, toCartUpdateInput(cart, overrides));
  return getCart(cart.id);
}

export interface CartDetails {
  cart: CartOutput;
  productsById: Record<number, ProductOutput>;
  combinationsById: Record<number, CombinationOutput>;
  optionValuesById: Record<number, ProductOptionValueOutput>;
  optionGroupsById: Record<number, ProductOptionOutput>;
}

export async function loadCartDetails(cartId: number): Promise<CartDetails> {
  const cart = await getCart(cartId);

  const productIds = uniqueNumbers(cart.cart_rows.map(row => row.id_product));
  const products = productIds.length
    ? await listProducts({ 'filter[id]': buildIdFilter(productIds) })
    : [];
  const productsById = Object.fromEntries(products.map(product => [product.id, product]));

  const combinationIds = uniqueNumbers(
    cart.cart_rows.map(row => row.id_product_attribute).filter(id => id > 0)
  );
  const combinations = combinationIds.length
    ? await listCombinations({ 'filter[id]': buildIdFilter(combinationIds) })
    : [];
  const combinationsById = Object.fromEntries(combinations.map(combination => [combination.id, combination]));

  const optionValueIds = uniqueNumbers(
    combinations.flatMap(combination => combination.product_option_values)
  );
  const optionValues = optionValueIds.length
    ? await listProductOptionValues({ 'filter[id]': buildIdFilter(optionValueIds) })
    : [];
  const optionValuesById = Object.fromEntries(optionValues.map(value => [value.id, value]));

  const optionGroupIds = uniqueNumbers(optionValues.map(value => value.id_attribute_group));
  const optionGroups = optionGroupIds.length
    ? await listProductOptions({ 'filter[id]': buildIdFilter(optionGroupIds) })
    : [];
  const optionGroupsById = Object.fromEntries(optionGroups.map(group => [group.id, group]));

  return {
    cart,
    productsById,
    combinationsById,
    optionValuesById,
    optionGroupsById,
  };
}
