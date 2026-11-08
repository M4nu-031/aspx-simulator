import { computeKpis } from '../../lib/metrics';
import type { QuickFilter } from '../../lib/filters';
import { fmtInt, fmtPct, fmtUsd } from '../../lib/format';
import { useApp, useData } from '../../store';
import { InfoTip, TrainingBadge } from '../InfoTip';

interface Tile {
  term: string;
  value: string;
  quick?: QuickFilter;
}

export function KpiTiles() {
  const { contextRows } = useData();
  const setQuick = useApp((s) => s.setQuick);
  const k = computeKpis(contextRows);
  const tiles: Tile[] = [
    { term: 'Tenants', value: fmtInt(k.tenants) },
    { term: 'Seat Penetration', value: fmtPct(k.seatPenetration) },
    { term: 'Paid Utilization', value: fmtPct(k.paidUtilization) },
    { term: 'Acquire', value: fmtInt(k.acquire), quick: { kind: 'scenario', value: 'Acquire' } },
    { term: 'Monetize', value: fmtInt(k.monetize), quick: { kind: 'scenario', value: 'Monetize' } },
    { term: 'Grow', value: fmtInt(k.grow), quick: { kind: 'scenario', value: 'Grow' } },
    { term: 'E7 Upsell-ready', value: fmtInt(k.e7UpsellReady), quick: { kind: 'e7' } },
    { term: 'Potential Earnings', value: fmtUsd(k.potentialEarnings), quick: { kind: 'earnings' } },
  ];
  return (
    <section className="kpis" aria-label="KPI tiles" data-tour="kpis">
      {tiles.map((t, i) => (
        <div className="kpi" key={t.term} data-tour={`kpi-${t.term}`}>
          <TrainingBadge n={i + 1} term={t.term} />
          <InfoTip term={t.term} />
          <div className="kpi-title">{t.term}</div>
          <div className="kpi-value">
            {t.quick ? (
              <button
                className="kpi-link"
                aria-label={`${t.term}: ${t.value}. Filter table`}
                onClick={() => {
                  setQuick(t.quick!);
                  document.getElementById('opportunity-table')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
              >
                {t.value}
              </button>
            ) : (
              t.value
            )}
          </div>
        </div>
      ))}
    </section>
  );
}
