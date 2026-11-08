import { Menu, MenuItem, MenuList, MenuPopover, MenuTrigger } from '@fluentui/react-components';
import {
  ArrowDownload20Regular,
  ArrowReset20Regular,
  Dismiss12Regular,
  Filter20Regular,
  Open20Regular,
  Search20Regular,
  TableSettings20Regular,
} from '@fluentui/react-icons';
import { columnById, COLUMNS } from '../../lib/columns';
import { downloadRows } from '../../lib/export';
import { FACETS, quickLabel } from '../../lib/filters';
import { useApp, useData } from '../../store';

export function TableToolbar() {
  const { tableRows, contextRows } = useData();
  const s = useApp();
  const exportCols = () => [
    ...s.columnOrder.filter((id) => s.columnVisibility[id]).map((id) => columnById(id)!),
    ...s.downloadOnly.map((id) => columnById(id)!),
  ];
  const facetChips = FACETS.filter((f) => (s.facets[f.key]?.length ?? 0) > 0);
  const anyFilter = !!s.quick || facetChips.length > 0 || !!s.search;

  return (
    <>
      <div className="toolbar" data-tour="toolbar">
        <div className="toolbar-group">
          <Menu>
            <MenuTrigger disableButtonEnhancement>
              <button className="ghost-btn">
                <ArrowDownload20Regular /> Download
              </button>
            </MenuTrigger>
            <MenuPopover>
              <MenuList>
                <MenuItem onClick={() => downloadRows(tableRows, exportCols(), 'csv')}>Download as CSV</MenuItem>
                <MenuItem onClick={() => downloadRows(tableRows, exportCols(), 'xlsx')}>Download as XLSX</MenuItem>
              </MenuList>
            </MenuPopover>
          </Menu>
          <button className="ghost-btn" onClick={() => s.openPanel({ kind: 'dictionary' })}>
            <Open20Regular /> Data Dictionary
          </button>
        </div>
        <div className="toolbar-group">
          <button className="ghost-btn" onClick={() => s.openPanel({ kind: 'columns' })}>
            <TableSettings20Regular /> Change columns
          </button>
          <button className="ghost-btn" onClick={() => s.openPanel({ kind: 'filters' })}>
            <Filter20Regular /> Filter
          </button>
          <div className="table-search">
            <Search20Regular style={{ color: 'var(--link)' }} />
            <input
              value={s.search}
              onChange={(e) => s.setSearch(e.target.value)}
              placeholder="Search for Reseller Name, Partner Name, Tenant Name"
              aria-label="Search for Reseller Name, Partner Name, Tenant Name"
            />
          </div>
        </div>
      </div>
      <div className="chips" aria-live="polite">
        <span className="result-count">
          Showing {tableRows.length} of {contextRows.length} tenants
        </span>
        {s.quick && (
          <span className="chip">
            {quickLabel(s.quick)}
            <button aria-label="Remove filter" onClick={() => s.setQuick(null)}>
              <Dismiss12Regular />
            </button>
          </span>
        )}
        {facetChips.map((f) => (
          <span className="chip" key={f.key}>
            {f.label}: {s.facets[f.key]!.join(', ')}
            <button aria-label={`Remove ${f.label} filter`} onClick={() => s.setFacets({ ...s.facets, [f.key]: [] })}>
              <Dismiss12Regular />
            </button>
          </span>
        ))}
        {s.search && (
          <span className="chip">
            Search: “{s.search}”
            <button aria-label="Clear search" onClick={() => s.setSearch('')}>
              <Dismiss12Regular />
            </button>
          </span>
        )}
        {anyFilter && (
          <button className="ghost-btn" onClick={s.resetFilters}>
            <ArrowReset20Regular /> Reset filters
          </button>
        )}
        {s.columnOrder.some((id, i) => id !== COLUMNS[i].id) && <span className="result-count">· Custom column order</span>}
      </div>
    </>
  );
}
