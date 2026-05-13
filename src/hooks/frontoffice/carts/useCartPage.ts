import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getStoredCartId,
  loadCartDetails,
  updateCartRows,
} from '../../../services/frontoffice/carts/cartService.ts';
import { listTaxRules } from '../../../resources/tax_rules/tax_rules.service';
import { listTaxes } from '../../../resources/taxes/taxes.service';
import type { CartRowInput, CartOutput } from '../../../resources/carts/carts.types';
import type { ProductOutput } from '../../../resources/products/products.types';
import type { CombinationOutput } from '../../../resources/combinations/combinations.types';

const getLangValue = (map: Record<number, string>, preferred = 1): string =>
  map[preferred] ?? Object.values(map)[0] ?? '';

const getGroupLabel = (group: { public_name: Record<number, string>; name: Record<number, string> }) => {
  const source = Object.keys(group.public_name).length > 0 ? group.public_name : group.name;
  return getLangValue(source);
};

const buildRowKey = (row: { id_product: number; id_product_attribute: number }) =>
  `${row.id_product}-${row.id_product_attribute}`;

export interface CartPageItem {
  key: string;
  row: CartRowInput;
  product?: ProductOutput;
  combination?: CombinationOutput;
  imageUrl: string | null;
  lineTotalHt: number;
  unitPriceTtc: number;
  lineTotalTtc: number;
  optionLabels: string;
}

export interface UseCartPageResult {
  cart: CartOutput | null;
  items: CartPageItem[];
  totals: {
    totalTtc: number;
    totalHt: number;
  };
  quantities: Record<string, number>;
  loading: boolean;
  saving: boolean;
  error: string | null;
  handleQuantityChange: (key: string, value: number) => void;
  applyRowUpdate: (row: CartRowInput, overrideQuantity?: number) => Promise<void>;
  handleCheckout: () => void;
}

export function useCartPage(): UseCartPageResult {
  const navigate = useNavigate();

  const [cart, setCart] = useState<CartOutput | null>(null);
  const [details, setDetails] = useState<Awaited<ReturnType<typeof loadCartDetails>> | null>(null);
  const [taxRateByGroup, setTaxRateByGroup] = useState<Record<number, number>>({});
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    const cartId = getStoredCartId();
    if (!cartId) {
      setCart(null);
      setDetails(null);
      setTaxRateByGroup({});
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const loaded = await loadCartDetails(cartId);
      setCart(loaded.cart);
      setDetails(loaded);

      const groupIds = Array.from(new Set(
        loaded.cart.cart_rows
          .map(row => loaded.productsById[row.id_product]?.id_tax_rules_group ?? 0)
          .filter(id => id > 0)
      ));

      const nextTaxRateByGroup: Record<number, number> = {};
      if (groupIds.length > 0) {
        const taxRules = await listTaxRules({
          'filter[id_tax_rules_group]': `[${groupIds.join('|')}]`,
          'filter[id_country]': '8',
          display: '[id,id_tax_rules_group,id_tax,id_country,id_state,zipcode_from,zipcode_to]',
        });

        const taxIds = Array.from(new Set(taxRules.map(rule => rule.id_tax).filter(id => id > 0)));

        if (taxIds.length > 0) {
          const taxes = await listTaxes({
            'filter[id]': `[${taxIds.join('|')}]`,
            display: '[id,rate]',
          });

          const rateByTaxId = new Map(taxes.map(tax => [tax.id, tax.rate]));
          const rulesByGroup = new Map<number, typeof taxRules>();

          for (const rule of taxRules) {
            const groupRules = rulesByGroup.get(rule.id_tax_rules_group) ?? [];
            groupRules.push(rule);
            rulesByGroup.set(rule.id_tax_rules_group, groupRules);
          }

          for (const [groupId, rules] of rulesByGroup.entries()) {
            const selectedRule =
              rules.find(rule => rule.id_state === 0 && !rule.zipcode_from && !rule.zipcode_to) ??
              rules.find(rule => rule.id_state === 0) ??
              rules[0];

            nextTaxRateByGroup[groupId] = selectedRule
              ? rateByTaxId.get(selectedRule.id_tax) ?? 0
              : 0;
          }
        }
      }
      setTaxRateByGroup(nextTaxRateByGroup);

      const nextQuantities: Record<string, number> = {};
      for (const row of loaded.cart.cart_rows) {
        nextQuantities[buildRowKey(row)] = row.quantity;
      }
      setQuantities(nextQuantities);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'message' in err) {
        setError(String((err as { message?: string }).message ?? 'Erreur inconnue'));
      } else {
        setError('Erreur inconnue');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const items = useMemo(() => {
    if (!details) return [];
    const { cart: currentCart, productsById, combinationsById, optionValuesById, optionGroupsById } = details;

    return currentCart.cart_rows.map(row => {
      const product = productsById[row.id_product];
      const combination = row.id_product_attribute
        ? combinationsById[row.id_product_attribute]
        : undefined;
      const imageId = combination?.images?.[0] ?? product?.id_default_image ?? 0;
      const imageUrl = imageId && product ? `/api/images/products/${product.id}/${imageId}` : null;

      const unitPriceHt = (product?.price ?? 0) + (combination?.price ?? 0);
      const taxRate = taxRateByGroup[product?.id_tax_rules_group ?? 0] ?? 0;
      const unitPriceTtc = unitPriceHt * (1 + taxRate / 100);
      const lineTotalHt = unitPriceHt * row.quantity;
      const lineTotalTtc = unitPriceTtc * row.quantity;

      const optionLabels = (combination?.product_option_values ?? [])
        .map(valueId => {
          const value = optionValuesById[valueId];
          const group = value ? optionGroupsById[value.id_attribute_group] : undefined;
          if (!value || !group) return '';
          return `${getGroupLabel(group)}: ${getLangValue(value.name)}`;
        })
        .filter(Boolean)
        .join(' / ');

      return {
        key: buildRowKey(row),
        row,
        product,
        combination,
        imageUrl,
        lineTotalHt,
        unitPriceTtc,
        lineTotalTtc,
        optionLabels,
      };
    });
  }, [details, taxRateByGroup]);

  const totals = useMemo(() => {
    const totalTtc = items.reduce((sum, item) => sum + item.lineTotalTtc, 0);
    const totalHt = items.reduce((sum, item) => sum + item.lineTotalHt, 0);
    return {
      totalTtc,
      totalHt,
    };
  }, [items]);

  const handleQuantityChange = (key: string, value: number) => {
    setQuantities(current => ({ ...current, [key]: Math.max(0, value) }));
  };

  const applyRowUpdate = async (row: CartRowInput, overrideQuantity?: number) => {
    if (!cart) return;
    const key = buildRowKey(row);
    const nextQuantity = overrideQuantity ?? quantities[key] ?? row.quantity;

    const nextRows = cart.cart_rows
      .map(existing =>
        buildRowKey(existing) === key
          ? { ...existing, quantity: nextQuantity }
          : existing
      )
      .filter(item => item.quantity > 0);

    setSaving(true);
    setError(null);

    try {
      const updated = await updateCartRows(cart, nextRows);
      setCart(updated);
      await load();
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'message' in err) {
        setError(String((err as { message?: string }).message ?? 'Erreur inconnue'));
      } else {
        setError('Erreur inconnue');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCheckout = () => {
    navigate('/frontoffice/checkout');
  };

  return {
    cart,
    items,
    totals,
    quantities,
    loading,
    saving,
    error,
    handleQuantityChange,
    applyRowUpdate,
    handleCheckout,
  };
}
