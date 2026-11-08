import { useMemo, useState } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';
import { Tooltip } from '@fluentui/react-components';
import { ArrowDown12Regular, ArrowUp12Regular } from '@fluentui/react-icons';
import { cellText, columnById, COLUMNS, GROUPS, type ColumnSpec, type Raw } from '../../lib/columns';
import type { TenantView } from '../../lib/metrics';
import { NA } from '../../lib/format';
import { useApp, useData } from '../../store';
import { TipContent, TrainingBadge } from '../InfoTip';

function compare(a: Raw, b: Raw): number {
  if (a == null && b == null) return 0;
  if (a == null) return -1;
  if (b == null) return 1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  if (typeof a === 'boolean' && typeof b === 'boolean') return Number(a) - Number(b);
  return String(a).localeCompare(String(b));
}

/** First column number used for column-group training badges (KPIs 1–8, charts 9–13). */
export const GROUP_BADGE_START = 14;

export function OpportunityTable() {
  const { tableRows } = useData();
  const columnVisibility = useApp((s) => s.columnVisibility);
  const columnOrder = useApp((s) => s.columnOrder);
  const openPanel = useApp((s) => s.openPanel);
  const training = useApp((s) => s.training);
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useMemo<ColumnDef<TenantView>[]>(
    () =>
      COLUMNS.map((c) => ({
        id: c.id,
        accessorFn: (row: TenantView) => c.value(row),
        header: c.header,
        size: c.width ?? 110,
        sortingFn: (a, b, id) => compare(a.getValue(id) as Raw, b.getValue(id) as Raw),
        cell: (ctx) => <Cell spec={c} t={ctx.row.original} onOpen={openPanel} />,
      })),
    [openPanel],
  );

  const table = useReactTable({
    data: tableRows,
    columns,
    state: { sorting, columnVisibility, columnOrder },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId: (r) => String(r.caseNo),
  });

  const leaf = table.getVisibleLeafColumns();
  // Consecutive visible columns sharing a group form one band cell.
  const bands: { group: string; span: number }[] = [];
  leaf.forEach((col) => {
    const g = columnById(col.id)!.group;
    const last = bands[bands.length - 1];
    if (last && last.group === g) last.span++;
    else bands.push({ group: g, span: 1 });
  });
  const totalWidth = leaf.reduce((s, c) => s + c.getSize(), 0);

  return (
    <div className="table-wrap" id="opportunity-table" data-tour="table" tabIndex={0} aria-label="Copilot Opportunities table, scrollable">
      <table className={`grid${training ? ' with-band' : ''}`} style={{ width: totalWidth }} aria-rowcount={tableRows.length + 1}>
        <caption className="sr-only">Copilot Opportunities — {tableRows.length} tenants</caption>
        <colgroup>
          {leaf.map((c) => (
            <col key={c.id} style={{ width: c.getSize() }} />
          ))}
        </colgroup>
        <thead>
          {training && (
            <tr className="group-band">
              {bands.map((b, i) => (
                <th key={i} colSpan={b.span} scope="colgroup">
                  <span className="band">
                    <TrainingBadge inline n={GROUP_BADGE_START + GROUPS.indexOf(b.group as (typeof GROUPS)[number])} term={b.group} />
                    {b.group}
                  </span>
                </th>
              ))}
            </tr>
          )}
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id} className="headers">
              {hg.headers.map((h) => {
                const dir = h.column.getIsSorted();
                return (
                  <th key={h.id} scope="col" aria-sort={dir === 'asc' ? 'ascending' : dir === 'desc' ? 'descending' : 'none'}>
                    <Tooltip content={<TipContent term={String(h.column.columnDef.header)} />} relationship="description" withArrow>
                      <button className="sort-btn" onClick={h.column.getToggleSortingHandler()}>
                        <span>{flexRender(h.column.columnDef.header, h.getContext())}</span>
                        {dir === 'asc' && <ArrowUp12Regular className="arrow" />}
                        {dir === 'desc' && <ArrowDown12Regular className="arrow" />}
                      </button>
                    </Tooltip>
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((r) => (
            <tr key={r.id}>
              {r.getVisibleCells().map((cell, i) =>
                i === 0 ? (
                  <th key={cell.id} scope="row" style={{ fontWeight: 400 }}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </th>
                ) : (
                  <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {tableRows.length === 0 && <div className="empty-table">No tenants match the current filters.</div>}
    </div>
  );
}

function Cell({ spec, t, onOpen }: { spec: ColumnSpec; t: TenantView; onOpen: ReturnType<typeof useApp.getState>['openPanel'] }) {
  const text = cellText(spec, t);
  if (spec.flyout && text !== NA) {
    return (
      <button
        className="cell-link"
        onClick={() => onOpen({ kind: spec.flyout!, tenantKey: t.caseNo })}
        aria-haspopup="dialog"
        data-tour={`cell-${spec.id}`}
        aria-label={spec.flyout === 'tenant' ? `Open tenant detail for ${text}` : `${spec.header}: ${text}. Open details`}
      >
        {text}
      </button>
    );
  }
  return <>{text}</>;
}
