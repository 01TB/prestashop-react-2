import api from '../services/api';
import { parseXml } from './xml-utils';

export interface FieldMeta {
  name: string;
  required: boolean;
  readOnly: boolean;
  notFilterable: boolean;
  format: string | null;       // ex: "isUnsignedId", "isPrice", "isBool", …
  maxSize: number | null;
  isAssociation: boolean;      // true si le champ est dans <associations>
}

/**
 * Lit le synopsis schema d'une ressource et retourne la liste des FieldMeta.
 * @param resource  ex: "orders", "products", "customers"
 */
export async function parseResourceSynopsis(resource: string): Promise<FieldMeta[]> {
  const response = await api.get<string>(`${resource}?schema=synopsis`);
  const doc = parseXml(response.data);

  // Le nœud racine de la ressource (ex: <order>, <product>, …)
  const root = doc.querySelector('prestashop')?.firstElementChild;
  if (!root) throw new Error(`Synopsis schema invalide pour ${resource}`);

  const fields: FieldMeta[] = [];

  // Champs directs (hors <associations>)
  for (const child of Array.from(root.children)) {
    if (child.tagName === 'associations') continue;
    fields.push(extractFieldMeta(child, false));
  }

  // Champs dans <associations> → on descend dans chaque groupe
  const associations = root.querySelector('associations');
  if (associations) {
    for (const group of Array.from(associations.children)) {
      // ex: <order_rows nodeType="order_row" virtualEntity="true">
      const rowTemplate = group.firstElementChild;
      if (!rowTemplate) continue;
      for (const child of Array.from(rowTemplate.children)) {
        fields.push(extractFieldMeta(child, true));
      }
    }
  }

  return fields;
}

function extractFieldMeta(el: Element, isAssociation: boolean): FieldMeta {
  return {
    name:           el.tagName,
    required:       el.getAttribute('required') === 'true',
    readOnly:       el.getAttribute('readOnly') === 'true' || el.getAttribute('read_only') === 'true',
    notFilterable:  el.getAttribute('notFilterable') === 'true',
    format:         el.getAttribute('format'),
    maxSize:        el.hasAttribute('maxSize') ? parseInt(el.getAttribute('maxSize')!, 10) : null,
    isAssociation,
  };
}