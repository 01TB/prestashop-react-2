import { Fichier2Row} from "../../../../types/import/import.types.ts";
import {listProductOptions} from "../../../../resources/product_options/product_options.service.ts";
import {listProductOptionValues} from "../../../../resources/product_option_values/product_option_values.service.ts";

export async function processFile2(
    rows: Fichier2Row[],
    referenceToId: Map<string, number>
): Promise<void> {

    // Charger options et valeurs une seule fois
    let allOptions = await listProductOptions();
    let allValues  = await listProductOptionValues();

    for (const row of rows) {
        const idProduct = referenceToId.get(row.reference);
        if (!idProduct) {
            console.warn(`Produit introuvable pour la référence : ${row.reference}`);
            continue;
        }
    }

}