import { Dropdown, Option } from '@fluentui/react-components';
import { Info20Regular } from '@fluentui/react-icons';
import { Tooltip } from '@fluentui/react-components';
import { useNavigate } from 'react-router-dom';
import { PARTNERS } from '../../data/tenants';
import { useApp } from '../../store';

export const PIVOTS = [
  { id: 'copilot', label: 'Copilot Opportunities' },
  { id: 'e3', label: 'E3 Opportunities' },
  { id: 'e5', label: 'E5 Opportunities' },
  { id: 'edu', label: 'EDU Opportunities' },
  { id: 'e5-expansion', label: 'E5 Expansion Opportunities' },
  { id: 'cloud-endpoints', label: 'Cloud Endpoints' },
];

export function PageHeader({ tab }: { tab: string }) {
  const nav = useNavigate();
  const partner = useApp((s) => s.partner);
  const setPartner = useApp((s) => s.setPartner);
  const options = [{ id: 'all', name: 'All partners' }, ...PARTNERS.map((p) => ({ id: p.id, name: p.name }))];
  const selected = options.find((o) => o.id === partner)!;

  const onKey = (e: React.KeyboardEvent, i: number) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const next = (i + (e.key === 'ArrowRight' ? 1 : -1) + PIVOTS.length) % PIVOTS.length;
    nav(`/growth/${PIVOTS[next].id}`);
    requestAnimationFrame(() => document.getElementById(`pivot-${PIVOTS[next].id}`)?.focus());
  };

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">
          <b>Insights</b> | Growth Opportunities
        </h1>
        <span className="page-sub">
          AI Business Solutions &amp; Security
          <Tooltip
            relationship="description"
            withArrow
            content={
              <div className="tip">
                The Copilot Opportunities tab lists each Claiming Partner of Record (CPOR) and Cloud Solution Provider (CSP)
                associated tenants with a Copilot footprint. It combines machine learning, propensity scores, usage metrics, and
                readiness signals to help partners identify tenants that are likely to add licenses, need extra engagement, or are
                ready for an acquire, monetize, grow, adoption, or upsell motion.
              </div>
            }
          >
            <button className="info-inline" aria-label="About AI Business Solutions & Security">
              <Info20Regular />
            </button>
          </Tooltip>
        </span>
      </div>
      <div className="context-row">
        <div className="pivots" role="tablist" aria-label="Growth Opportunities">
          {PIVOTS.map((p, i) => (
            <button
              key={p.id}
              id={`pivot-${p.id}`}
              role="tab"
              aria-selected={tab === p.id}
              tabIndex={tab === p.id ? 0 : -1}
              className={`pivot${tab === p.id ? ' active' : ''}`}
              onClick={() => nav(`/growth/${p.id}`)}
              onKeyDown={(e) => onKey(e, i)}
            >
              {p.label}
            </button>
          ))}
        </div>
        {tab === 'copilot' && (
          <div className="context-selector" data-tour="context">
            <label id="ctx-label">Partner</label>
            <Dropdown
              aria-labelledby="ctx-label"
              value={selected.name}
              selectedOptions={[partner]}
              onOptionSelect={(_, d) => setPartner(d.optionValue ?? 'all')}
              style={{ minWidth: 280 }}
            >
              {options.map((o) => (
                <Option key={o.id} value={o.id}>
                  {o.name}
                </Option>
              ))}
            </Dropdown>
          </div>
        )}
      </div>
    </>
  );
}
