import Papa from 'papaparse';
import type { Fichier1Row } from '../../../types/import/import.types';

function parseDate(raw: string): Date {
    const [day, month, year] = raw.trim().split('/').map(Number);
    return new Date(year, month - 1, day);
}

function isValidDate(dateStr: string): boolean {
    if (!dateStr) return false;
    const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    if (!regex.test(dateStr.trim())) return false;
    const [day, month, year] = dateStr.trim().split('/').map(Number);
    if (month < 1 || month > 12) return false;
    if (day < 1 || day > 31) return false;
    return true;
}

function parseFloat_fr(raw: string | undefined | null): number {
    if (!raw) return 0;
    return parseFloat(raw.trim().replace(',', '.'));
}

function parseTaxRate(raw: string | undefined | null): number {
    if (!raw) return 0;
    return parseFloat(raw.trim().replace('%', '').replace(',', '.'));
}

export async function parseFile1(file: File): Promise<Fichier1Row[]> {
    return new Promise((resolve, reject) => {
        Papa.parse<Record<string, string>>(file, {
            header: true,
            skipEmptyLines: true,
            complete: ({ data, errors, meta }) => {
                if (errors.length) {
                    reject(new Error(`Erreur parsing fichier1 : ${errors[0].message}`));
                    return;
                }

                // Vérification i : Noms de colonnes conformes
                const expectedColumns = [
                    'date_availability_produit', 'nom', 'reference', 'prix_ttc', 'Taxe', 'categorie', 'prix_achat'
                ];

                const actualColumns = meta.fields || [];
                for (const col of expectedColumns) {
                    if (!actualColumns.includes(col)) {
                        reject(new Error(`Nom de colonne non conforme : la colonne "${col}" est manquante ou incorrectement orthographiée dans le fichier 1.`));
                        return;
                    }
                }

                try {
                    const rows: Fichier1Row[] = data.map((row, index) => {
                        const lineNumber = index + 2;

                        // Vérification ii : Format de date différente de DD/MM/YYYY
                        const dateRaw = row['date_availability_produit'] ?? '';
                        if (!isValidDate(dateRaw)) {
                            throw new Error(`Format de date différent de DD/MM/YYYY : colonne "date_availability_produit", ligne ${lineNumber}, valeur "${dateRaw}"`);
                        }

                        // Vérification iii : Montants positifs
                        const prixTtc = parseFloat_fr(row['prix_ttc']);
                        if (isNaN(prixTtc) || prixTtc < 0) {
                            throw new Error(`Montant non positif ou invalide : colonne "prix_ttc", ligne ${lineNumber}, valeur "${row['prix_ttc']}"`);
                        }

                        const taxe = parseTaxRate(row['Taxe']);
                        if (isNaN(taxe) || taxe < 0) {
                            throw new Error(`Montant non positif ou invalide : colonne "Taxe", ligne ${lineNumber}, valeur "${row['Taxe']}"`);
                        }

                        const prixAchat = parseFloat_fr(row['prix_achat']);
                        if (isNaN(prixAchat) || prixAchat < 0) {
                            throw new Error(`Montant non positif ou invalide : colonne "prix_achat", ligne ${lineNumber}, valeur "${row['prix_achat']}"`);
                        }

                        return {
                            date_availability_produit: parseDate(dateRaw),
                            nom:        row['nom']?.trim() ?? '',
                            reference:  row['reference']?.trim() ?? '',
                            prix_ttc:   prixTtc,
                            taxe:       taxe,
                            categorie:  row['categorie']?.trim() ?? '',
                            prix_achat: prixAchat,
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