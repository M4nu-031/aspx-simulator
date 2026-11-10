import { useState } from 'react';
import { Button, Checkbox, Input } from '@fluentui/react-components';
import { ChevronDown16Regular, ChevronUp16Regular, Search20Regular } from '@fluentui/react-icons';
import { COLUMNS, DOWNLOAD_ONLY, GROUPS, columnById } from '../../lib/columns';
import { DEFS, TRAINING_NOTES } from '../../lib/dictionary';
import { FACETS, type FacetState } from '../../lib/filters';
import { ALL_TENANTS, useApp } from '../../store';
import { Drawer } from './Drawer';

// ---------------- Data Dictionary ----------------
export function DictionaryPanel() {
  const [q, setQ] = useState('');
  const training = useApp((s) => s.training);
  const sections: { title: string; terms: string[] }[] = [
    {
      title: 'KPI tiles',
      terms: ['Tenants', 'Seat Penetration', 'Paid Utilization', 'Acquire', 'Monetize', 'Grow', 'E7 Upsell-ready', 'Potential Earnings'],
    },
    {
      title: 'Charts',
      terms: ['Copilot Tenant Penetration', 'Copilot Opportunities', 'Free-Paid Signals by Tenant', 'Copilot Usage by License', 'MCI Potential Earnings'],
    },
    { title: 'Columns', terms: COLUMNS.filter((c) => !c.hidden).map((c) => c.header) },
    { title: 'Hidden columns', terms: COLUMNS.filter((c) => c.hidden).map((c) => c.header) },
    { title: 'Download-only', terms: DOWNLOAD_ONLY.map((c) => c.header) },
  ];
  const s = q.trim().toLowerCase();
  return (
    <Drawer title="Data Dictionary">
      <Input
        contentBefore={<Search20Regular />}
        placeholder="Search"
        aria-label="Search definitions"
        value={q}
        onChange={(_, d) => setQ(d.value)}
        style={{ width: '100%', marginBottom: 12 }}
      />
      {sections.map((sec) => {
        const terms = sec.terms.filter((t) => !s || t.toLowerCase().includes(s) || (DEFS[t] ?? '').toLowerCase().includes(s));
        if (!terms.length) return null;
        return (
          <div className="panel-section" key={sec.title}>
            <h3>{sec.title}</h3>
            {terms.map((t) => (
              <div className="dict-item" key={t}>
                <b>{t}</b>
                {DEFS[t] ?? 'Definition not available.'}
                {training && TRAINING_NOTES[t] && (
                  <div className="tip-note" lang="es" style={{ marginTop: 6, color: 'var(--text-2)' }}>
                    <b style={{ display: 'inline', color: '#ffd335' }}>Training note:</b> {TRAINING_NOTES[t]}
                  </div>
                )}
              </div>
            ))}
          </div>
        );
      })}
    </Drawer>
  );
}

// ---------------- Change columns ----------------
export function ColumnsPanel() {
  const s = useApp();
  const [q, setQ] = useState('');
  const [vis, setVis] = useState<Record<string, boolean>>(s.columnVisibility);
  const [order, setOrder] = useState<string[]>(s.columnOrder);
  const [dl, setDl] = useState<string[]>(s.downloadOnly);
  const term = q.trim().toLowerCase();
  const match = (h: string) => !term || h.toLowerCase().includes(term);

  const move = (id: string, dir: -1 | 1) => {
    const i = order.indexOf(id);
    const j = i + dir;
    if (j < 0 || j >= order.length) return;
    const next = [...order];
    [next[i], next[j]] = [next[j], next[i]];
    setOrder(next);
  };

  return (
    <Drawer
      title="Change columns"
      footer={
        <>
          <Button
            appearance="primary"
            onClick={() => {
              s.setColumnVisibility(vis);
              s.setColumnOrder(order);
              s.setDownloadOnly(dl);
              s.closePanel();
            }}
          >
            Apply
          </Button>
          <Button
            onClick={() => {
              s.resetColumns();
              s.closePanel();
            }}
          >
            Reset to default
          </Button>
        </>
      }
    >
      <Input
        contentBefore={<Search20Regular />}
        placeholder="Search columns"
        aria-label="Search columns"
        value={q}
        onChange={(_, d) => setQ(d.value)}
        style={{ width: '100%' }}
      />
      <div className="result-count" style={{ marginTop: 8 }}>
        {Object.values(vis).filter(Boolean).length} of {COLUMNS.length} columns selected · use the arrows to change the order
      </div>
      {GROUPS.map((g) => {
        const ids = order.filter((id) => columnById(id)!.group === g && match(columnById(id)!.header));
        if (!ids.length) return null;
        return (
          <div key={g} role="group" aria-label={g}>
            <div className="col-group-title">{g}</div>
            {ids.map((id) => {
              const c = columnById(id)!;
              const locked = id === 'tenantName';
              return (
                <div className="col-row" key={id}>
                  <Checkbox
                    label={c.header}
                    checked={vis[id]}
                    disabled={locked}
                    onChange={(_, d) => setVis({ ...vis, [id]: !!d.checked })}
                  />
                  <span>
                    <Button size="small" appearance="subtle" icon={<ChevronUp16Regular />} aria-label={`Move ${c.header} left`} onClick={() => move(id, -1)} disabled={locked} />
                    <Button size="small" appearance="subtle" icon={<ChevronDown16Regular />} aria-label={`Move ${c.header} right`} onClick={() => move(id, 1)} disabled={locked} />
                  </span>
                </div>
              );
            })}
          </div>
        );
      })}
      {DOWNLOAD_ONLY.length > 0 && (
      <div role="group" aria-label="Download-only">
        <div className="col-group-title" style={{ marginTop: 22 }}>
          Download-only
        </div>
        <div className="result-count" style={{ marginBottom: 4 }}>
          Fields shown in flyouts. They are added to Download, not to the table.
        </div>
        {DOWNLOAD_ONLY.filter((c) => match(c.header)).map((c) => (
          <div key={c.id}>
            <Checkbox
              label={c.header}
              checked={dl.includes(c.id)}
              onChange={(_, d) => setDl(d.checked ? [...dl, c.id] : dl.filter((x) => x !== c.id))}
            />
          </div>
        ))}
      </div>
      )}
    </Drawer>
  );
}

// ---------------- Filter ----------------
export function FilterPanel() {
  const s = useApp();
  const [draft, setDraft] = useState<FacetState>(s.facets);
  return (
    <Drawer
      title="Filter"
      footer={
        <>
          <Button
            appearance="primary"
            onClick={() => {
              s.setFacets(draft);
              s.closePanel();
            }}
          >
            Apply
          </Button>
          <Button onClick={() => setDraft({})}>Clear all</Button>
        </>
      }
    >
      {FACETS.map((f) => {
        const values = [...new Set(ALL_TENANTS.map((t) => f.get(t)))].sort();
        const sel = draft[f.key] ?? [];
        return (
          <fieldset key={f.key} className="panel-section" style={{ border: 0, padding: 0, margin: '0 0 16px' }}>
            <legend style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{f.label}</legend>
            {values.map((v) => (
              <div key={v}>
                <Checkbox
                  label={`${v} (${ALL_TENANTS.filter((t) => f.get(t) === v).length})`}
                  checked={sel.includes(v)}
                  onChange={(_, d) => setDraft({ ...draft, [f.key]: d.checked ? [...sel, v] : sel.filter((x) => x !== v) })}
                />
              </div>
            ))}
          </fieldset>
        );
      })}
    </Drawer>
  );
}
