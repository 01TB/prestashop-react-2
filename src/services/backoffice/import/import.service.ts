import { parseFile1 }   from '../../../utils/parsers/import/parse-file1';
import { parseFile2 }   from '../../../utils/parsers/import/parse-file2';
import { parseFile3 }   from '../../../utils/parsers/import/parse-file3';
import { parseZip }     from '../../../utils/parsers/import/parse-zip';
import { processFile1 } from './steps/process-file1';
import { processFile2 } from './steps/process-file2';
import { uploadImages } from './steps/upload-images';
import { processFile3 } from './steps/process-file3';
import {processStockMovements, type StockEntryInput} from './steps/process-stock-movements';
import {parseDateToStringWithHour} from "../../../utils/date-utils.ts";

export async function runImport(
    file1: File,
    file2: File,
    file3: File,
    zipFile: File | null
): Promise<void> {

    if(zipFile !== null) {

        // ── Phase 1 : Parsing (tout en mémoire, aucun appel API) ─────────────────
        console.info('[Import] Parsing des fichiers…');
        const [rows1, rows2, rows3, imageMap] = await Promise.all([
            parseFile1(file1),
            parseFile2(file2),
            parseFile3(file3),
            parseZip(zipFile),
        ]);
        console.info(`Fichier1: ${rows1.length} produits`);
        console.info(`Fichier2: ${rows2.length} combinaisons`);
        console.info(`Fichier3: ${rows3.length} commandes`);
        console.info(`ZIP: ${imageMap.size} images`);

        // ── Phase 2 : Fichier 1 — Produits, catégories, taxes ───────────────────
        console.info('[Import] Création des produits (fichier1)…');
        const referenceToId = await processFile1(rows1);

        // Construire la map référence → prix d'achat HT (nécessaire pour les stocks)
        const referenceToPriceHT = new Map<string, number>(
            rows1.map(r => [r.reference, r.prix_achat])
        );

        // Map référence → date de disponibilité (utilisée comme date du mouvement d'entrée)
        const referenceToDateEntree = new Map<string, string>(
            rows1.map(r => [
                r.reference,
                parseDateToStringWithHour(r.date_availability_produit)
            ])
        );

        // ── Phase 3 : Fichier 2 — Options, combinaisons ──────────────────────────
        console.info('[Import] Création des combinaisons (fichier2)…');
        const combinationKeys = await processFile2(rows2, referenceToId);

        // ── Phase 4 : Images depuis le ZIP ───────────────────────────────────────
        console.info('[Import] Upload des images (zip)…');
        await uploadImages(imageMap, referenceToId);

        // ── Phase 5 : Fichier 3 — Clients, paniers, commandes ───────────────────
        console.info('[Import] Création des commandes (fichier3)…');
        const orderOutputs = await processFile3(rows3, referenceToId);

        // 6a — Entrées initiales (depuis fichier 2)
        console.info('[Import] Création des stocks et mouvements de stock…');
        const stockEntries: StockEntryInput[] = rows2.flatMap((row) => {
            const idProduct = referenceToId.get(row.reference);
            if (!idProduct || row.stock_initial === 0) return [];

            let idProductAttribute: number;

            if (!row.specificite && !row.karazany) {
                idProductAttribute = 0;
            } else {
                const combinationId = combinationKeys.get(`${row.reference}:${row.karazany ?? ''}`);
                if (combinationId === undefined) {
                    console.warn(`Combination introuvable pour ${row.reference}:${row.karazany} — ignoré.`);
                    return [];
                }
                idProductAttribute = combinationId;
            }

            return [{
                idProduct: idProduct.product.id,
                idProductAttribute,
                quantity:    row.stock_initial,
                priceHT:     referenceToPriceHT.get(row.reference) ?? 0,
                reference:   row.reference,
                dateEntree:  referenceToDateEntree.get(row.reference) ?? '',
            }];
        });

        // 6b — Sorties commandes (depuis fichier 3, retourné par processFile3)
        // orderOutputs est déjà construit avec les idProduct et idProductAttribute résolus.

        await processStockMovements(stockEntries, orderOutputs);

    } else {
        // ── Phase 1 : Parsing (tout en mémoire, aucun appel API) ─────────────────
        console.info('[Import] Parsing des fichiers…');
        const [rows1, rows2, rows3] = await Promise.all([
            parseFile1(file1),
            parseFile2(file2),
            parseFile3(file3),
        ]);
        console.info(`Fichier1: ${rows1.length} produits`);
        console.info(`Fichier2: ${rows2.length} combinaisons`);
        console.info(`Fichier3: ${rows3.length} commandes`);

        // ── Phase 2 : Fichier 1 — Produits, catégories, taxes ───────────────────
        console.info('[Import] Création des produits (fichier1)…');
        const referenceToId = await processFile1(rows1);

        // Construire la map référence → prix d'achat HT (nécessaire pour les stocks)
        const referenceToPriceHT = new Map<string, number>(
            rows1.map(r => [r.reference, r.prix_achat])
        );

        // Map référence → date de disponibilité (utilisée comme date du mouvement d'entrée)
        const referenceToDateEntree = new Map<string, string>(
            rows1.map(r => [
                r.reference,
                r.date_availability_produit.toISOString().replace('T', ' ').split('.')[0],
            ])
        );

        // ── Phase 3 : Fichier 2 — Options, combinaisons ──────────────────────────
        console.info('[Import] Création des combinaisons (fichier2)…');
        const combinationKeys = await processFile2(rows2, referenceToId);

        // ── Phase 4 : Fichier 3 — Clients, paniers, commandes ───────────────────
        console.info('[Import] Création des commandes (fichier3)…');
        const orderOutputs = await processFile3(rows3, referenceToId);

        // 5a — Entrées initiales (depuis fichier 2)
        console.info('[Import] Création des stocks et mouvements de stock…');
        const stockEntries: StockEntryInput[] = rows2.flatMap((row) => {
            const idProduct = referenceToId.get(row.reference);
            if (!idProduct || row.stock_initial === 0) return [];

            let idProductAttribute: number;

            if (!row.specificite && !row.karazany) {
                idProductAttribute = 0;
            } else {
                const combinationId = combinationKeys.get(`${row.reference}:${row.karazany ?? ''}`);
                if (combinationId === undefined) {
                    console.warn(`Combination introuvable pour ${row.reference}:${row.karazany} — ignoré.`);
                    return [];
                }
                idProductAttribute = combinationId;
            }

            return [{
                idProduct: idProduct.product.id,
                idProductAttribute,
                quantity:    row.stock_initial,
                priceHT:     referenceToPriceHT.get(row.reference) ?? 0,
                reference:   row.reference,
                dateEntree:  referenceToDateEntree.get(row.reference) ?? '',
            }];
        });

        // 5b — Sorties commandes (depuis fichier 3, retourné par processFile3)
        // orderOutputs est déjà construit avec les idProduct et idProductAttribute résolus.

        await processStockMovements(stockEntries, orderOutputs);

    }

    console.info('[Import] Terminé.');
}