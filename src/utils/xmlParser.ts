/* eslint-disable @typescript-eslint/no-explicit-any */
import { XMLParser, XMLBuilder } from 'fast-xml-parser';

// Instance unique de XML Parser
export const psParser = new XMLParser({ 
  ignoreAttributes: false, 
  cdataPropName: "__cdata" 
});

export const psBuilder = new XMLBuilder({ 
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    cdataPropName: '__cdata',
    suppressEmptyNode: false,
});

/**
 * Fonction récursive pour nettoyer le JSON généré par fast-xml-parser.
 * Elle extrait automatiquement les valeurs de __cdata et #text, 
 * et supprime les objets complexes inutiles pour fournir un DTO propre.
 */
export const cleanPrestashopData = (data: any): any => {
  if (data === null || data === undefined) return data;

  // Si c'est un tableau, nettoyer chaque élément
  if (Array.isArray(data)) {
    return data.map((item) => cleanPrestashopData(item));
  }

  // Si c'est un objet
  if (typeof data === 'object') {
    // Aplatissement automatique des champs multi-langues de PrestaShop
    if (data.language !== undefined) {
      const isArray = Array.isArray(data.language);
      const langArray = isArray ? data.language : [data.language];
      // On récupère la valeur associée à la première langue (ou langue par défaut)
      const firstLang = langArray[0];
      if (firstLang === null || typeof firstLang !== 'object') {
        return firstLang;
      }
      if (firstLang.__cdata !== undefined) return firstLang.__cdata;
      if (firstLang['#text'] !== undefined) return firstLang['#text'];
      return firstLang;
    }

    // Le correctif : On priorise toujours la valeur interne (__cdata ou #text),
    // Même si un attribut href existe, on s'en fiche pour garder le DTO propre et typé avec de simples valeurs.
    if (data.__cdata !== undefined) return data.__cdata;
    if (data['#text'] !== undefined) return data['#text'];

    // Cas 3 : C'est un objet normal, on nettoie récursivement chaque propriété
    const cleanedObj: any = {};
    
    // Garder l'href UNIQUEMENT s'il n'y a pas de donnée interne (ex: lien image)
    if (data['@_xlink:href'] && Object.keys(data).filter(k => !k.startsWith('@_')).length === 0) {
      return { href: data['@_xlink:href'] };
    }

    for (const key in data) {
      // Ignorer les attributs fast-xml-parser
      if (key.startsWith('@_')) continue;
      cleanedObj[key] = cleanPrestashopData(data[key]);
    }
    
    // Aplatissement intelligent pour les listes PrestaShop (ex: associations>cart_rows>cart_row)
    for (const key in cleanedObj) {
      if (typeof cleanedObj[key] === 'object' && cleanedObj[key] !== null) {
        const subKeys = Object.keys(cleanedObj[key]);
        if (subKeys.length === 0) continue;
        const singleKey = subKeys[0];
        
        // Gestion des pluriels : "s" standard ou "y" -> "ies" (ex: category -> categories)
        const isPluralMatch = key === singleKey + 's' || key === singleKey.replace(/y$/, 'ies');

        if (subKeys.length === 1 && isPluralMatch) {
          // On force en tableau pour correspondre à nos DTOs
          const items = cleanedObj[key][singleKey];
          cleanedObj[key] = Array.isArray(items) ? items : [items];
        }
      }
    }

    return cleanedObj;
  }

  // Types primitifs (string, number, boolean) reviennent tels quels
  return data;
};

/**
 * Fonction englobante pour parser et nettoyer la réponse Axios en une seule fois
 */
export function extractPrestashopEntity<T>(xmlData: string, entityPath: string[]): T[] {
  const jsonRaw = psParser.parse(xmlData);
  
  // Naviguer dans jsonRaw (ex: prestashop -> products -> product)
  let target = jsonRaw;
  for (const path of entityPath) {
    if (target && target[path]) {
      target = target[path];
    } else {
      return []; // Introuvable
    }
  }

  // S'assurer que le résultat est un tableau
  const arrayTarget = Array.isArray(target) ? target : [target];

  const result = cleanPrestashopData(arrayTarget) as T[];

  console.log(result);
  
  // Appliquer le nettoyage
  return result;
}