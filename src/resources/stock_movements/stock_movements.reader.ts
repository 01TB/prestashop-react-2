import { getNodeText } from '../../utils/xml-utils';
import type { StockMovement, StockMovementListItem, ProductNameMap } from './stock_movements.types';

/**
 * Stock Movement Reader
 * Handles parsing of XML responses from GET operations
 */

/**
 * Parses a single stock movement from XML DOM
 * Expects the root element to contain a <stock_mvt> node
 */
export function parseStockMovement(doc: Document): StockMovement {
  const mvt = doc.documentElement.querySelector('stock_mvt');

  if (!mvt) {
    throw new Error('Invalid stock movement XML: missing <stock_mvt> element');
  }

  // Parse multilingual product_name
  const productNameElem = mvt.querySelector('product_name');
  const productName = parseMultilingualField(productNameElem);

  return {
    id: parseInt(getNodeText(mvt, 'id'), 10),
    id_product: parseOptionalInt(getNodeText(mvt, 'id_product')),
    id_product_attribute: parseOptionalInt(getNodeText(mvt, 'id_product_attribute')),
    id_warehouse: parseOptionalInt(getNodeText(mvt, 'id_warehouse')),
    id_currency: parseOptionalInt(getNodeText(mvt, 'id_currency')),
    management_type: getNodeText(mvt, 'management_type') || undefined,
    id_employee: parseInt(getNodeText(mvt, 'id_employee'), 10),
    id_stock: parseInt(getNodeText(mvt, 'id_stock'), 10),
    id_stock_mvt_reason: parseInt(getNodeText(mvt, 'id_stock_mvt_reason'), 10),
    id_order: parseOptionalInt(getNodeText(mvt, 'id_order')),
    id_supply_order: parseOptionalInt(getNodeText(mvt, 'id_supply_order')),
    product_name: productName,
    ean13: getNodeText(mvt, 'ean13') || undefined,
    upc: getNodeText(mvt, 'upc') || undefined,
    reference: getNodeText(mvt, 'reference') || undefined,
    mpn: getNodeText(mvt, 'mpn') || undefined,
    physical_quantity: parseInt(getNodeText(mvt, 'physical_quantity'), 10),
    sign: parseInt(getNodeText(mvt, 'sign'), 10),
    last_wa: parseOptionalFloat(getNodeText(mvt, 'last_wa')),
    current_wa: parseOptionalFloat(getNodeText(mvt, 'current_wa')),
    price_te: parseFloat(getNodeText(mvt, 'price_te')),
    date_add: getNodeText(mvt, 'date_add'),
  };
}

/**
 * Parses a list of stock movements from XML DOM
 * Expects the root element to contain multiple <stock_mvt> nodes
 */
export function parseStockMovementList(doc: Document): StockMovement[] {
  const mvts = doc.documentElement.querySelectorAll('stock_mvt');
  const result: StockMovement[] = [];

  mvts.forEach((mvt) => {
    // Parse multilingual product_name
    const productNameElem = mvt.querySelector('product_name');
    const productName = parseMultilingualField(productNameElem);

    result.push({
      id: parseInt(getNodeText(mvt, 'id'), 10),
      id_product: parseOptionalInt(getNodeText(mvt, 'id_product')),
      id_product_attribute: parseOptionalInt(getNodeText(mvt, 'id_product_attribute')),
      id_warehouse: parseOptionalInt(getNodeText(mvt, 'id_warehouse')),
      id_currency: parseOptionalInt(getNodeText(mvt, 'id_currency')),
      management_type: getNodeText(mvt, 'management_type') || undefined,
      id_employee: parseInt(getNodeText(mvt, 'id_employee'), 10),
      id_stock: parseInt(getNodeText(mvt, 'id_stock'), 10),
      id_stock_mvt_reason: parseInt(getNodeText(mvt, 'id_stock_mvt_reason'), 10),
      id_order: parseOptionalInt(getNodeText(mvt, 'id_order')),
      id_supply_order: parseOptionalInt(getNodeText(mvt, 'id_supply_order')),
      product_name: productName,
      ean13: getNodeText(mvt, 'ean13') || undefined,
      upc: getNodeText(mvt, 'upc') || undefined,
      reference: getNodeText(mvt, 'reference') || undefined,
      mpn: getNodeText(mvt, 'mpn') || undefined,
      physical_quantity: parseInt(getNodeText(mvt, 'physical_quantity'), 10),
      sign: parseInt(getNodeText(mvt, 'sign'), 10),
      last_wa: parseOptionalFloat(getNodeText(mvt, 'last_wa')),
      current_wa: parseOptionalFloat(getNodeText(mvt, 'current_wa')),
      price_te: parseFloat(getNodeText(mvt, 'price_te')),
      date_add: getNodeText(mvt, 'date_add'),
    });
  });

  return result;
}

/**
 * Parses a list of IDs from stock movements (simple listing)
 * Used when getting /api/stock_movements without ?display=full
 */
export function parseStockMovementListIds(doc: Document): StockMovementListItem[] {
  const mvts = doc.documentElement.querySelectorAll('stock_mvt');
  const result: StockMovementListItem[] = [];

  mvts.forEach((mvt) => {
    const id = parseInt(getNodeText(mvt, 'id'), 10);
    const xlink = mvt.getAttribute('xlink:href');

    result.push({
      id,
      xlink: xlink ?? undefined,
    });
  });

  return result;
}

// ─── Helper Functions ──────────────────────────────────────────────────────────

/**
 * Parses a multilingual field (e.g., product_name)
 * Returns a map of language ID to text value
 */
function parseMultilingualField(elem: Element | null): ProductNameMap | undefined {
  if (!elem) return undefined;

  const langs: ProductNameMap = {};
  const langElements = elem.querySelectorAll('language');

  langElements.forEach((langElem) => {
    const langId = langElem.getAttribute('id');
    if (langId) {
      langs[parseInt(langId, 10)] = langElem.textContent?.trim() ?? '';
    }
  });

  return Object.keys(langs).length > 0 ? langs : undefined;
}

/**
 * Safely parses an optional integer from string
 */
function parseOptionalInt(str: string): number | undefined {
  if (!str || str === '0') return undefined;
  const num = parseInt(str, 10);
  return isNaN(num) ? undefined : num;
}

/**
 * Safely parses an optional float from string
 */
function parseOptionalFloat(str: string): number | undefined {
  if (!str || str === '0.000000') return undefined;
  const num = parseFloat(str);
  return isNaN(num) ? undefined : num;
}
