import Papa from 'papaparse';
import type { Fichier2Row } from '../../../types/import/import.types';

function parseFloat_fr(raw: string | undefined | null): number | null {
    if (!raw || raw.trim() === '') return null;
    return parseFloat(raw.trim().replace(',', '.'));
}

export async function parseFile2(file: File): Promise<Fichier2Row[]> {
    return new Promise((resolve, reject) => {
        Papa.parse<Record<string, string>>(file, {
            header: true,
            skipEmptyLines: true,
            complete: ({ data, errors }) => {
                if (errors.length) {
                    reject(new Error(`Erreur parsing fichier2 : ${errors[0].message}`));
                    return;
                }
                const rows: Fichier2Row[] = data.map((row) => ({
                    reference:      row['reference']?.trim() ?? '',
                    specificite:    row['specificité']?.trim() || null,
                    karazany:       row['karazany']?.trim()    || null,
                    stock_initial:  parseInt(row['stock_initial'] ?? '0', 10),
                    prix_vente_ttc: parseFloat_fr(row['prix_vente_ttc']),
                }));
                resolve(rows);
            },
            error: reject,
        });
    });
}