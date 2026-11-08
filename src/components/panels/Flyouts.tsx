import type { ReactNode } from 'react';
import ReactECharts from 'echarts-for-react';
import { Link } from '@fluentui/react-components';
import { CheckmarkCircle20Filled, Lightbulb20Regular, Open16Regular, Warning20Filled } from '@fluentui/react-icons';
import type { TenantView } from '../../lib/metrics';
import { creditsConsumed, PENETRATION_THRESHOLD } from '../../lib/metrics';
import { fmtBool, fmtInt, fmtMonth, fmtPct, fmtText, fmtUsd } from '../../lib/format';
import { HERO_MOTION, opportunityReasoning, tenantAdvice } from '../../lib/advice';
import { useApp } from '../../store';
import { Drawer } from './Drawer';

type P = { t: TenantView };

function KV({ rows }: { rows: [string, ReactNode][] }) {
  return (
    <dl className="kv">
      {rows.map(([k, v]) => (
        <div key={k} style={{ display: 'contents' }}>
          <dt className="k">{k}</dt>
          <dd className="v" style={{ margin: 0 }}>
            {v}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="panel-section">
      <h3>{title}</h3>
      {children}
    </section>
  );
}

function Pill({ s }: { s: string }) {
  return <span className={`pill ${s.replace(' ', '-')}`}>{s}</span>;
}

function MiniBars({ items, color = '#4f6bed' }: { items: { label: string; value: number }[]; color?: string }) {
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <div className="mini-bars" role="list">
      {items.map((i) => (
        <div className="mini-bar" role="listitem" key={i.label} aria-label={`${i.label}: ${fmtInt(i.value)}`}>
          <span>{i.label}</span>
          <span className="track">
            <span className="fill" style={{ width: `${(i.value / max) * 100}%`, background: color, display: 'block' }} />
          </span>
          <span className="num">{fmtInt(i.value)}</span>
        </div>
      ))}
    </div>
  );
}

function Meter({ label, value, threshold = PENETRATION_THRESHOLD, color }: { label: string; value: number; threshold?: number; color: string }) {
  const met = value > threshold;
  const scale = Math.max(0.3, value * 1.2); // zoom so 5% is visible
  return (
    <div className="criterion">
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
        <span>{label}</span>
        <b>{fmtPct(value)}</b>
      </div>
      <div className="meter" aria-hidden>
        <span style={{ width: `${Math.min(value / scale, 1) * 100}%`, background: color }} />
        <span className="threshold" style={{ left: `${(threshold / scale) * 100}%` }} />
      </div>
      <div style={{ fontSize: 12, marginTop: 6, color: 'var(--text-2)', display: 'flex', alignItems: 'center', gap: 6 }}>
        {met ? <CheckmarkCircle20Filled className="status-ok" /> : <Warning20Filled style={{ color: 'var(--text-3)' }} />}
        {met ? 'Above' : 'Below'} the {fmtPct(threshold)} threshold
      </div>
    </div>
  );
}

function OpenLink({ kind, t, children }: { kind: 'opportunity' | 'e7' | 'allMau' | 'agents' | 'mtdCredits' | 'weekly' | 'admin'; t: TenantView; children: ReactNode }) {
  const open = useApp((s) => s.openPanel);
  return (
    <button className="cell-link" onClick={() => open({ kind, tenantKey: t.caseNo })}>
      {children}
    </button>
  );
}

// ---------------- Tenant detail ----------------
export function TenantFlyout({ t }: P) {
  const training = useApp((s) => s.training);
  const advice = tenantAdvice(t);
  return (
    <Drawer title="Tenant detail">
      <h2 style={{ fontSize: 18, margin: '0 0 4px' }}>{t.tenantName}</h2>
      <div style={{ color: 'var(--text-2)', fontSize: 12, marginBottom: 16 }}>{t.tenantId}</div>

      {training && (
        <section className="panel-section advice" lang="es" data-tour="advice">
          <h3>
            <Lightbulb20Regular style={{ color: '#ffd335' }} /> What to do with this tenant
          </h3>
          <ul>
            {advice.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </section>
      )}

      <Section title="Copilot Opportunity">
        <KV
          rows={[
            ['Copilot Opportunity', <OpenLink kind="opportunity" t={t}>{t.scenario}</OpenLink>],
            ['Copilot Purchase Propensity', t.propensity],
            ['E7 Opportunity', t.e7Ready ? <OpenLink kind="e7" t={t}>Upsell to E7</OpenLink> : 'Not available'],
            ['Copilot in 30 Trial Recommendation', t.trialRecommendation],
            ['Copilot in 30 Days Remaining', fmtInt(t.trialDaysRemaining)],
            ['Adoption Status', fmtText(t.adoptionStatus)],
          ]}
        />
      </Section>
      <Section title="Seats and usage">
        <KV
          rows={[
            ['Copilot Eligible M365 Seats', fmtInt(t.eligibleSeats)],
            ['Copilot PAU', fmtInt(t.pau)],
            ['Copilot Seats Whitespace', fmtInt(t.seatsWhitespace)],
            ['Copilot MAU (Licensed)', fmtInt(t.licensedMau)],
            ['Free Copilot Chat MAU (Unlicensed)', fmtInt(t.unlicensedMau)],
            ['All Copilot MAU', <OpenLink kind="allMau" t={t}>{fmtInt(t.allCopilotMau)}</OpenLink>],
            ['Copilot Utilization', fmtPct(t.utilization)],
            ['Free to Paid Whitespace', fmtPct(t.freeToPaidWhitespace)],
            ['All Agents MAU', <OpenLink kind="agents" t={t}>{fmtInt(t.allAgentsMau)}</OpenLink>],
            ['MTD Credits Consumed', t.mtdCredits == null ? 'Not available' : <OpenLink kind="mtdCredits" t={t}>{fmtInt(t.mtdCredits)}</OpenLink>],
            [
              'Admin Settings Recommendations',
              <OpenLink kind="admin" t={t}>{t.adminNeedsAttention ? `${t.adminNeedsAttention} Needs attention` : 'Healthy'}</OpenLink>,
            ],
          ]}
        />
      </Section>
      <Section title="Tenant profile">
        <KV
          rows={[
            ['Customer Name', t.customerName],
            ['Tenant Country/Region', t.country],
            ['Tenant Segment', t.segment],
            ['Customer Sub-Segment', t.subSegment],
            ['Industry / Vertical', t.industry],
            ['Dominant SKU Group', t.dominantSku],
            ['Data Security Maturity', t.dataSecurityMaturity],
          ]}
        />
      </Section>
      <Section title="Renewals and partner">
        <KV
          rows={[
            ['Largest Seat CSP Renewal', fmtMonth(t.largestCspRenewal)],
            ['Earliest CSP Renewal', fmtMonth(t.earliestCspRenewal)],
            ['EA Renewal', fmtMonth(t.eaRenewal)],
            ['Partner Name', t.partnerName],
            ['CSP Tier', fmtText(t.cspTier)],
            ['T2 Reseller Name', fmtText(t.t2ResellerName)],
            ['MCI Eligibility', t.mciEligible ? 'Eligible' : 'Not eligible'],
            ['Potential Earnings', fmtUsd(t.potentialEarnings)],
          ]}
        />
      </Section>
    </Drawer>
  );
}

// ---------------- Copilot Opportunity details ----------------
export function OpportunityFlyout({ t }: P) {
  return (
    <Drawer title="Copilot Opportunity details">
      <h2 style={{ fontSize: 16, margin: '0 0 12px' }}>{t.tenantName}</h2>
      <Section title="Copilot Opportunity">
        <KV
          rows={[
            ['Scenario', <Pill s={t.scenario} />],
            ['Copilot Purchase Propensity', t.propensity],
          ]}
        />
        <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.5 }}>{t.propensityReasoning}</p>
      </Section>
      <Section title="Criteria met">
        <div className="criteria">
          <Meter label="M365 Copilot Penetration (paid)" value={t.paidPenetration} color="#4f6bed" />
          <Meter label="Copilot Chat Penetration (Chat MAU)" value={t.freeChatPenetration} color="#1aa0c8" />
        </div>
        <p style={{ fontSize: 13, lineHeight: 1.5 }}>
          <b>Opportunity Reasoning: </b>
          {opportunityReasoning(t)}
        </p>
      </Section>
      <Section title="Hero motion">
        <p style={{ fontSize: 13, lineHeight: 1.5, margin: 0 }}>{HERO_MOTION[t.scenario]}</p>
      </Section>
      <Section title="Key metrics">
        <KV
          rows={[
            ['Copilot Eligible Seats', fmtInt(t.eligibleSeats)],
            ['M365 Copilot Whitespace', fmtInt(t.seatsWhitespace)],
            ['Copilot Chat Whitespace', fmtInt(t.freeChatWhitespace)],
            ['Users Experiencing Usage Limits', fmtInt(t.usageLimitUsers)],
            ['License Request User Count', fmtInt(t.licenseRequests)],
          ]}
        />
      </Section>
    </Drawer>
  );
}

// ---------------- E7 Opportunity ----------------
export function E7Flyout({ t }: P) {
  return (
    <Drawer title="E7 Opportunity">
      <h2 style={{ fontSize: 16, margin: '0 0 12px' }}>{t.tenantName}</h2>
      <Section title="E7 Sub Scenario">
        <p style={{ margin: 0, fontWeight: 600 }}>{fmtText(t.e7SubScenario)}</p>
      </Section>
      <Section title="Readiness signals">
        <KV
          rows={[
            ['Agent Intensity', t.agentIntensity],
            ['M365 Copilot Penetration', fmtPct(t.paidPenetration)],
            ['Entra Penetration', fmtPct(t.entraPenetration)],
            ['Dominant SKU Group', t.dominantSku],
            ['All Agents MAU', fmtInt(t.allAgentsMau)],
          ]}
        />
      </Section>
      <Section title="Penetration">
        <MiniBars
          items={[
            { label: 'Entra Penetration (%)', value: Math.round(t.entraPenetration * 100) },
            { label: 'M365 Copilot Penetration (%)', value: Math.round(t.paidPenetration * 100) },
          ]}
        />
      </Section>
    </Drawer>
  );
}

// ---------------- All Copilot MAU ----------------
export function AllMauFlyout({ t }: P) {
  const a = t.apps;
  return (
    <Drawer title="All Copilot MAU">
      <h2 style={{ fontSize: 16, margin: '0 0 12px' }}>{t.tenantName}</h2>
      <Section title="Summary">
        <KV
          rows={[
            ['All Copilot MAU', fmtInt(t.allCopilotMau)],
            ['Copilot MAU (Licensed)', fmtInt(t.licensedMau)],
            ['Free Copilot Chat MAU (Unlicensed)', fmtInt(t.unlicensedMau)],
          ]}
        />
      </Section>
      <Section title="Copilot usage by product">
        <MiniBars
          items={[
            { label: 'Copilot in Teams', value: a.teams },
            { label: 'Copilot in Outlook', value: a.outlook },
            { label: 'Copilot in Word', value: a.word },
            { label: 'Copilot in Excel', value: a.excel },
            { label: 'Copilot in PowerPoint', value: a.powerpoint },
            { label: 'Copilot in Viva Engage', value: a.engage },
            { label: 'Copilot in OneNote', value: a.onenote },
            { label: 'Sales Copilot (CRM)', value: a.salesCrm },
          ]}
        />
      </Section>
    </Drawer>
  );
}

// ---------------- All Agents MAU ----------------
export function AgentsFlyout({ t }: P) {
  const g = t.agents;
  return (
    <Drawer title="All Agents MAU">
      <h2 style={{ fontSize: 16, margin: '0 0 12px' }}>{t.tenantName}</h2>
      <Section title="Agent MAU by type">
        <MiniBars
          color="#1aa0c8"
          items={[
            { label: 'Agents in Copilot Chat', value: g.chat },
            { label: 'Connectors', value: g.connector },
            { label: 'Plugins (Actions)', value: g.plugins },
            { label: 'Custom Engine', value: g.customEngine },
          ]}
        />
      </Section>
      <KV rows={[['All Up Agents Total MAU', fmtInt(t.allAgentsMau)]]} />
    </Drawer>
  );
}

// ---------------- MTD Credits Consumed ----------------
const CREDIT_MONTHS = ['M-2 (Sep 2026)', 'M-1 (Oct 2026)', 'MTD (Nov 2026)'];

export function MtdCreditsFlyout({ t }: P) {
  const dark = useApp((s) => s.theme) === 'dark';
  if (!t.credits) {
    return (
      <Drawer title="MTD Credits Consumed">
        <p>Not available</p>
      </Drawer>
    );
  }
  const m = t.credits.months;
  const text = dark ? '#fff' : '#201f1e';
  const grid = dark ? '#484644' : '#e1dfdd';
  const option = {
    tooltip: { trigger: 'axis' },
    legend: { bottom: 0, textStyle: { color: text }, icon: 'rect', itemWidth: 10, itemHeight: 10 },
    grid: { left: 4, right: 10, top: 16, bottom: 40, containLabel: true },
    xAxis: { type: 'category', data: ['M-2', 'M-1', 'MTD'], axisLabel: { color: text } },
    yAxis: { type: 'value', axisLabel: { color: text, formatter: (v: number) => v.toLocaleString('en-US') }, splitLine: { lineStyle: { color: grid } } },
    series: [
      { name: 'PAYGO Credits Consumed', type: 'bar', stack: 'c', data: m.map((x) => x.paygo), itemStyle: { color: '#4f6bed' }, barWidth: 36 },
      { name: 'Prepaid Credits Consumed', type: 'bar', stack: 'c', data: m.map((x) => x.prepaid), itemStyle: { color: '#1aa0c8' } },
      {
        name: 'Monthly Credits Limit',
        type: 'line',
        data: m.map((x) => x.limit),
        lineStyle: { type: 'dashed', color: '#ffd335' },
        itemStyle: { color: '#ffd335' },
        symbol: 'none',
      },
    ],
  };
  const rows: [string, (x: (typeof m)[number]) => number][] = [
    ['PAYGO Credits Consumed', (x) => x.paygo],
    ['Prepaid Credits Consumed', (x) => x.prepaid],
    ['Non Billable Credits Consumed', (x) => x.nonBillable],
    ['Monthly Credits Limit', (x) => x.limit],
    ['Available Billable Credits', (x) => Math.max(x.limit - creditsConsumed(x), 0)],
  ];
  return (
    <Drawer title="MTD Credits Consumed">
      <h2 style={{ fontSize: 16, margin: '0 0 12px' }}>{t.tenantName}</h2>
      <Section title="Credit Consumption Trend">
        <div style={{ height: 240 }}>
          <ReactECharts option={option} style={{ height: '100%' }} notMerge />
        </div>
      </Section>
      <Section title="Details">
        <table className="grid" style={{ width: '100%', tableLayout: 'auto' }}>
          <thead>
            <tr>
              <th scope="col" style={{ position: 'static' }}>Metric</th>
              {CREDIT_MONTHS.map((c) => (
                <th scope="col" key={c} style={{ position: 'static', textAlign: 'right' }}>
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(([label, f]) => (
              <tr key={label}>
                <th scope="row" style={{ position: 'static', fontWeight: 400 }}>
                  {label}
                </th>
                {m.map((x, i) => (
                  <td key={i} style={{ height: 'auto', textAlign: 'right' }}>
                    {fmtInt(f(x))}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Section>
      <KV
        rows={[
          ['Peak Monthly Consumption', fmtInt(t.credits.peakMonthly)],
          ['MTD usage of Monthly Credits Limit', fmtPct((t.mtdCredits ?? 0) / m[2].limit)],
        ]}
      />
    </Drawer>
  );
}

// ---------------- Weekly Consumption ----------------
export function WeeklyFlyout({ t }: P) {
  const w = t.weekly;
  return (
    <Drawer title="Weekly Consumption">
      <h2 style={{ fontSize: 16, margin: '0 0 12px' }}>{t.tenantName}</h2>
      {w ? (
        <>
          <Section title="Copilot Credits by experience (last 7 days)">
            <MiniBars
              color="#7a1050"
              items={[
                { label: 'Cowork', value: w.cowork },
                { label: 'Work IQ', value: w.workIq },
                { label: 'GitHub Copilot', value: w.githubCopilot },
                { label: 'Agents', value: w.agents },
              ]}
            />
          </Section>
          <KV
            rows={[
              ['Weekly Consumption', fmtInt(t.weeklyConsumption)],
              ['Cowork MAU', fmtInt(t.coworkMau)],
              ['Monthly Cowork Credits per User', fmtInt(t.coworkCreditsPerUser)],
            ]}
          />
        </>
      ) : (
        <p>Not available</p>
      )}
    </Drawer>
  );
}

// ---------------- Admin Settings Recommendations ----------------
export function AdminFlyout({ t }: P) {
  return (
    <Drawer title="Admin Settings Recommendations">
      <h2 style={{ fontSize: 16, margin: '0 0 4px' }}>{t.tenantName}</h2>
      <p style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 0 }}>
        {t.adminNeedsAttention} of {t.adminChecks.length} settings need attention
      </p>
      <div role="list">
        {t.adminChecks.map((c) => (
          <div className="check-row" role="listitem" key={c.key}>
            {c.healthy ? <CheckmarkCircle20Filled className="status-ok" aria-hidden /> : <Warning20Filled className="status-bad" aria-hidden />}
            <div>
              <div style={{ fontWeight: 600 }}>{c.label}</div>
              <div style={{ color: 'var(--text-2)', fontSize: 12 }}>
                {c.healthy ? 'Healthy' : 'Needs attention'} · {c.value}
              </div>
            </div>
            {!c.healthy ? (
              <Link href={c.learnUrl} target="_blank" rel="noreferrer" style={{ fontSize: 12, whiteSpace: 'nowrap' }}>
                Learn to fix <Open16Regular style={{ verticalAlign: 'middle' }} />
              </Link>
            ) : (
              <span />
            )}
          </div>
        ))}
      </div>
      <p style={{ fontSize: 12, color: 'var(--text-3)' }}>Frontier Enabled: {t.frontier} · Taskbar Pinning - Healthy: {fmtBool(t.admin.taskbarPinning === 'Pinned')}</p>
    </Drawer>
  );
}
