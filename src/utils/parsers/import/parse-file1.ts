import Papa from 'papaparse';
import type { Fichier1Row } from '../../../types/import/import.types';

/**
 * Parse une date au format "DD/MM/YYYY" → Date
 */
function parseDate(raw: string): Date {
    const [day, month, year] = raw.trim().split('/').map(Number);
    return new Date(year, month - 1, day);
}

/**
 * Parse un nombre flottant "français" : "12,5" ou "18.99" → 12.5
 */
function parseFloat_fr(raw: string | undefined | null): number {
    if (!raw) return 0;
    return parseFloat(raw.trim().replace(',', '.'));
}

/**
 * Parse un taux de taxe : "11,65%" → 11.65
 */
function parseTaxRate(raw: string | undefined | null): number {
    if (!raw) return 0;
    return parseFloat(raw.trim().replace('%', '').replace(',', '.'));
}

export async function parseFile1(file: File): Promise<Fichier1Row[]> {
    return new Promise((resolve, reject) => {
        Papa.parse<Record<string, string>>(file, {
            header: true,
            skipEmptyLines: true,
            complete: ({ data, errors }) => {
                if (errors.length) {
                    reject(new Error(`Erreur parsing fichier1 : ${errors[0].message}`));
                    return;
                }
                const rows: Fichier1Row[] = data.map((row) => ({
                    date_availability_produit: parseDate(row['date_availability_produit']),
                    nom:        row['nom']?.trim() ?? '',
                    reference:  row['reference']?.trim() ?? '',
                    prix_ttc:   parseFloat_fr(row['prix_ttc']),
                    taxe:       parseTaxRate(row['Taxe']),
                    categorie:  row['categorie']?.trim() ?? '',
                    prix_achat: parseFloat_fr(row['prix_achat']),
                }));
                resolve(rows);
            },
            error: reject,
        });
    });
}