// ─── Fichier 1 : produits de base ────────────────────────────────────────────
export interface Fichier1Row {
    date_availability_produit: Date;   // parsé depuis "DD/MM/YYYY"
    nom: string;
    reference: string;
    prix_ttc: number;                  // parsé depuis "12,5" ou 18.99
    taxe: number;                      // parsé depuis "11,65%" → 11.65
    categorie: string;
    prix_achat: number;                // parsé depuis "8,5" ou 2
}

// ─── Fichier 2 : spécificités et combinaisons ────────────────────────────────
export interface Fichier2Row {
    reference: string;
    specificite: string | null;        // peut être vide
    karazany: string | null;           // peut être vide
    stock_initial: number;
    prix_vente_ttc: number | null;     // peut être vide
}

// ─── Fichier 3 : commandes clients ───────────────────────────────────────────
export interface Fichier3Row {
    date: Date;                        // parsé depuis "DD/MM/YYYY"
    nom: string;
    email: string;
    pwd: string;
    adresse: string;
    achats: OrderItem[];               // parsé depuis la colonne "achat"
    etat: string | null;
}

export interface OrderItem {
    reference: string;   // ex: "T_01"
    quantite: number;    // ex: 2
    karazany: string;    // ex: "kely" (peut être vide "")
}