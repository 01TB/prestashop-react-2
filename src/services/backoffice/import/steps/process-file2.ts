/* eslint-disable @typescript-eslint/no-explicit-any */
import type {Fichier2Row, ProductCSV} from "../../../../types/import/import.types.ts";
import {createProductOption, listProductOptions} from "../../../../resources/product_options/product_options.service.ts";
import {createProductOptionValue, listProductOptionValues} from "../../../../resources/product_option_values/product_option_values.service.ts";
import {listStockAvailables, updateStockAvailable} from "../../../../resources/stock_availables/stock_availables.service.ts";
import {createCombination} from "../../../../resources/combinations/combinations.service.ts";

/**
 * Retrouve le stock_available auto-créé par PrestaShop pour un produit/combination,
 * puis met à jour sa quantité via PATCH.
 *
 * @param idProduct            id du produit
 * @param idProductAttribute   id de la combination (0 = produit simple sans combination)
 * @param quantity             quantité à définir
 */
async function patchStockQuantity(
    idProduct: number,
    idProductAttribute: number,
    quantity: number
): Promise<void> {
    // PrestaShop crée toujours une entrée stock_available à la création
    // du produit ou de la combination. On la retrouve par filtre.
    const stocks = await listStockAvailables({
        'filter[id_product]':           String(idProduct),
        'filter[id_product_attribute]': String(idProductAttribute),
    });

    if (stocks.length === 0) {
        console.warn(
            `Aucun stock_available trouvé pour product=${idProduct}, attribute=${idProductAttribute}`
        );
        return;
    }

    const stock = stocks[0];
    await updateStockAvailable(stock.id, { quantity });
}

export async function processFile2(
    rows: Fichier2Row[],
    referenceToId: Map<string, ProductCSV>
): Promise<Map<string, number>> {       // clé : "reference:karazany" → id_combination

    const combinationKeys = new Map<string, number>();

    // Charger options et valeurs une seule fois
    const allOptions = await listProductOptions({ display: 'full' });
    const allValues  = await listProductOptionValues({ display: 'full' });

    for (const row of rows) {
        const product = referenceToId.get(row.reference)?.product;
        const tax = referenceToId.get(row.reference)?.tax;
        if (!product) {
            console.warn(`Produit introuvable pour la référence : ${row.reference}`);
            continue;
        }
        if (!tax) {
            console.warn(`Tax introuvable pour la référence : ${row.reference}`);
            continue;
        }

        // ── Cas 1 : ligne sans specificité ni karazany (produit simple) ──────────
        // Ex : C_03 et M_02 dans le fichier2 — on met juste le stock du produit.
        if (!row.specificite && !row.karazany) {
            await patchStockQuantity(product.id, 0, row.stock_initial);
            continue;
        }

        // ── Cas 2 : ligne avec specificité et karazany ────────────────────────────
        // 1. Product option
        let option = allOptions.find(
            o => o.name[1]?.toLowerCase() === row.specificite?.toLowerCase()
        );
        if (!option && row.specificite) {
            const newProductOptionId = await createProductOption({
                name:           { 1: row.specificite },
                public_name:    { 1: row.specificite },
                is_color_group: row.specificite.toLowerCase() === 'couleur',
                group_type:     row.specificite.toLowerCase() === 'couleur' ? 'color' : 'select',
            });
            option = { id: newProductOptionId, name: { 1: row.specificite } } as unknown as typeof allOptions[0];
            allOptions.push(option);
        }

        // 2. Product option value
        let optionValue = allValues.find(
            v =>
                v.id_attribute_group === option?.id &&
                v.name[1].toLowerCase() === row.karazany?.toLowerCase()
        );
        if (!optionValue && row.karazany && option) {
            const newProductOptionValueId = await createProductOptionValue({
                id_attribute_group: option.id,
                name:     { 1: row.karazany },
                color:    '',
                position: 0,
            });
            optionValue = {
                id: newProductOptionValueId,
                id_attribute_group: option.id,
                name: { 1: row.karazany }
            } as unknown as typeof allValues[0];
            allValues.push(optionValue);
        }

        if (!optionValue) continue;

        let deltaHT = 0;
        if(row.prix_vente_ttc != null) {
            const prixHT_Brut = row.prix_vente_ttc / (1 + tax.rate / 100);
            // 2. Arrondi à 6 décimales (précision SQL de PrestaShop)
            // On multiplie par 10^6, on arrondit, puis on divise par 10^6
            const prixHT_Cible = Math.round(prixHT_Brut * 1000000) / 1000000;
            deltaHT = prixHT_Cible - product.price;
        }

        // --- Logique default_on ---
        // On vérifie si une combinaison a déjà été créée pour ce produit via une propriété dynamique
        const isFirstCombination = !(product as any).hasCombination;

        // 3. Combination
        // Note : on ne passe PAS quantity ici — le stock est géré séparément
        // via stock_availables (PrestaShop crée l'entrée automatiquement).
        const combinationId = await createCombination({
            id_product: product.id,
            reference: row.reference,
            price:      deltaHT,
            default_on: isFirstCombination ? true : false, // Définit la 1ère combo comme défaut
            minimal_quantity: 1,
            product_option_values: [ { id: optionValue.id } ]
        });

        // Marquer le produit comme ayant déjà une combinaison pour les prochaines itérations
        (product as any).hasCombination = true;

        // 4. Mettre à jour le stock_available de la combination nouvellement créée
        // PrestaShop a créé un stock_available avec quantity=0 ; on le patch.
        await patchStockQuantity(product.id, combinationId, row.stock_initial);

        combinationKeys.set(`${row.reference}:${row.karazany ?? ''}`, combinationId);

    }

    return combinationKeys;
}