import type { LangMap } from '../../utils/xml-utils';

/** Association simple : juste un id vers une ressource existante */
export interface AssocId {
	id: number;
}

// ─── Création (POST) ──────────────────────────────────────────────────────────

export interface CategoryCreateInput {
	// Identifiant du parent (isUnsignedInt)
	id_parent?: number;

	// Booléens
	active: boolean; // required

	// Shop par défaut
	id_shop_default?: number;

	// Indique si c'est la racine
	is_root_category?: boolean;

	// Position dans l'arborescence (optionnel)
	position?: number;

	// Dates (format isDate)
	date_add?: string;
	date_upd?: string;

	// Champs multilingues (LangMap)
	name: LangMap;               // required
	link_rewrite: LangMap;       // required
	description?: LangMap;
	additional_description?: LangMap;
	meta_title?: LangMap;
	meta_description?: LangMap;
	meta_keywords?: LangMap;

	// Associations
	categories?: AssocId[]; // sous-catégories (id)
	products?: AssocId[];   // produits associés (id)
}

// ─── Mise à jour (PATCH) ──────────────────────────────────────────────────────

/** Pour le PATCH, tous les champs modifiables sont optionnels */
export type CategoryUpdateInput = Partial<CategoryCreateInput>;

// ─── GET item (output) ───────────────────────────────────────────────────────

export interface CategoryOutput {
	id: number;
	id_parent: number | null;
	level_depth: number | null; // read_only
	nb_products_recursive: number | null; // read_only
	active: boolean;
	id_shop_default: number | null;
	is_root_category: boolean;
	position: number | null;
	date_add: string | null;
	date_upd: string | null;
	name: LangMap;
	link_rewrite: LangMap;
	description: LangMap;
	additional_description: LangMap;
	meta_title: LangMap;
	meta_description: LangMap;
	meta_keywords: LangMap;
	// associations
	categories: number[];
	products: number[];
}

