import { AS_OF, PARTNERS, type TenantRecord, type AdminSettings, type FrontierStatus, type CreditMonth } from '../data/tenants';
import {
  coworkCreditsPerUser,
  coworkMetrics,
  dataSecurityProfile,
  tenantLicenses,
  type CoworkMetrics,
  type DataSecurityProfile,
  type LicenseLine,
} from './licensing';

export type Scenario = 'Acquire' | 'Monetize' | 'Grow' | 'Not targeted';
export const SCENARIOS: Scenario[] = ['Acquire', 'Monetize', 'Grow', 'Not targeted'];

/** Penetration threshold used by the targeting scenarios (5%). */
export const PENETRATION_THRESHOLD = 0.05;

// ---------- per-tenant formulas ----------

/** Copilot Utilization = min(MAU / PAU, 100%). Null when there are no paid seats. */
export function copilotUtilization(licensedMau: number, pau: number): number | null {
  if (pau <= 0) return null;
  return Math.min(licensedMau / pau, 1);
}

/** Copilot Seats Whitespace = Copilot Eligible M365 Seats − Copilot PAU. */
export function seatsWhitespace(eligible: number, pau: number): number {
  return Math.max(eligible - pau, 0);
}

/** Free to Paid Whitespace = Unlicensed MAU / (Unlicensed MAU + PAU). */
export function freeToPaidWhitespace(unlicensedMau: number, pau: number): number | null {
  const d = unlicensedMau + pau;
  return d === 0 ? null : unlicensedMau / d;
}

/** Free Chat Penetration = Free (unlicensed) Chat MAU / Copilot Eligible M365 Seats. */
export function freeChatPenetration(unlicensedMau: number, eligible: number): number {
  return eligible === 0 ? 0 : unlicensedMau / eligible;
}

/** M365 Copilot (paid) Penetration = PAU / Copilot Eligible M365 Seats. */
export function paidPenetration(pau: number, eligible: number): number {
  return eligible === 0 ? 0 : pau / eligible;
}

/** All Copilot MAU = Licensed + Unlicensed. */
export function allCopilotMau(licensedMau: number, unlicensedMau: number): number {
  return licensedMau + unlicensedMau;
}

/** Free Chat MAU Whitespace = Eligible − Free Chat MAU. */
export function freeChatWhitespace(eligible: number, unlicensedMau: number): number {
  return Math.max(eligible - unlicensedMau, 0);
}

/**
 * Targeting scenario. Propensity must be High/Medium (Low → Not targeted).
 * paid penetration > 5% → Grow; Chat MAU penetration > 5% (paid ≤ 5%) → Monetize; else Acquire.
 */
export function assignScenario(t: Pick<TenantRecord, 'propensity' | 'pau' | 'unlicensedMau' | 'eligibleSeats'>): Scenario {
  if (t.propensity === 'Low') return 'Not targeted';
  const paid = paidPenetration(t.pau, t.eligibleSeats);
  const chat = freeChatPenetration(t.unlicensedMau, t.eligibleSeats);
  if (paid > PENETRATION_THRESHOLD) return 'Grow';
  if (chat > PENETRATION_THRESHOLD) return 'Monetize';
  return 'Acquire';
}

/** ASPX visibility rule: SME&C > 25 and Enterprise > 150 Copilot Eligible M365 Seats. */
export function isEligibleForCopilotTab(t: Pick<TenantRecord, 'segment' | 'eligibleSeats'>): boolean {
  return t.segment === 'Enterprise' ? t.eligibleSeats > 150 : t.eligibleSeats > 25;
}

export interface AdminCheck {
  key: string;
  label: string;
  value: string;
  healthy: boolean;
  learnUrl: string;
}

export function adminChecks(a: AdminSettings, frontier: FrontierStatus): AdminCheck[] {
  const L = 'https://learn.microsoft.com/copilot/microsoft-365/';
  return [
    { key: 'frontier', label: 'Frontier Enablement', value: frontier, healthy: frontier !== 'Disabled', learnUrl: L },
    { key: 'webSearch', label: 'Web Search for Copilot', value: a.webSearch, healthy: a.webSearch === 'Enabled', learnUrl: L },
    {
      key: 'blocked1P',
      label: 'Blocking of First-Party (1P) Agents',
      value: `${a.blocked1PAgents} blocked`,
      healthy: a.blocked1PAgents === 0,
      learnUrl: L,
    },
    {
      key: 'channel',
      label: 'Copilot Channel Readiness',
      value: `${Math.round(a.channelReadiness * 100)}%`,
      healthy: a.channelReadiness >= 0.8,
      learnUrl: L,
    },
    { key: 'appStatus', label: 'Copilot App Status via Integrated Apps', value: a.appStatus, healthy: a.appStatus === 'Available', learnUrl: L },
    { key: 'taskbar', label: 'Taskbar Pinning', value: a.taskbarPinning, healthy: a.taskbarPinning === 'Pinned', learnUrl: L },
    {
      key: 'ubb',
      label: 'Usage-Based Billing',
      value: a.usageBasedBilling ? 'Enabled' : 'Disabled',
      healthy: a.usageBasedBilling,
      learnUrl: L,
    },
    {
      key: 'transcription',
      label: 'Teams Transcription',
      value: a.teamsTranscription ? 'Enabled' : 'Disabled',
      healthy: a.teamsTranscription,
      learnUrl: L,
    },
    {
      key: 'connectors',
      label: 'Copilot Connectors',
      value: a.copilotConnectors ? 'Enabled' : 'Disabled',
      healthy: a.copilotConnectors,
      learnUrl: L,
    },
  ];
}

/** Months between the data snapshot (AS_OF) and a YYYY-MM month. */
export function monthsUntil(yyyymm: string | null, from: Date = AS_OF): number | null {
  if (!yyyymm) return null;
  const [y, m] = yyyymm.split('-').map(Number);
  return (y - from.getFullYear()) * 12 + (m - 1 - from.getMonth());
}

// ---------- enriched tenant ----------

export interface TenantView extends TenantRecord {
  partnerName: string;
  partnerMpnId: string;
  scenario: Scenario;
  utilization: number | null;
  seatsWhitespace: number;
  freeToPaidWhitespace: number | null;
  freeChatPenetration: number;
  paidPenetration: number;
  allCopilotMau: number;
  freeChatWhitespace: number;
  allAgentsMau: number;
  cspTransactedPct: number;
  hasCopilotLicenses: boolean;
  e7Ready: boolean;
  mciEligible: boolean;
  mciPotentialEarnings: number;
  mciEngagementName: string | null;
  opportunityUnits: number;
  cporPotentialEarnings: number;
  potentialEarnings: number;
  pctFreeUsersReachingLimits: number | null;
  mtdCredits: number | null;
  monthlyCreditLimit: number | null;
  weeklyConsumption: number | null;
  adminChecks: AdminCheck[];
  adminNeedsAttention: number;
  signals: { usageLimits: boolean; freeChat: boolean; licenseRequests: boolean };
  coworkCreditsPerUser: number | null;
  coworkStats: CoworkMetrics | null;
  dataSecurity: DataSecurityProfile;
  licenses: LicenseLine[];
}

export function creditsConsumed(m: { paygo: number; prepaid: number }): number {
  return m.paygo + m.prepaid;
}

/**
 * Projected month-end consumption (simulator): MTD credits at the daily pace so far, extended to the
 * whole month of the data snapshot (11/06/2026 → 6 of 30 days elapsed).
 */
export function projectedMonthEnd(mtd: number, asOf: Date = AS_OF): number {
  const days = new Date(asOf.getFullYear(), asOf.getMonth() + 1, 0).getDate();
  return Math.round((mtd / asOf.getDate()) * days);
}

/** Credits consumed beyond the configured monthly limit. */
export function creditOverage(m: CreditMonth): number {
  return Math.max(creditsConsumed(m) - m.limit, 0);
}

/** Remaining billable credits under the configured limit. */
export function availableBillableCredits(m: CreditMonth): number {
  return Math.max(m.limit - creditsConsumed(m), 0);
}

export function enrich(t: TenantRecord): TenantView {
  const partner = PARTNERS.find((p) => p.id === t.partnerId);
  const utilization = copilotUtilization(t.licensedMau, t.pau);
  const fcp = freeChatPenetration(t.unlicensedMau, t.eligibleSeats);
  const opportunityUnits = Math.max(t.pau - t.priorHwm, 0);
  const cpor = t.cporAssociation ? Math.min(opportunityUnits, t.maxCompUnits) * t.ratePerUnit : 0;
  const mci = t.mciEngagements.reduce((s, e) => s + e.earnings, 0);
  const checks = adminChecks(t.admin, t.frontier);
  const mtd = t.credits ? creditsConsumed(t.credits.months[2]) : null;
  return {
    ...t,
    partnerName: partner?.name ?? 'Not available',
    partnerMpnId: partner?.mpnId ?? 'Not available',
    scenario: assignScenario(t),
    utilization,
    seatsWhitespace: seatsWhitespace(t.eligibleSeats, t.pau),
    freeToPaidWhitespace: freeToPaidWhitespace(t.unlicensedMau, t.pau),
    freeChatPenetration: fcp,
    paidPenetration: paidPenetration(t.pau, t.eligibleSeats),
    allCopilotMau: allCopilotMau(t.licensedMau, t.unlicensedMau),
    freeChatWhitespace: freeChatWhitespace(t.eligibleSeats, t.unlicensedMau),
    allAgentsMau: t.agents.chat + t.agents.connector + t.agents.plugins + t.agents.customEngine,
    cspTransactedPct: t.totalM365Licenses === 0 ? 0 : t.cspTransactedLicenses / t.totalM365Licenses,
    hasCopilotLicenses: t.pau > 0,
    e7Ready: t.e7SubScenario !== null,
    mciEligible: t.mciEngagements.length > 0,
    mciPotentialEarnings: mci,
    mciEngagementName: t.mciEngagements.length ? t.mciEngagements.map((e) => e.name).join('; ') : null,
    opportunityUnits,
    cporPotentialEarnings: cpor,
    potentialEarnings: mci + cpor,
    pctFreeUsersReachingLimits: t.unlicensedMau > 0 ? t.usageLimitUsers / t.unlicensedMau : null,
    mtdCredits: mtd,
    monthlyCreditLimit: t.credits ? t.credits.months[2].limit : null,
    weeklyConsumption: t.weekly ? t.weekly.cowork + t.weekly.workIq + t.weekly.githubCopilot + t.weekly.deepWork : null,
    coworkCreditsPerUser: coworkCreditsPerUser(t),
    coworkStats: coworkMetrics(t),
    dataSecurity: dataSecurityProfile(t),
    licenses: tenantLicenses(t),
    adminChecks: checks,
    adminNeedsAttention: checks.filter((c) => !c.healthy).length,
    signals: {
      usageLimits: t.usageLimitUsers > 0,
      freeChat: fcp > PENETRATION_THRESHOLD,
      licenseRequests: t.licenseRequests > 0,
    },
  };
}

// ---------- aggregates ----------

export interface Kpis {
  tenants: number;
  seatPenetration: number;
  paidUtilization: number;
  acquire: number;
  monetize: number;
  grow: number;
  notTargeted: number;
  e7UpsellReady: number;
  potentialEarnings: number;
}

export function computeKpis(rows: TenantView[]): Kpis {
  const sum = (f: (r: TenantView) => number) => rows.reduce((s, r) => s + f(r), 0);
  const pau = sum((r) => r.pau);
  const eligible = sum((r) => r.eligibleSeats);
  const mau = sum((r) => r.licensedMau);
  const count = (s: Scenario) => rows.filter((r) => r.scenario === s).length;
  return {
    tenants: rows.length,
    seatPenetration: eligible === 0 ? 0 : pau / eligible,
    paidUtilization: pau === 0 ? 0 : Math.min(mau / pau, 1),
    acquire: count('Acquire'),
    monetize: count('Monetize'),
    grow: count('Grow'),
    notTargeted: count('Not targeted'),
    e7UpsellReady: rows.filter((r) => r.e7Ready).length,
    potentialEarnings: sum((r) => r.potentialEarnings),
  };
}

export function tenantPenetration(rows: TenantView[]) {
  const has = rows.filter((r) => r.hasCopilotLicenses).length;
  return { has, none: rows.length - has };
}

export function freePaidSignals(rows: TenantView[]) {
  return {
    usageLimits: rows.filter((r) => r.signals.usageLimits).length,
    freeChat: rows.filter((r) => r.signals.freeChat).length,
    licenseRequests: rows.filter((r) => r.signals.licenseRequests).length,
  };
}

export function usageHistory(rows: TenantView[]) {
  const n = rows[0]?.history.licensedMau.length ?? 6;
  const licensed = Array.from({ length: n }, (_, i) => rows.reduce((s, r) => s + r.history.licensedMau[i], 0));
  const unlicensed = Array.from({ length: n }, (_, i) => rows.reduce((s, r) => s + r.history.unlicensedMau[i], 0));
  return { licensed, unlicensed, all: licensed.map((v, i) => v + unlicensed[i]) };
}

export function mciEarningsByEngagement(rows: TenantView[]): { name: string; value: number }[] {
  const map = new Map<string, number>();
  rows.forEach((r) => r.mciEngagements.forEach((e) => map.set(e.name, (map.get(e.name) ?? 0) + e.earnings)));
  return [...map.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
}
