import { buildLangField, type LangMap } from '../../utils/xml-utils';
import type { 
  StockMovementReasonCreateInput, 
  StockMovementReasonUpdateInput 
} from './stock_movement_reasons.types';

// ─── Helpers de conversion ────────────────────────────────────────────────────

const toStr  = (v: string | number | undefined | null): string => v != null ? String(v) : '';
const toBool = (v: boolean | undefined): string => v === true ? '1' : v === false ? '0' : '';

// ─── POST : création complète ─────────────────────────────────────────────────

/**
 * Construit le XML body pour POST /api/stock_movement_reasons
 * On part du blank schema et on remplit les champs.
 */
export function buildStockMovementReasonPostXml(data: StockMovementReasonCreateInput): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
  <stock_movement_reason>
    <id><![CDATA[]]></id>
    <sign><![CDATA[${toStr(data.sign ?? '')}]]></sign>
    <deleted><![CDATA[${toBool(data.deleted)}]]></deleted>
    <date_add><![CDATA[${toStr(data.date_add ?? '')}]]></date_add>
    <date_upd><![CDATA[${toStr(data.date_upd ?? '')}]]></date_upd>
    ${buildLangField('name', data.name)}
  </stock_movement_reason>
</prestashop>`;
}

// ─── PATCH : mise à jour partielle ────────────────────────────────────────────

/**
 * Construit le XML body minimal pour PATCH /api/stock_movement_reasons/{id}
 */
export function buildStockMovementReasonPatchXml(
  id: number,
  data: Partial<StockMovementReasonUpdateInput>
): string {
  const lines: string[] = [];

  const fStr = (tag: string, val: string | number | null | undefined) => {
    if (val !== undefined) lines.push(`    <${tag}><![CDATA[${val ?? ''}]]></${tag}>`);
  };
  const fBool = (tag: string, val: boolean | undefined) => {
    if (val !== undefined) lines.push(`    <${tag}><![CDATA[${val ? '1' : '0'}]]></${tag}>`);
  };
  const fLang = (tag: string, val: LangMap | undefined) => {
    if (val !== undefined) lines.push(`    ${buildLangField(tag, val)}`);
  };

  fStr('sign', data.sign);
  fBool('deleted', data.deleted);
  fStr('date_add', data.date_add);
  fStr('date_upd', data.date_upd);
  fLang('name', data.name);

  return `<?xml version="1.0" encoding="UTF-8"?>
<prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
  <stock_movement_reason>
    <id><![CDATA[${id}]]></id>
${lines.join('\n')}
  </stock_movement_reason>
</prestashop>`;
}