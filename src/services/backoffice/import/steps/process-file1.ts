import type {Fichier1Row, ProductCSV} from "../../../../types/import/import.types.ts";
import {createCategory, listCategories} from "../../../../resources/categories/categories.service.ts";
import {createTax, listTaxes} from "../../../../resources/taxes/taxes.service.ts";
import {createTaxRuleGroup, listTaxRuleGroups} from "../../../../resources/tax_rule_groups/tax_rule_groups.service.ts";
import {createTaxRule, listTaxRules} from "../../../../resources/tax_rules/tax_rules.service.ts";
import {createProduct, getProduct} from "../../../../resources/products/products.service.ts";

/**
 * Retourne une Map<reference, id_product> après traitement complet.
 */
export async function processFile1(
    rows: Fichier1Row[]
): Promise<Map<string, ProductCSV>> {

    const referenceToId = new Map<string, ProductCSV>();

    const allCategories = await listCategories();
    const allTaxes = await listTaxes();
    const allTaxRuleGroups = await listTaxRuleGroups();
    const allTaxRules = await listTaxRules();

    for(const row of rows) {
        // 1. Catégorie
        let category = allCategories.find(
            c => c.name[1].toLowerCase() === row.categorie.toLowerCase()
        );
        if (!category) {
            const newIdCategory = await createCategory({
                name: { 1: row.categorie },
                active: true,
                id_parent: 2,
                id_shop_default: 1,
                link_rewrite: { 1: row.categorie.toLowerCase() }
            });
            category = { id: newIdCategory, name: { 1: row.categorie } } as unknown as typeof allCategories[0];
            allCategories.push(category);
        }

        // 2. Tax Rule Group (on crée un groupe par taux de taxe si nécessaire)
        const groupName = `TVA ${row.taxe}% Eval`;
        let taxRuleGroup = allTaxRuleGroups.find(
            g => g.name.toLowerCase() === groupName.toLowerCase()
        );
        if (!taxRuleGroup) {
            const newIdTaxRuleGroup = await createTaxRuleGroup({
                name: groupName,
                active: true,
                deleted: false
            });
            taxRuleGroup = { id: newIdTaxRuleGroup, name: groupName } as unknown as typeof allTaxRuleGroups[0];
            allTaxRuleGroups.push(taxRuleGroup);
        }

        // 3. Taxe
        let tax = allTaxes.find(t =>
            t.rate === row.taxe && t.name[1] === groupName
        );
        if (!tax) {
            const newIdTax = await createTax({
                rate: row.taxe,
                active: true,
                deleted: false,
                name: { 1 : groupName}
            });
            tax = { id: newIdTax, rate: row.taxe, name: { 1: groupName } } as unknown as typeof allTaxes[0];
            allTaxes.push(tax);
        }

        // 4. Tax Rule (lien tax_rule_group ↔ taxe)
        let taxRule = allTaxRules.find(
            r => r.id_tax_rules_group === taxRuleGroup.id && r.id_tax === tax.id
        );
        if (!taxRule) {
            const newIdTaxRule = await createTaxRule({
                id_tax_rules_group: taxRuleGroup.id,
                id_tax: tax.id,
                id_country: 8,   // France
                id_state: 0,
                zipcode_from: '0',
                zipcode_to: '0',
                behavior: 0,
            });
            taxRule = { id: newIdTaxRule, id_tax_rules_group: taxRuleGroup!.id, id_tax: tax!.id } as unknown as typeof allTaxRules[0];;
            allTaxRules.push(taxRule);
        }

        // 5. Produit
        // Convertir la date au format PrestaShop : "YYYY-MM-DD "
        const availableDate = row.date_availability_produit
            .toISOString()
            .split('T')[0];
        const priceHT = row.prix_ttc / (1 + tax.rate / 100);

        const newIdProduct = await createProduct({
            new: '1',
            id_shop_default: 1,
            reference: row.reference,
            product_type: 'combinations',
            name: {1: row.nom},
            price: priceHT,           // prix TTC (PrestaShop gère la taxe via id_tax_rules_group)
            wholesale_price: row.prix_achat,
            id_category_default: category.id,
            id_tax_rules_group: taxRuleGroup.id,
            available_date: availableDate,
            available_for_order: true,
            link_rewrite: {1: row.nom.toLowerCase()},
            active: true,
            show_price: true,
            visibility: 'both',
            state: 1,
            categories: [ { id: category.id } ],
        })

        const newProduct = await getProduct(newIdProduct);

        referenceToId.set(row.reference, { product: newProduct, tax: tax });
    }

    return referenceToId;
}