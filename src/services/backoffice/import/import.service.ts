import { parseFile1 }   from '../../../utils/parsers/import/parse-file1';
import { parseFile2 }   from '../../../utils/parsers/import/parse-file2';
import { parseFile3 }   from '../../../utils/parsers/import/parse-file3';
import { parseZip }     from '../../../utils/parsers/import/parse-zip';
import { processFile1 } from './steps/process-file1';
import { processFile2 } from './steps/process-file2';
import { uploadImages } from './steps/upload-images';
import { processFile3 } from './steps/process-file3';

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

        // ── Phase 3 : Fichier 2 — Options, combinaisons ──────────────────────────
        console.info('[Import] Création des combinaisons (fichier2)…');
        await processFile2(rows2, referenceToId);

        // ── Phase 4 : Images depuis le ZIP ───────────────────────────────────────
        console.info('[Import] Upload des images (zip)…');
        await uploadImages(imageMap, referenceToId);

        // ── Phase 5 : Fichier 3 — Clients, paniers, commandes ───────────────────
        console.info('[Import] Création des commandes (fichier3)…');
        await processFile3(rows3, referenceToId);

        console.info('[Import] Terminé.');
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

        // ── Phase 3 : Fichier 2 — Options, combinaisons ──────────────────────────
        console.info('[Import] Création des combinaisons (fichier2)…');
        await processFile2(rows2, referenceToId);

        // ── Phase 4 : Fichier 3 — Clients, paniers, commandes ───────────────────
        console.info('[Import] Création des commandes (fichier3)…');
        await processFile3(rows3, referenceToId);

        console.info('[Import] Terminé.');
    }
}