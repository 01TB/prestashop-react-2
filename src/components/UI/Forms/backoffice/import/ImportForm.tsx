import React, { useState } from 'react';
import { runImport } from '../../../../../services/backoffice/import/import.service';

interface ImportFiles {
    file1: File | null;
    file2: File | null;
    file3: File | null;
    zip: File | null;
}

export function ImportForm() {
    const [files, setFiles] = useState<ImportFiles>({
        file1: null, file2: null, file3: null, zip: null,
    });
    const [status, setStatus] = useState<string>('');
    const [loading, setLoading] = useState(false);

    const handleFile = (key: keyof ImportFiles) =>
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setFiles(prev => ({ ...prev, [key]: e.target.files?.[0] ?? null }));
        };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!files.file1 || !files.file2 || !files.file3 || !files.zip) {
            setStatus('Veuillez sélectionner les 4 fichiers.');
            return;
        }
        setLoading(true);
        setStatus('Import en cours…');
        try {
            await runImport(files.file1, files.file2, files.file3, files.zip);
            setStatus('Import terminé avec succès.');
        } catch (err: any) {
            setStatus(`Erreur : ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Import PrestaShop</h2>

            <label>Fichier 1 — Produits de base (.csv)
                <input type="file" accept=".csv" onChange={handleFile('file1')} />
            </label>

            <label>Fichier 2 — Spécificités / Combinaisons (.csv)
                <input type="file" accept=".csv" onChange={handleFile('file2')} />
            </label>

            <label>Fichier 3 — Commandes clients (.csv)
                <input type="file" accept=".csv" onChange={handleFile('file3')} />
            </label>

            <label>Images produits (.zip)
                <input type="file" accept=".zip" onChange={handleFile('zip')} />
            </label>

            <button type="submit" disabled={loading}>
                {loading ? 'Import en cours…' : 'Lancer l\'import'}
            </button>

            {status && <p>{status}</p>}
        </form>
    );
}
