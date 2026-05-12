import { useState } from 'react';
import { useReinitialisation } from '../../../../hooks/backoffice/useReinitialisation';

function ResetDatabase() {
    const { isResetting, progressMessage, error, success, triggerFullReset } = useReinitialisation();
    const [showConfirm, setShowConfirm] = useState(false);
    const [confirmText, setConfirmText] = useState('');

    const handleReset = () => {
        if (confirmText === 'CONFIRMER') {
            setShowConfirm(false);
            triggerFullReset();
            setConfirmText('');
        }
    };

    return (
        <div className="card shadow mb-4 border-left-danger">
            <div className="card-header py-3">
                <h6 className="m-0 font-weight-bold text-danger">Zone de Réinitialisation</h6>
            </div>
            <div className="card-body">
                <p className="mb-4">
                    Cette action est <strong>irréversible</strong>. Elle supprimera l'intégralité 
                    des commandes, flux de stocks, clients, produits, caractéristiques et 
                    catégories de votre boutique PrestaShop, et les remettra à plat.
                </p>
                
                {!showConfirm ? (
                    <button 
                        className="btn btn-danger" 
                        onClick={() => setShowConfirm(true)}
                        disabled={isResetting}
                    >
                        Vider la boutique PrestaShop
                    </button>
                ) : (
                    <div className="alert alert-warning">
                        <p>Êtes-vous absolument sûr ? Tapez <strong>CONFIRMER</strong> en majuscules pour valider.</p>
                        <input 
                            type="text" 
                            className="form-control mb-3" 
                            style={{ maxWidth: '300px' }}
                            value={confirmText} 
                            onChange={(e) => setConfirmText(e.target.value)}
                            placeholder="CONFIRMER"
                            disabled={isResetting}
                        />
                        <button 
                            className="btn btn-danger mr-2" 
                            onClick={handleReset} 
                            disabled={confirmText !== 'CONFIRMER' || isResetting}
                        >
                            Je confirme la suppression
                        </button>
                        <button 
                            className="btn btn-secondary ml-2" 
                            onClick={() => setShowConfirm(false)}
                            disabled={isResetting}
                        >
                            Annuler
                        </button>
                    </div>
                )}

                {isResetting && (
                    <div className="mt-4 alert alert-info">
                        <strong>Action en cours :</strong> {progressMessage}
                    </div>
                )}

                {success && !isResetting && (
                    <div className="mt-4 alert alert-success">
                        <strong>Succès !</strong> {progressMessage}
                    </div>
                )}

                {error && (
                    <div className="mt-4 alert alert-danger">
                        <strong>Erreur :</strong> {error}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResetDatabase;