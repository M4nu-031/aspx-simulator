import type { ReactNode } from 'react';
import ReactECharts from 'echarts-for-react';
import { Link } from '@fluentui/react-components';
import { CheckmarkCircle20Filled, Lightbulb20Regular, Open16Regular, Warning20Filled } from '@fluentui/react-icons';
import type { TenantView } from '../../lib/metrics';
import { availableBillableCredits, creditOverage, PENETRATION_THRESHOLD, projectedMonthEnd } from '../../lib/metrics';
import type { FlyoutKind } from '../../lib/columns';
import { fmtBool, fmtInt, fmtMonth, fmtPct, fmtText, fmtUsd, NA } from '../../lib/format';
import { OPPORTUNITY_REASONING, RECOMMENDATION, opportunityReasoning, tenantAdvice } from '../../lib/advice';
import { InfoTip } from '../InfoTip';
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

function MiniBars({ items, color = '#4f6bed' }: { items: { label: string; value: number }[]; color?: string }) {
  const max = Math.max(1, ...items.map((i) => i.value));
  if (items.every((i) => i.value === 0)) {
    return <p className="flyout-foot">No usage recorded in the last 28 days (all values are 0).</p>;
  }
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

function OpenLink({ kind, t, children }: { kind: Exclude<FlyoutKind, 'tenant'>; t: TenantView; children: ReactNode }) {
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
            ['Data Security Maturity', <OpenLink kind="dataSecurity" t={t}>{t.dataSecurityMaturity}</OpenLink>],
          ]}
        />
      </Section>
      <LicensesSection t={t} />
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

// ---------------- Licenses (inside Tenant detail) ----------------
function LicensesSection({ t }: P) {
  const otherChannels = t.totalM365Licenses - t.cspTransactedLicenses;
  return (
    <section className="panel-section" aria-label="Licenses">
      <h3>Licenses</h3>
      <table className="grid lic-table">
        <thead>
          <tr>
            <th scope="col">Product</th>
            <th scope="col" className="num">
              Seats
            </th>
            <th scope="col">Copilot Chat</th>
          </tr>
        </thead>
        <tbody>
          {t.licenses.map((l) => (
            <tr key={l.product}>
              <th scope="row">
                <div>{l.product}</div>
                <div className="lic-note">{l.note}</div>
              </th>
              <td className="num">{l.seats == null ? '—' : fmtInt(l.seats)}</td>
              <td>{l.copilotChat}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <KV
        rows={[
          ['Total M365 licenses', fmtInt(t.totalM365Licenses)],
          ['Copilot Eligible M365 Seats', fmtInt(t.eligibleSeats)],
          ['CSP Transacted Licenses', `${fmtInt(t.cspTransactedLicenses)} (${fmtPct(t.cspTransactedPct)})`],
          ['Licenses from other channels (EA / other partners)', fmtInt(otherChannels)],
          ['Copilot PAU', fmtInt(t.pau)],
        ]}
      />
    </section>
  );
}

// ---------------- Copilot Opportunity details ----------------
const LEARN_COPILOT = 'https://learn.microsoft.com/partner-center/insights/growth-opportunities-data/copilot#copilot-opportunity-data-dictionary';

function NewBadge() {
  return <span className="new-badge">New</span>;
}

export function OpportunityFlyout({ t }: P) {
  const training = useApp((s) => s.training);
  const rows: [ReactNode, ReactNode][] = [
    ['Opportunity:', t.scenario],
    ['M365 Dominant SKU:', t.dominantSku],
    ['M365 Copilot Penetration:', fmtPct(t.paidPenetration)],
    ['Free Copilot Chat Penetration:', fmtPct(t.freeChatPenetration)],
    ['Copilot Eligible Seats:', fmtInt(t.eligibleSeats)],
    ['M365 Copilot Whitespace:', fmtInt(t.seatsWhitespace)],
    ['Free Chat MAU Whitespace:', fmtInt(t.freeChatWhitespace)],
    [
      <span className="label-with-tip">
        Users Experiencing Usage Limits: <InfoTip term="Monthly Users Experiencing Usage Limits" /> <NewBadge />
      </span>,
      fmtInt(t.usageLimitUsers),
    ],
    [
      <span className="label-with-tip">
        Cumulative License Requests: <InfoTip term="Cumulative License Requests" /> <NewBadge />
      </span>,
      fmtInt(t.licenseRequests),
    ],
    ['Opportunity Reasoning:', OPPORTUNITY_REASONING[t.scenario]],
    ['Copilot Purchase Propensity:', t.propensity],
    ['Copilot Purchase Propensity Reasoning:', t.propensityReasoning || NA],
  ];
  return (
    <Drawer title="Opportunity Details">
      <p className="flyout-intro">
        The Copilot Opportunity value provides direction on what next steps to take with the customer. Included below are key penetration metrics and
        AI/ML insights that explain why the customer is categorized as acquire, monetize, or grow.{' '}
        <Link href={LEARN_COPILOT} target="_blank" rel="noreferrer">
          Learn more <Open16Regular style={{ verticalAlign: 'middle' }} />
        </Link>
      </p>
      <div className="opp-tenant">{t.tenantName}</div>
      <table className="opp-table">
        <tbody>
          {rows.map(([k, v], i) => (
            <tr key={i}>
              <th scope="row">{k}</th>
              <td>{v}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="recommendation">
        <div className="rec-title">
          <Lightbulb20Regular /> Recommendation
        </div>
        <div>{RECOMMENDATION[t.scenario]}</div>
      </div>
      {training && (
        <Section title="Criteria met (training)">
          <div className="criteria">
            <Meter label="M365 Copilot Penetration (paid)" value={t.paidPenetration} color="#4f6bed" />
            <Meter label="Copilot Chat Penetration (Chat MAU)" value={t.freeChatPenetration} color="#1aa0c8" />
          </div>
          <p style={{ fontSize: 13, lineHeight: 1.5 }}>{opportunityReasoning(t)}</p>
        </Section>
      )}
    </Drawer>
  );
}

// ---------------- Cowork MAU ----------------
export function CoworkFlyout({ t }: P) {
  const c = t.coworkStats;
  const v = (x: number | null | undefined, f: (n: number) => string) => (x == null ? <span className="na">{NA}</span> : f(x));
  const rows: [string, ReactNode][] = [
    ['Cowork MAU', fmtInt(t.coworkMau)],
    ['Cowork MoM Retention', v(c?.momRetention, (n) => fmtPct(n))],
    ['Total Cowork Tasks', v(c?.totalTasks, fmtInt)],
    ['Scheduled Cowork Tasks', v(c?.scheduledTasks, fmtInt)],
    ['Interactive Tasks', v(c?.interactiveTasks, fmtInt)],
    ['Turns Succeed', v(c?.turnsSucceeded, fmtInt)],
    ['Turns Failed', v(c?.turnsFailed, fmtInt)],
    ['Turns Abandoned', v(c?.turnsAbandoned, fmtInt)],
    ['Turns Success Rate', v(c?.turnsSuccessRate, (n) => fmtPct(n))],
  ];
  return (
    <Drawer title="Cowork MAU">
      <h2 style={{ fontSize: 16, margin: '0 0 12px' }}>{t.tenantName}</h2>
      <table className="metric-table">
        <thead>
          <tr>
            <th scope="col">Metric Name</th>
            <th scope="col">Value</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([k, val]) => (
            <tr key={k}>
              <th scope="row">{k}</th>
              <td>{val}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="flyout-foot">Last rolling 28 days. Monthly Cowork Credits per User: {fmtInt(t.coworkCreditsPerUser)}</p>
    </Drawer>
  );
}

// ---------------- Data Security Maturity ----------------
export function DataSecurityFlyout({ t }: P) {
  const d = t.dataSecurity;
  const workshops = t.mciEngagements.filter((e) => /secur/i.test(e.name)).map((e) => e.name);
  const dash = (n: number | null) => (n == null ? '-' : fmtInt(n));
  return (
    <Drawer title="Data Security Maturity">
      <h2 style={{ fontSize: 16, margin: '0 0 12px' }}>{t.tenantName}</h2>
      <table className="opp-table compact">
        <tbody>
          <tr>
            <th scope="row">Dominant Sku:</th>
            <td>{t.dominantSku}</td>
          </tr>
          <tr>
            <th scope="row">Security Licensing:</th>
            <td>{d.licensing}</td>
          </tr>
          <tr>
            <th scope="row">Data Security Health:</th>
            <td>{d.health}</td>
          </tr>
          <tr>
            <th scope="row">Eligible MCI Workshops:</th>
            <td>{workshops.length ? workshops.join('; ') : '-'}</td>
          </tr>
        </tbody>
      </table>
      <table className="grid ds-table">
        <thead>
          <tr>
            <th scope="col">Workload</th>
            <th scope="col">MPU</th>
            <th scope="col">DPU</th>
            <th scope="col">PAU</th>
            <th scope="col">Utilization (MPU)</th>
            <th scope="col">Tipping Point (MPU)</th>
            <th scope="col">Usage Threshold</th>
          </tr>
        </thead>
        <tbody>
          {d.workloads.map((w) => (
            <tr key={w.key}>
              <th scope="row">{w.label}</th>
              <td>{fmtInt(w.mpu)}</td>
              <td>{dash(w.dpu)}</td>
              <td>{fmtInt(w.pau)}</td>
              <td>{fmtPct(w.utilization)}</td>
              <td>{fmtPct(w.tippingPoint)}</td>
              <td className={w.above ? 'status-ok' : undefined}>{w.above ? 'Above' : 'Below'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="flyout-foot">
        Data Security Maturity: <b>{d.maturity}</b>. PAU comes from the tenant licenses (Dominant SKU and security add-ons).
      </p>
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
        <p className="flyout-foot">
          Each app counts licensed and free Copilot Chat users. One user can use Copilot in several apps, so the app values do not add up to All
          Copilot MAU ({fmtInt(t.allCopilotMau)}).
        </p>
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
    ['Overage', creditOverage],
    ['Monthly Credits Limit', (x) => x.limit],
    ['Available Billable Credits', availableBillableCredits],
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
          ['MTD usage of Monthly Credits Limit (6 of 30 days)', fmtPct((t.mtdCredits ?? 0) / m[2].limit)],
          ['Projected month-end consumption (simulator)', `${fmtInt(projectedMonthEnd(t.mtdCredits ?? 0))} (${fmtPct(projectedMonthEnd(t.mtdCredits ?? 0) / m[2].limit)})`],
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
                { label: 'Deep Work', value: w.deepWork },
              ]}
            />
          </Section>
          <KV
            rows={[
              ['Weekly Consumption', fmtInt(t.weeklyConsumption)],
              ['Cowork MAU', <OpenLink kind="cowork" t={t}>{fmtInt(t.coworkMau)}</OpenLink>],
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
