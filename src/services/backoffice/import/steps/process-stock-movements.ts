import {
    createStock, getStock, updateStock,
} from '../../../../resources/stocks/stocks.service';
import {
    listStockMovementReasons,
    createStockMovementReason,
} from '../../../../resources/stock_movement_reasons/stock_movement_reasons.service';
import {
    createStockMovement,
} from '../../../../resources/stock_movements/stock_movements.service';
import type {
    StockMovementReasonOutput
} from "../../../../resources/stock_movement_reasons/stock_movement_reasons.types.ts";

/** Id de l'entrepôt par défaut PrestaShop (adapter selon la configuration). */
const DEFAULT_WAREHOUSE_ID = 1;

/** Id de l'employé administrateur PrestaShop (adapter si nécessaire). */
const DEFAULT_EMPLOYEE_ID = 1;

const REASON_NAME_IN  = 'Approvisionnement initial';
const REASON_NAME_OUT = 'Sortie commande';

/**
 * Résout ou crée un motif de mouvement de stock par son libellé et son signe.
 */
async function resolveReason(
    allReasons: StockMovementReasonOutput[],
    name: string,
    sign: 1 | -1
): Promise<number> {
    const existing = allReasons.find(r => r.name[1]?.toLowerCase() === name.toLowerCase());
    if (existing) return existing.id;
    return createStockMovementReason({ name: { 1: name }, sign });
}

/** Entrée initiale (depuis fichier 2) — génère un POST stocks + POST stock_movement sign=1. */
export interface StockEntryInput {
    idProduct: number;
    idProductAttribute: number;  // 0 = produit simple
    quantity: number;
    priceHT: number;             // wholesale_price du fichier 1
    reference?: string;
    dateEntree: string;          // "YYYY-MM-DD HH:MM:SS" — date_availability_produit du produit (fichier 1)
}

/** Sortie commande (depuis fichier 3) — génère un POST stock_movement sign=-1. */
export interface StockOrderOutput {
    idProduct: number;
    idProductAttribute: number;
    quantity: number;
    priceHT: number;             // prix de vente HT de la ligne de commande
    dateCommande: string;        // "YYYY-MM-DD HH:MM:SS"
}

/**
 * Clé canonique pour retrouver l'id_stock dans la map interne.
 * Format : "idProduct:idProductAttribute"
 */
function stockKey(idProduct: number, idProductAttribute: number): string {
    return `${idProduct}:${idProductAttribute}`;
}

/**
 * 6a — Crée les entrées stocks et les mouvements d'entrée initiaux (sign=1).
 * Retourne une map stockKey → id_stock, nécessaire pour l'étape 6b.
 */
export async function processInitialStockEntries(
    entries: StockEntryInput[],
    reasonInId: number
): Promise<Map<string, number>> {
    const stockIdMap = new Map<string, number>();

    for (const entry of entries) {
        try {
            // 1. Créer l'entrée stocks (n'existe pas encore côté PrestaShop)
            const idStock = await createStock({
                id_warehouse:         DEFAULT_WAREHOUSE_ID,
                id_product:           entry.idProduct,
                id_product_attribute: entry.idProductAttribute,
                physical_quantity:    entry.quantity,
                usable_quantity:      entry.quantity,
                price_te:             entry.priceHT,
                reference:            entry.reference ?? '',
            });

            // Mémoriser pour l'étape 6b
            stockIdMap.set(stockKey(entry.idProduct, entry.idProductAttribute), idStock);

            // 2. Mouvement d'entrée initiale
            await createStockMovement({
                id_stock:            idStock,
                id_stock_mvt_reason: reasonInId,
                id_employee:         DEFAULT_EMPLOYEE_ID,
                physical_quantity:   entry.quantity,
                sign:                1,
                price_te:            entry.priceHT,
                date_add:            entry.dateEntree,  // date_availability_produit du produit (fichier 1)
            });

            console.info(
                `[6a] Stock + entrée créés : product=${entry.idProduct}, ` +
                `attribute=${entry.idProductAttribute}, qty=${entry.quantity}`
            );
        } catch (err) {
            console.error(
                `[6a] Erreur pour product=${entry.idProduct}, attribute=${entry.idProductAttribute}:`,
                err
            );
        }
    }

    return stockIdMap;
}

/**
 * 6b — Crée les mouvements de sortie pour les articles commandés (sign=-1).
 * S'appuie sur la map stockIdMap retournée par processInitialStockEntries.
 */
export async function processOrderStockOutputs(
    outputs: StockOrderOutput[],
    stockIdMap: Map<string, number>,
    reasonOutId: number
): Promise<void> {
    for (const output of outputs) {
        const idStock = stockIdMap.get(stockKey(output.idProduct, output.idProductAttribute));

        if (idStock === undefined) {
            console.warn(
                `[6b] id_stock introuvable pour product=${output.idProduct}, ` +
                `attribute=${output.idProductAttribute} — mouvement de sortie ignoré.`
            );
            continue;
        }

        try {
            await createStockMovement({
                id_stock:            idStock,
                id_stock_mvt_reason: reasonOutId,
                id_employee:         DEFAULT_EMPLOYEE_ID,
                physical_quantity:   output.quantity,
                sign:                -1,
                price_te:            output.priceHT,
                date_add:            output.dateCommande,
            });

            const stock = await getStock(idStock);
            await updateStock(idStock, {
               physical_quantity: stock.physical_quantity - output.quantity,
               usable_quantity: stock.physical_quantity - output.quantity,
            });

            console.info(
                `[6b] Sortie créée : product=${output.idProduct}, ` +
                `attribute=${output.idProductAttribute}, qty=${output.quantity}`
            );
        } catch (err) {
            console.error(
                `[6b] Erreur sortie pour product=${output.idProduct}, ` +
                `attribute=${output.idProductAttribute}:`,
                err
            );
        }
    }
}

/**
 * Point d'entrée unique appelé par runImport.
 * Orchestre 6a puis 6b après avoir résolu les deux motifs.
 */
export async function processStockMovements(
    entries: StockEntryInput[],
    outputs: StockOrderOutput[]
): Promise<void> {
    // Étape 0 — charger et résoudre les deux motifs en une seule requête GET
    const allReasons = await listStockMovementReasons({ display: 'full' });
    const [reasonInId, reasonOutId] = await Promise.all([
        resolveReason(allReasons, REASON_NAME_IN,  1),
        resolveReason(allReasons, REASON_NAME_OUT, -1),
    ]);

    // 6a — entrées initiales + construction de la map id_stock
    const stockIdMap = await processInitialStockEntries(entries, reasonInId);

    // 6b — sorties commandes
    await processOrderStockOutputs(outputs, stockIdMap, reasonOutId);
}
