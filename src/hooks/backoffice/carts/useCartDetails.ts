import { useEffect, useMemo, useState } from 'react';
import { getCart } from '../../../resources/carts/carts.service';
import { getProductTtc } from '../../../resources/products/products.service';
import type { CartOutput } from '../../../resources/carts/carts.types';
import type { ProductTtcOutput } from '../../../resources/products/products.types';

const getLangValue = (map: Record<number, string>, preferred = 1): string =>
	map[preferred] ?? Object.values(map)[0] ?? '';

export interface CartRowDetail {
	id: number;
	name: string;
	reference: string;
	quantity: number;
	priceTtc: number;
	lineTotalTtc: number;
}

export function useCartDetails(cartId: number | null) {
	const [cart, setCart] = useState<CartOutput | null>(null);
	const [products, setProducts] = useState<ProductTtcOutput[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let isActive = true;

		const load = async () => {
			if (cartId === null) {
				setLoading(false);
				setError('Panier introuvable.');
				return;
			}

			setLoading(true);
			setError(null);

			try {
				const cartResult = await getCart(cartId);
				const productIds = Array.from(new Set(cartResult.cart_rows.map(row => row.id_product).filter(id => id > 0)));
				const productResults = await Promise.all(productIds.map(id => getProductTtc(id)));

				if (!isActive) return;
				setCart(cartResult);
				setProducts(productResults);
			} catch (err: unknown) {
				if (!isActive) return;
				if (err && typeof err === 'object' && 'message' in err) {
					setError(String((err as { message?: string }).message ?? 'Erreur inconnue'));
				} else {
					setError('Erreur inconnue');
				}
			} finally {
				if (isActive) setLoading(false);
			}
		};

		load();

		return () => {
			isActive = false;
		};
	}, [cartId]);

	const productMap = useMemo(
		() => new Map(products.map(product => [product.id, product])),
		[products]
	);

	const rows = useMemo<CartRowDetail[]>(() => {
		if (!cart) return [];
		return cart.cart_rows.map(row => {
			const product = productMap.get(row.id_product);
			const name = product ? getLangValue(product.name) : `Produit #${row.id_product}`;
			const reference = product?.reference || '-';
			const priceTtc = product?.price_ttc ?? 0;
			return {
				id: row.id_product,
				name,
				reference,
				quantity: row.quantity,
				priceTtc,
				lineTotalTtc: priceTtc * row.quantity,
			};
		});
	}, [cart, productMap]);

	const totalItems = useMemo(
		() => rows.reduce((sum, row) => sum + row.quantity, 0),
		[rows]
	);

	const totalTtc = useMemo(
		() => rows.reduce((sum, row) => sum + row.lineTotalTtc, 0),
		[rows]
	);

	return {
		cart,
		rows,
		totalItems,
		totalTtc,
		loading,
		error,
	};
}