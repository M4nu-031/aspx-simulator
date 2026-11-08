import { utils, writeFile } from 'xlsx';
import type { TenantView } from './metrics';
import { cellText, type ColumnSpec } from './columns';

/** Build export rows: numbers stay numeric, everything else uses the on-screen format. */
export function buildExportRows(rows: TenantView[], cols: ColumnSpec[]): Record<string, string | number>[] {
  return rows.map((t) => {
    const o: Record<string, string | number> = {};
    cols.forEach((c) => {
      const raw = c.value(t);
      o[c.header] = (c.format === 'int' || c.format === 'usd') && typeof raw === 'number' && !c.display ? raw : cellText(c, t);
    });
    return o;
  });
}

export function downloadRows(rows: TenantView[], cols: ColumnSpec[], kind: 'csv' | 'xlsx') {
  const data = buildExportRows(rows, cols);
  const ws = utils.json_to_sheet(data, { header: cols.map((c) => c.header) });
  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, 'Copilot Opportunities');
  const stamp = new Date().toISOString().slice(0, 10);
  writeFile(wb, `ASPX_Simulator_CopilotOpportunities_${stamp}.${kind}`, { bookType: kind });
}
