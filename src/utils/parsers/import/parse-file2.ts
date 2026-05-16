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
            complete: ({ data, errors, meta }) => {
                if (errors.length) {
                    reject(new Error(`Erreur parsing fichier2 : ${errors[0].message}`));
                    return;
                }

                // Vérification i : Noms de colonnes conformes
                const expectedColumns = [
                    'reference', 'specificité', 'karazany', 'stock_initial', 'prix_vente_ttc'
                ];

                const actualColumns = meta.fields || [];
                for (const col of expectedColumns) {
                    if (!actualColumns.includes(col)) {
                        reject(new Error(`Nom de colonne non conforme : la colonne "${col}" est manquante ou incorrectement orthographiée dans le fichier 2.`));
                        return;
                    }
                }

                try {
                    const rows: Fichier2Row[] = data.map((row, index) => {
                        const lineNumber = index + 2;

                        // Vérification iii : Montants/stocks positifs
                        const stockRaw = row['stock_initial'] ?? '0';
                        const stockInitial = parseInt(stockRaw, 10);
                        if (isNaN(stockInitial) || stockInitial < 0) {
                            throw new Error(`Montant non positif ou invalide : colonne "stock_initial", ligne ${lineNumber}, valeur "${stockRaw}"`);
                        }

                        const prixVenteTtc = parseFloat_fr(row['prix_vente_ttc']);
                        if (prixVenteTtc !== null && (isNaN(prixVenteTtc) || prixVenteTtc < 0)) {
                            throw new Error(`Montant non positif ou invalide : colonne "prix_vente_ttc", ligne ${lineNumber}, valeur "${row['prix_vente_ttc']}"`);
                        }

                        return {
                            reference:      row['reference']?.trim() ?? '',
                            specificite:    row['specificité']?.trim() || null,
                            karazany:       row['karazany']?.trim()    || null,
                            stock_initial:  stockInitial,
                            prix_vente_ttc: prixVenteTtc,
                        };
                    });
                    resolve(rows);
                } catch (error) {
                    reject(error);
                }
            },
            error: reject,
        });
    });
}