import Papa from 'papaparse';
import type { Fichier3Row, OrderItem } from '../../../types/import/import.types';

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

/**
 * Parse la colonne "achat"
 */
function parseAchats(raw: string | undefined | null, lineNumber: number): OrderItem[] {
    if (!raw || raw.trim() === '') return [];

    const tupleRegex = /\("([^"]+)";(\d+);"([^"]*)"\)/g;
    const items: OrderItem[] = [];
    let match: RegExpExecArray | null;

    while ((match = tupleRegex.exec(raw)) !== null) {
        // Vérification iii : Les quantités d'achats doivent être positives
        const quantite = parseInt(match[2], 10);
        if (isNaN(quantite) || quantite < 0) {
            throw new Error(`Montant non positif ou invalide (quantité d'achat) : colonne "achat", ligne ${lineNumber}, valeur "${match[2]}"`);
        }

        items.push({
            reference: match[1],
            quantite:  quantite,
            karazany:  match[3],
        });
    }

    const combinedItems = (orders : OrderItem[]) : OrderItem[] => {
        const orderMap = new Map<string, OrderItem>();

        for(const order of orders) {
            const key = `${order.reference}|${order.karazany}`;
            const orderItem = orderMap.get(key);

            if(orderItem) {
                orderItem.quantite += order.quantite;
            } else {
                orderMap.set(key, {...order});
            }
        }

        return Array.from(orderMap.values());
    }

    return combinedItems(items);
}

export async function parseFile3(file: File): Promise<Fichier3Row[]> {
    return new Promise((resolve, reject) => {
        Papa.parse<Record<string, string>>(file, {
            header: true,
            skipEmptyLines: true,
            complete: ({ data, errors, meta }) => {
                if (errors.length) {
                    reject(new Error(`Erreur parsing fichier3 : ${errors[0].message}`));
                    return;
                }

                // Vérification i : Noms de colonnes conformes
                const expectedColumns = [
                    'date', 'nom', 'email', 'pwd', 'adresse', 'achat', 'etat'
                ];

                const actualColumns = meta.fields || [];
                for (const col of expectedColumns) {
                    if (!actualColumns.includes(col)) {
                        reject(new Error(`Nom de colonne non conforme : la colonne "${col}" est manquante ou incorrectement orthographiée dans le fichier 3.`));
                        return;
                    }
                }

                try {
                    const rows: Fichier3Row[] = data.map((row, index) => {
                        const lineNumber = index + 2;

                        // Vérification ii : Format de date différente de DD/MM/YYYY
                        const dateRaw = row['date'] ?? '';
                        if (!isValidDate(dateRaw)) {
                            throw new Error(`Format de date différent de DD/MM/YYYY : colonne "date", ligne ${lineNumber}, valeur "${dateRaw}"`);
                        }

                        return {
                            date:    parseDate(dateRaw),
                            nom:     row['nom']?.trim()     ?? '',
                            email:   row['email']?.trim()   ?? '',
                            pwd:     row['pwd']?.trim()     ?? '',
                            adresse: row['adresse']?.trim() ?? '',
                            achats:  parseAchats(row['achat'], lineNumber),
                            etat:    row['etat']?.trim()    || null,
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