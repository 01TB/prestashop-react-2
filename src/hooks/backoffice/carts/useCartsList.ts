import { useEffect, useState } from 'react';
import { listCarts } from '../../../resources/carts/carts.service';
import type { CartOutput } from '../../../resources/carts/carts.types';

export interface CartListItem {
	cart: CartOutput;
	rowCount: number;
}

export function useCartsList() {
	const [data, setData] = useState<CartListItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let isActive = true;

		const load = async () => {
			setLoading(true);
			setError(null);

			try {
				const carts = await listCarts();
				if (!isActive) return;
				setData(carts.map(cart => ({
					cart,
					rowCount: cart.cart_rows.length,
				})));
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
	}, []);

	return {
		data,
		loading,
		error,
	};
}