import { useEffect, useState } from 'react';
import { listCategories } from '../../../resources/categories/categories.service';
import type { CategoryOutput } from '../../../resources/categories/categories.types';

export function useCategoriesList() {
	const [data, setData] = useState<CategoryOutput[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let isActive = true;

		const load = async () => {
			setLoading(true);
			setError(null);

			try {
				const categories = await listCategories();
				if (isActive) {
					setData(categories);
				}
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