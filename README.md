# Boutique PrestaShop headless – React / TypeScript

Front-office et back-office React 19 / TypeScript branchés sur une boutique **PrestaShop 8.2.6** via ses **Web Services (XML)**. PrestaShop reste le moteur (catalogue, paniers, commandes, stocks, taxes) ; l'interface est entièrement découplée.

Projet réalisé pour l'évaluation finale de Licence 3 Informatique à l'IT University (Antananarivo, mai 2026), sur plusieurs jours avec un cahier des charges qui évoluait chaque jour.

## Fonctionnalités

**Front-office (client)**
- Catalogue et fiche produit (déclinaisons, prix TTC, réductions)
- Panier, tunnel de commande et confirmation
- Gestion des adresses, historique « Mes commandes »

**Back-office (administration)**
- Tableau de bord, produits, catégories, paniers
- Commandes : détail et changement d'état (expédiée, livrée, annulée)
- Prix spécifiques et règles de réduction
- Stocks : ajout, évolution journalière, résumé par catégorie, mouvements de stock
- Statistiques des produits vendus
- **Import en plusieurs étapes** à partir de fichiers CSV / ZIP : produits, déclinaisons, commandes, mouvements de stock et images
- Réinitialisation des données de la boutique

## Architecture

```
React (Vite)  ──/api──▶  proxy Vite (ajoute la clé Webservice)  ──▶  PrestaShop 8.2.6 /api (XML)  ──▶  MySQL
```

- **Appels API** : axios, sérialisation et lecture du XML avec `fast-xml-parser`, une couche `services/` par domaine (backoffice / frontoffice).
- **Clé Webservice** : elle n'est pas embarquée dans le code du navigateur. Le proxy de développement de Vite l'ajoute en en-tête `Authorization` (voir `vite.config.ts`).
- **Côté PrestaShop**, un module PHP sur mesure (non inclus dans ce dépôt) ajoute une ressource Webservice qui change l'état d'une commande en déclenchant la logique native de PrestaShop (historique, mouvements de stock, e-mails).
- Import CSV avec `papaparse`, archives d'images avec `jszip`.

## Lancer le projet

Prérequis : Node.js 20+, une boutique PrestaShop 8 avec le Webservice activé et une clé ayant les droits nécessaires.

```bash
cp ".env example" .env   # renseigner VITE_API_TARGET et VITE_PRESTASHOP_KEY
npm install
npm run dev              # http://localhost:5173
```

## Limites connues

Ce projet a été construit dans le temps limité d'une évaluation :
- La connexion au back-office est vérifiée côté client (identifiants dans `.env`). En production, il faudrait une authentification côté serveur.
- Le proxy qui protège la clé Webservice n'existe qu'en développement. En production, il faudrait un petit serveur intermédiaire (ou un module PrestaShop) pour garder la clé côté serveur.

## Stack

React 19 · TypeScript · Vite · React Router 7 · Bootstrap 5 / Sass · axios · PrestaShop 8.2.6 (Webservice XML) · MySQL
