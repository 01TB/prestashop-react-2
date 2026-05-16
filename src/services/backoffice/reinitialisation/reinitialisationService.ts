import api from '../../api.ts';
import { extractPrestashopEntity } from '../../../utils/xmlParser.ts';

/**
 * Traite les suppressions par petits groupes (lots).pour éviter
 * d'inonder le serveur de requêtes et de déclencher un Rate Limit (429) ou un crash (500).
 * Utilise allSettled pour ne pas stopper la boucle si une suppression échoue.
 */
async function processInBatches<T>(items: T[], batchSize: number, processor: (item: T) => Promise<void>) {
    for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        // On utilise allSettled au lieu de all
        await Promise.allSettled(batch.map(processor));
    }
}
/**
 * Récupère tous les IDs d'une ressource donnée et les supprime.
 * 
 * @param resource Le nom au pluriel du paramètre de l'API (ex: 'products')
 * @param singularName Le nom au singulier dans le XML retourné (ex: 'product')
 * @param ignoreIds Les identifiants à ne jamais supprimer (pour protéger les éléments par défaut de Prestashop)
 */
async function deleteAll(resource: string, singularName: string, ignoreIds: number[] = []) {
    try {
        const response = await api.get(`/${resource}?display=[id]`);
        
        // Extraction générique via notre utilitaire XML
        const entities = extractPrestashopEntity<{id: number}>(response.data, ['prestashop', resource, singularName]);
        
        // Sécurité si aucune entité n'est trouvée
        if (!entities || entities.length === 0) return;

        const idsToDelete = [];
        for (const entity of entities) {
            // On force la conversion en Number pour garantir la comparaison
            const currentId = Number(entity.id);
            if (!ignoreIds.includes(currentId)) {
                idsToDelete.push(currentId);
            }
        }

        // const idsToDelete = entities
        //     .map(e => e.id)
        //     .filter(id => !ignoreIds.includes(id));

        if (idsToDelete.length === 0) return;

        console.log("[" + resource + "] => [" + idsToDelete + "] et toDelete [" + ignoreIds + "]");

        // Suppression par lot de 5 pour ménager le serveur de PrestaShop
        await processInBatches(idsToDelete, 5, (id) => api.delete(`/${resource}/${id}`));
    } catch (error) {
        console.error(`Erreur lors de la suppression de ${resource}:`, error);
        // On continue même s'il y a une erreur 404 (ressource vide) ou autre
    }
}

export const resetService = {
    clearSupport: async () => {
        await deleteAll('customer_threads', 'customer_thread');
        await deleteAll('customer_messages', 'customer_message');
        await deleteAll('cart_rules', 'cart_rule');
    },
    clearTransactions: async () => {
        await deleteAll('order_payments', 'order_payment');
        await deleteAll('order_histories', 'order_history');
        await deleteAll('order_invoices', 'order_invoice');
        await deleteAll('order_slip', 'order_slips');
        await deleteAll('order_details', 'order_detail');
        await deleteAll('orders', 'order');
        await deleteAll('carts', 'cart');
    },
    clearCustomers: async () => {
        await deleteAll('addresses', 'address',[3]);
        await deleteAll('guests', 'guest');
        await deleteAll('customers', 'customer',[1]);
    },
    clearSupplyAndStocks: async () => {
        await deleteAll('stock_movements', 'stock_movement');
        await deleteAll('stock_movement_reasons', 'stock_movement_reason');
        await deleteAll('stocks', 'stock');
        await deleteAll('stock_availables', 'stock_available');
        await deleteAll('supply_order_details', 'supply_order_detail');
        await deleteAll('supply_order_histories', 'supply_order_history');
        await deleteAll('supply_orders', 'supply_order');
        await deleteAll('suppliers', 'supplier');
        await deleteAll('manufacturers', 'manufacturer'); // API: manufacturers
    },
    clearCatalog: async () => {
        await deleteAll('specific_prices', 'specific_price');
        await deleteAll('images', 'image');
        await deleteAll('combinations', 'combination');
        await deleteAll('product_option_values', 'product_option_value');
        await deleteAll('product_options', 'product_option');
        await deleteAll('product_feature_values', 'product_feature_value');
        await deleteAll('product_features', 'product_feature');
        await deleteAll('tags', 'tag');
        await deleteAll('attachments', 'attachment');
        await deleteAll('products', 'product');
    },
    clearTaxonomy: async () => {
        // L'ID 1 (Root) et 2 (Accueil) doivent absolument être conservés !
        await deleteAll('taxes', 'tax');
        await deleteAll('tax_rules', 'tax_rule');
        await deleteAll('tax_rule_groups', 'tax_rule_group');
        await deleteAll('categories', 'category', [1, 2]);
        // await deleteAll('deliveries', 'delivery');
        // await deleteAll('carriers', 'carrier');
    }
};
