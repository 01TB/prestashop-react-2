import Papa from 'papaparse';
import type { Fichier3Row, OrderItem } from '../../../types/import/import.types';

function parseDate(raw: string): Date {
    const [day, month, year] = raw.trim().split('/').map(Number);
    return new Date(year, month - 1, day);
}

/**
 * Parse la colonne "achat" :
 * '[("T_01";2;"kely"),("C_03";1;"")]'
 * → [ { reference: "T_01", quantite: 2, karazany: "kely" }, ... ]
 */
function parseAchats(raw: string | undefined | null): OrderItem[] {
    if (!raw || raw.trim() === '') return [];

    // Extrait chaque tuple : ("T_01";2;"kely")
    const tupleRegex = /\("([^"]+)";(\d+);"([^"]*)"\)/g;
    const items: OrderItem[] = [];
    let match: RegExpExecArray | null;

    while ((match = tupleRegex.exec(raw)) !== null) {
        items.push({
            reference: match[1],
            quantite:  parseInt(match[2], 10),
            karazany:  match[3],
        });
    }
    return items;
}

export async function parseFile3(file: File): Promise<Fichier3Row[]> {
    return new Promise((resolve, reject) => {
        Papa.parse<Record<string, string>>(file, {
            header: true,
            skipEmptyLines: true,
            complete: ({ data, errors }) => {
                if (errors.length) {
                    reject(new Error(`Erreur parsing fichier3 : ${errors[0].message}`));
                    return;
                }
                const rows: Fichier3Row[] = data.map((row) => ({
                    date:    parseDate(row['date']),
                    nom:     row['nom']?.trim()     ?? '',
                    email:   row['email']?.trim()   ?? '',
                    pwd:     row['pwd']?.trim()     ?? '',
                    adresse: row['adresse']?.trim() ?? '',
                    achats:  parseAchats(row['achat']),
                    etat:    row['etat']?.trim()    || null,
                }));
                resolve(rows);
            },
            error: reject,
        });
    });
}