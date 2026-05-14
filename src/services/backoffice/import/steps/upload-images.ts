import api from '../../../../services/api';
import type {ProductCSV} from "../../../../types/import/import.types.ts";

export async function uploadImages(
    imageMap: Map<string, File>,
    referenceToId: Map<string, ProductCSV>
): Promise<void> {
    for (const [reference, imageFile] of imageMap.entries()) {
        const product = referenceToId.get(reference)?.product;
        if (!product) {
            console.warn(`Aucun produit trouvé pour l'image : ${reference}`);
            continue;
        }

        const formData = new FormData();
        formData.append('image', imageFile, imageFile.name);

        try {
            await api.post(
                `/images/products/${product.id}`,
                formData,
                {
                    headers: {
                        // Surcharger Content-Type pour ce seul appel :
                        // axios le définit automatiquement avec le boundary
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            console.info(`Image uploadée : ${reference} → product #${product.id}`);
        } catch (err) {
            console.error(`Erreur upload image ${reference}:`, err);
        }
    }
}