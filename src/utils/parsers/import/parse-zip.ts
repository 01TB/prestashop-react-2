import JSZip from 'jszip';

/**
 * Extrait le ZIP et retourne une Map<reference, File>
 * La reference est le nom de fichier sans extension (ex: "C_03")
 */
export async function parseZip(zipFile: File): Promise<Map<string, File>> {
    const zip = await JSZip.loadAsync(zipFile);
    const imageMap = new Map<string, File>();

    const imageExtensions = /\.(png|jpe?g|gif|webp|bmp)$/i;

    await Promise.all(
        Object.entries(zip.files).map(async ([filename, zipEntry]) => {
            if (zipEntry.dir) return;

            // Ne retenir que les images (ignorer les fichiers cachés macOS, etc.)
            const basename = filename.split('/').pop() ?? '';
            if (!imageExtensions.test(basename)) return;

            // Référence = nom de fichier sans extension
            const reference = basename.replace(/\.[^.]+$/, '');

            const blob = await zipEntry.async('blob');
            const mimeType = basename.match(/\.jpe?g$/i)
                ? 'image/jpeg'
                : `image/${basename.split('.').pop()!.toLowerCase()}`;
            const file = new File([blob], basename, { type: mimeType });

            imageMap.set(reference, file);
        })
    );

    return imageMap;
}