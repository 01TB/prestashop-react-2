import type { LangMap } from '../../utils/xml-utils';

// ─── Création (POST) ──────────────────────────────────────────────────────────

export interface StockMovementReasonCreateInput {
  // Le synopsis indique que name est required
  name: LangMap;

  // Champs optionnels (formats déduits)
  sign?: number;           // entier (généralement 1 ou -1)
  deleted?: boolean;       // booléen (0 ou 1)
  date_add?: string;       // format: isDate (YYYY-MM-DD HH:MM:SS)
  date_upd?: string;       // format: isDate (YYYY-MM-DD HH:MM:SS)
}

// ─── Mise à jour (PATCH) ──────────────────────────────────────────────────────

export type StockMovementReasonUpdateInput = StockMovementReasonCreateInput;

// ─── Lecture (GET item et display=full) ───────────────────────────────────────

export interface StockMovementReasonOutput {
  id: number;
  sign: number;
  deleted: boolean;
  date_add: string;
  date_upd: string;
  name: LangMap;
}

// ─── Lecture (GET liste simple) ───────────────────────────────────────────────

export interface StockMovementReasonListItem {
  id: number;
  href: string;
}