import { useEffect, useMemo, useState } from 'react';
import { listCategories } from '../../../resources/categories/categories.service';
import { listProductsTtc } from '../../../resources/products/products.service';
import type { CategoryOutput } from '../../../resources/categories/categories.types';
import type { ProductTtcOutput } from '../../../resources/products/products.types';

const getLangValue = (map: Record<number, string>, preferred = 1): string =>
	map[preferred] ?? Object.values(map)[0] ?? '';

export interface ProductListItem {
	product: ProductTtcOutput;
	name: string;
	categoryName: string;
	priceTtc: number;
}

export function useProductsList() {
	const [products, setProducts] = useState<ProductTtcOutput[]>([]);
	const [categories, setCategories] = useState<CategoryOutput[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let isActive = true;

		const load = async () => {
			setLoading(true);
			setError(null);

			try {
				const [productsResult, categoriesResult] = await Promise.all([
					listProductsTtc(),
					listCategories({ display: '[id,name]' }),
				]);

				if (!isActive) return;
				setProducts(productsResult);
				setCategories(categoriesResult);
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

	const categoryMap = useMemo(
		() => new Map(categories.map(category => [category.id, category])),
		[categories]
	);

	const data = useMemo<ProductListItem[]>(() => {
		return products.map(product => {
			const category = categoryMap.get(product.id_category_default);
			return {
				product,
				name: getLangValue(product.name),
				categoryName: category ? getLangValue(category.name) : `Catégorie #${product.id_category_default}`,
				priceTtc: product.price,
			};
		});
	}, [products, categoryMap]);

	return {
		data,
		categories,
		loading,
		error,
	};
}