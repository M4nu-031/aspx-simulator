import type { TenantView, Scenario } from './metrics';
import { monthsUntil } from './metrics';

/** Facets offered in the Filter drawer (labels in English, as in the product). */
export const FACETS = [
  { key: 'country', label: 'Tenant Country/Region', get: (t: TenantView) => t.country },
  { key: 'segment', label: 'Tenant Segment', get: (t: TenantView) => t.segment },
  { key: 'subSegment', label: 'Customer Sub-Segment', get: (t: TenantView) => t.subSegment },
  { key: 'industry', label: 'Industry / Vertical', get: (t: TenantView) => t.industry },
  { key: 'dominantSku', label: 'Dominant SKU Group', get: (t: TenantView) => t.dominantSku },
  { key: 'scenario', label: 'Copilot Opportunity', get: (t: TenantView) => t.scenario as string },
  { key: 'adoptionStatus', label: 'Adoption Status', get: (t: TenantView) => t.adoptionStatus ?? 'Not available' },
  { key: 'dsm', label: 'Data Security Maturity', get: (t: TenantView) => t.dataSecurityMaturity as string },
  { key: 'mci', label: 'MCI Eligibility', get: (t: TenantView) => (t.mciEligible ? 'Eligible' : 'Not eligible') },
  { key: 'cspTier', label: 'CSP Tier', get: (t: TenantView) => t.cspTier ?? 'Not available' },
  { key: 'partner', label: 'Partner Name', get: (t: TenantView) => t.partnerName },
] as const;

export type FacetKey = (typeof FACETS)[number]['key'];
export type FacetState = Partial<Record<FacetKey, string[]>>;

export type PlaybookId = 'freeToPaid' | 'growRenewal' | 'e7p1' | 'monetizeMci' | 'dataSecurity';

/**
 * Quick filters set by clicking a KPI tile, chart segment or Playbook.
 * Stored as serialisable objects; resolved here into predicates and English labels.
 */
export type QuickFilter =
  | { kind: 'scenario'; value: Scenario }
  | { kind: 'licenses'; value: 'Has Copilot Licenses' | 'No Copilot Licenses' }
  | { kind: 'signal'; value: 'usageLimits' | 'freeChat' | 'licenseRequests' }
  | { kind: 'e7' }
  | { kind: 'earnings' }
  | { kind: 'mciEngagement'; value: string }
  | { kind: 'usage'; value: 'Unlicensed MAU' | 'All MAU' | 'Licensed MAU' }
  | { kind: 'playbook'; value: PlaybookId };

export const SIGNAL_LABELS = {
  usageLimits: 'Experiencing Usage Limits',
  freeChat: 'Penetrated with Free Chat',
  licenseRequests: 'Have License Requests',
} as const;

export const PLAYBOOKS: { id: PlaybookId; label: string; note: string; test: (t: TenantView) => boolean }[] = [
  {
    id: 'freeToPaid',
    label: 'Free to Paid ready',
    note: 'Free to Paid Whitespace ≥ 50% y al menos un free-paid signal (Usage Limits o License Requests).',
    test: (t) => (t.freeToPaidWhitespace ?? 0) >= 0.5 && (t.signals.usageLimits || t.signals.licenseRequests),
  },
  {
    id: 'growRenewal',
    label: 'Grow with renewal < 6 months',
    note: 'Escenario Grow y Largest Seat CSP Renewal en menos de 6 meses: ampliar seats en la renovación.',
    test: (t) => {
      const m = monthsUntil(t.largestCspRenewal);
      return t.scenario === 'Grow' && m != null && m >= 0 && m < 6;
    },
  },
  {
    id: 'e7p1',
    label: 'E7 priority 1',
    note: 'E7 Sub Scenario = "ME5 with H/M agent intensity" (prioridad 1 para upsell a E7).',
    test: (t) => t.e7SubScenario === 'ME5 with H/M agent intensity',
  },
  {
    id: 'monetizeMci',
    label: 'Monetize with MCI eligibility',
    note: 'Escenario Monetize y MCI Eligibility = Eligible: financiar el workshop con incentivos MCI.',
    test: (t) => t.scenario === 'Monetize' && t.mciEligible,
  },
  {
    id: 'dataSecurity',
    label: 'Data Security before Copilot',
    note: 'Data Security Maturity Minimal o *-Unhealthy: resolver Purview / data security antes del upsell de Copilot.',
    test: (t) => ['Minimal', 'Limited-Unhealthy', 'Advanced-Unhealthy'].includes(t.dataSecurityMaturity),
  },
];

export function quickLabel(q: QuickFilter): string {
  switch (q.kind) {
    case 'scenario':
      return `Copilot Opportunity: ${q.value}`;
    case 'licenses':
      return `Copilot Tenant Penetration: ${q.value}`;
    case 'signal':
      return `Free-Paid Signals: ${SIGNAL_LABELS[q.value]}`;
    case 'e7':
      return 'E7 Upsell-ready';
    case 'earnings':
      return 'Potential Earnings > $0';
    case 'mciEngagement':
      return `MCI Engagement Name: ${q.value}`;
    case 'usage':
      return `Copilot Usage by License: ${q.value} > 0`;
    case 'playbook':
      return `Playbook: ${PLAYBOOKS.find((p) => p.id === q.value)?.label}`;
  }
}

export function quickTest(q: QuickFilter, t: TenantView): boolean {
  switch (q.kind) {
    case 'scenario':
      return t.scenario === q.value;
    case 'licenses':
      return q.value === 'Has Copilot Licenses' ? t.hasCopilotLicenses : !t.hasCopilotLicenses;
    case 'signal':
      return t.signals[q.value];
    case 'e7':
      return t.e7Ready;
    case 'earnings':
      return t.potentialEarnings > 0;
    case 'mciEngagement':
      return t.mciEngagements.some((e) => e.name === q.value);
    case 'usage':
      return q.value === 'Licensed MAU' ? t.licensedMau > 0 : q.value === 'Unlicensed MAU' ? t.unlicensedMau > 0 : t.allCopilotMau > 0;
    case 'playbook':
      return PLAYBOOKS.find((p) => p.id === q.value)!.test(t);
  }
}

export function applyFacets(rows: TenantView[], facets: FacetState): TenantView[] {
  return rows.filter((t) =>
    FACETS.every((f) => {
      const sel = facets[f.key];
      return !sel || sel.length === 0 || sel.includes(f.get(t));
    }),
  );
}

export function applySearch(rows: TenantView[], q: string): TenantView[] {
  const s = q.trim().toLowerCase();
  if (!s) return rows;
  return rows.filter((t) =>
    [t.tenantName, t.partnerName, t.t2ResellerName ?? '', t.customerName].some((v) => v.toLowerCase().includes(s)),
  );
}
