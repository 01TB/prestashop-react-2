/* eslint-disable @typescript-eslint/no-explicit-any */
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
        if (!files.file1 || !files.file2 || !files.file3) {
            setStatus('Veuillez sélectionner au moins les 3 fichiers CSV.');
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

    const selectedFileName = (file: File | null) => file?.name ?? 'Aucun fichier sélectionné';

    return (
        <div className="card shadow mb-4">
            <div className="card-header py-3 d-flex flex-column flex-md-row align-items-md-center justify-content-between">
                <div>
                    <h6 className="m-0 font-weight-bold text-primary">Import PrestaShop</h6>
                    <p className="text-gray-500 mb-0 small">Importez vos CSV et vos images produits en une seule opération.</p>
                </div>
                <span className="badge badge-info text-uppercase mt-2 mt-md-0">Backoffice</span>
            </div>

            <div className="card-body">
                {status && (
                    <div className={`alert ${status.startsWith('Erreur') ? 'alert-danger' : 'alert-info'}`} role="alert">
                        {status}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="user">
                    <div className="form-row">
                        <div className="form-group col-lg-6">
                            <label className="font-weight-bold text-gray-800">Fichier 1 — Produits de base (.csv)</label>
                            <input
                                type="file"
                                accept=".csv"
                                className="form-control-file"
                                onChange={handleFile('file1')}
                            />
                            <small className="text-gray-500 d-block mt-1">{selectedFileName(files.file1)}</small>
                        </div>

                        <div className="form-group col-lg-6">
                            <label className="font-weight-bold text-gray-800">Fichier 2 — Spécificités / Combinaisons (.csv)</label>
                            <input
                                type="file"
                                accept=".csv"
                                className="form-control-file"
                                onChange={handleFile('file2')}
                            />
                            <small className="text-gray-500 d-block mt-1">{selectedFileName(files.file2)}</small>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group col-lg-6">
                            <label className="font-weight-bold text-gray-800">Fichier 3 — Commandes clients (.csv)</label>
                            <input
                                type="file"
                                accept=".csv"
                                className="form-control-file"
                                onChange={handleFile('file3')}
                            />
                            <small className="text-gray-500 d-block mt-1">{selectedFileName(files.file3)}</small>
                        </div>

                        <div className="form-group col-lg-6">
                            <label className="font-weight-bold text-gray-800">Images produits (.zip)</label>
                            <input
                                type="file"
                                accept=".zip"
                                className="form-control-file"
                                onChange={handleFile('zip')}
                            />
                            <small className="text-gray-500 d-block mt-1">{selectedFileName(files.zip)}</small>
                        </div>
                    </div>

                    <div className="d-flex flex-column flex-sm-row align-items-stretch align-items-sm-center justify-content-between mt-4">
                        <button type="submit" className="btn btn-primary btn-lg px-4" disabled={loading}>
                            {loading ? 'Import en cours…' : 'Lancer l\'import'}
                        </button>
                        <div className="text-gray-500 small mt-3 mt-sm-0 ml-sm-3">
                            Les trois fichiers CSV sont requis. Le ZIP est facultatif.
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
