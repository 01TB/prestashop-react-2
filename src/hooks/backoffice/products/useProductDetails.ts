import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { listCategories } from '../../../resources/categories/categories.service';
import { getProductTtc } from '../../../resources/products/products.service';
import type { CategoryOutput } from '../../../resources/categories/categories.types';
import type { ProductTtcOutput } from '../../../resources/products/products.types';

const getLangValue = (map: Record<number, string>, preferred = 1): string =>
	map[preferred] ?? Object.values(map)[0] ?? '';

export function useProductDetails() {
	const { productId } = useParams();
	const numericId = productId ? Number(productId) : NaN;
	const productIdValue = Number.isNaN(numericId) ? null : numericId;

	const [product, setProduct] = useState<ProductTtcOutput | null>(null);
	const [categories, setCategories] = useState<CategoryOutput[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let isActive = true;

		const load = async () => {
			if (productIdValue === null) {
				setLoading(false);
				setError('Produit introuvable.');
				return;
			}

			setLoading(true);
			setError(null);

			try {
				const [productResult, categoriesResult] = await Promise.all([
					getProductTtc(productIdValue),
					listCategories({ display: '[id,name]' }),
				]);

				if (!isActive) return;
				setProduct(productResult);
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
	}, [productIdValue]);

	const categoryMap = useMemo(
		() => new Map(categories.map(category => [category.id, category])),
		[categories]
	);

	const defaultCategoryName = product
		? categoryMap.get(product.id_category_default)
			? getLangValue(categoryMap.get(product.id_category_default)!.name)
			: `Catégorie #${product.id_category_default}`
		: '-';

	const associatedCategories = useMemo(
		() => product
			? product.categories.map(categoryId => {
				const category = categoryMap.get(categoryId);
				return {
					id: categoryId,
					name: category ? getLangValue(category.name) : `Catégorie #${categoryId}`,
				};
			})
			: [],
		[product, categoryMap]
	);

	return {
		product,
		associatedCategories,
		defaultCategoryName,
		loading,
		error,
	};
}