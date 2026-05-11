/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { resetService } from '../../services/backoffice/reinitialisationService';

export const useReinitialisation = () => {
    const [isResetting, setIsResetting] = useState(false);
    const [progressMessage, setProgressMessage] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const triggerFullReset = async () => {
        setIsResetting(true);
        setError(null);
        setSuccess(false);

        try {
            setProgressMessage("Étape 1/6 : Nettoyage du SAV et des règles...");
            await resetService.clearSupport();

            setProgressMessage("Étape 2/6 : Nettoyage des transactions et paniers...");
            await resetService.clearTransactions();

            setProgressMessage("Étape 3/6 : Nettoyage des clients et adresses...");
            await resetService.clearCustomers();

            setProgressMessage("Étape 4/6 : Nettoyage des stocks et fournisseurs...");
            await resetService.clearSupplyAndStocks();

            setProgressMessage("Étape 5/6 : Nettoyage du catalogue complet...");
            await resetService.clearCatalog();

            setProgressMessage("Étape 6/6 : Nettoyage de la taxonomie (catégories)...");
            await resetService.clearTaxonomy();

            setProgressMessage("Réinitialisation terminée avec succès !");
            setSuccess(true);
        } catch (err: any) {
            setError(err.message || 'Une erreur est survenue lors de la réinitialisation.');
        } finally {
            setIsResetting(false);
        }
    };

    return { 
        isResetting, 
        progressMessage, 
        error, 
        success, 
        triggerFullReset 
    };
};