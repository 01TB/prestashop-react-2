/** Parse un string XML en Document DOM */
export function parseXml(xmlString: string): Document {
  return new DOMParser().parseFromString(xmlString, 'application/xml');
}

/** Sérialise un Document DOM en string XML */
export function serializeXml(doc: Document): string {
  return new XMLSerializer().serializeToString(doc);
}

/** Lit la valeur texte d'un nœud (CDATA ou texte simple) */
export function getNodeText(node: Element, tagName: string): string {
  return node.querySelector(tagName)?.textContent?.trim() ?? '';
}

/** Écrit la valeur texte d'un nœud existant */
export function setNodeText(doc: Document, parent: Element, tagName: string, value: string): void {
  const node = parent.querySelector(tagName);
  if (!node) return;
  // Vide le contenu et remet le texte
  while (node.firstChild) node.removeChild(node.firstChild);
  node.appendChild(doc.createTextNode(value));
}

/**
 * Map langue id → valeur texte.
 * Ex: { 1: "Mon produit", 2: "My product" }
 */
export type LangMap = Record<number, string>;

/**
 * Construit le XML pour un champ multilingue.
 * Si `langs` est vide ou undefined, génère un nœud vide pour la langue 1.
 *
 * Résultat:
 *   <name>
 *     <language id="1"><![CDATA[Mon produit]]></language>
 *     <language id="2"><![CDATA[My product]]></language>
 *   </name>
 */
export function buildLangField(tagName: string, langs?: LangMap): string {
  if (!langs || Object.keys(langs).length === 0) {
    return `<${tagName}>\n      <language id="1"><![CDATA[]]></language>\n    </${tagName}>`;
  }
  const inner = Object.entries(langs)
    .map(([id, val]) => `      <language id="${id}"><![CDATA[${val}]]></language>`)
    .join('\n');
  return `<${tagName}>\n${inner}\n    </${tagName}>`;
}

/** Lit un entier depuis un nœud texte. Retourne null si absent ou vide. */
export function getNodeInt(node: Element, tagName: string): number | null {
  const text = node.querySelector(tagName)?.textContent?.trim();
  if (!text) return null;
  const n = parseInt(text, 10);
  return isNaN(n) ? null : n;
}

/** Lit un flottant depuis un nœud texte. Retourne null si absent ou vide. */
export function getNodeFloat(node: Element, tagName: string): number | null {
  const text = node.querySelector(tagName)?.textContent?.trim();
  if (!text) return null;
  const n = parseFloat(text);
  return isNaN(n) ? null : n;
}

/** Lit un booléen PrestaShop ("0" | "1") depuis un nœud texte. */
export function getNodeBool(node: Element, tagName: string): boolean {
  return node.querySelector(tagName)?.textContent?.trim() === '1';
}

/**
 * Lit les entrées multilingues d'un nœud.
 * Ex: <name><language id="1">Bonjour</language><language id="2">Hello</language></name>
 * → { 1: 'Bonjour', 2: 'Hello' }
 */
export function getNodeLangMap(
  node: Element,
  tagName: string
): Record<number, string> {
  const wrapper = node.querySelector(tagName);
  if (!wrapper) return {};
  const result: Record<number, string> = {};
  for (const lang of Array.from(wrapper.querySelectorAll('language'))) {
    const id = parseInt(lang.getAttribute('id') ?? '0', 10);
    if (id) result[id] = lang.textContent?.trim() ?? '';
  }
  return result;
}

/**
 * Extrait la liste d'IDs d'un bloc d'associations simple.
 * Ex: <categories><category id="2"/><category id="5"/></categories>
 * → [2, 5]
 */
export function getAssocIds(node: Element, groupTag: string, itemTag: string): number[] {
  const group = node.querySelector(groupTag);
  if (!group) return [];
  return Array.from(group.querySelectorAll(itemTag))
    .map(el => parseInt(el.getAttribute('id') ?? el.textContent?.trim() ?? '0', 10))
    .filter(id => id > 0);
}

/**
 * Extrait la liste des IDs depuis une réponse de listing (sans display=full).
 * Ex: <orders><order id="1" .../><order id="2" .../></orders>
 * → [1, 2]
 */
export function parseIdList(doc: Document, itemTag: string): number[] {
  return Array.from(doc.querySelectorAll(itemTag))
    .map(el => parseInt(el.getAttribute('id') ?? '0', 10))
    .filter(id => id > 0);
}