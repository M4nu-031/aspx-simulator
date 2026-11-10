import { availableBillableCredits, creditOverage, creditsConsumed, type TenantView } from './metrics';
import { fmtBool, fmtInt, fmtMonth, fmtPct, fmtText, fmtUsd } from './format';

export type FlyoutKind =
  | 'tenant'
  | 'opportunity'
  | 'e7'
  | 'allMau'
  | 'agents'
  | 'mtdCredits'
  | 'weekly'
  | 'admin'
  | 'cowork'
  | 'dataSecurity';
export type ColFormat = 'text' | 'int' | 'pct' | 'usd' | 'month' | 'bool';
export type Raw = string | number | boolean | null;

export interface ColumnSpec {
  id: string;
  header: string;
  group: string;
  value: (t: TenantView) => Raw;
  format: ColFormat;
  /** Hidden by default (toggle in Change columns). */
  hidden?: boolean;
  /** Renders as a blue link that opens this flyout. */
  flyout?: FlyoutKind;
  /** Optional display override. */
  display?: (t: TenantView) => string;
  width?: number;
}

export const GROUPS = [
  'Tenant profile',
  'Renewals & licensing',
  'Copilot seats & trial',
  'Usage & adoption',
  'Free-to-paid signals',
  'Agents, credits & Cowork',
  'Opportunity & E7',
  'Partner & incentives',
  'E7 readiness',
] as const;

const G = GROUPS;

export function formatValue(v: Raw, f: ColFormat): string {
  switch (f) {
    case 'int':
      return fmtInt(v as number | null);
    case 'pct':
      return fmtPct(v as number | null);
    case 'usd':
      return fmtUsd(v as number | null);
    case 'month':
      return fmtMonth(v as string | null);
    case 'bool':
      return fmtBool(v as boolean | null);
    default:
      return fmtText(v == null ? null : String(v));
  }
}

export function cellText(c: ColumnSpec, t: TenantView): string {
  return c.display ? c.display(t) : formatValue(c.value(t), c.format);
}

const adminLabel = (t: TenantView) => (t.adminNeedsAttention === 0 ? 'Healthy' : `${t.adminNeedsAttention} Needs attention`);
const check = (t: TenantView, key: string) => t.adminChecks.find((c) => c.key === key)!.healthy;

export const COLUMNS: ColumnSpec[] = [
  // --- Tenant profile
  { id: 'tenantName', header: 'Tenant Name', group: G[0], value: (t) => t.tenantName, format: 'text', flyout: 'tenant', width: 170 },
  { id: 'tenantId', header: 'Tenant ID', group: G[0], value: (t) => t.tenantId, format: 'text', width: 130 },
  { id: 'country', header: 'Tenant Country/Region', group: G[0], value: (t) => t.country, format: 'text' },
  { id: 'segment', header: 'Tenant Segment', group: G[0], value: (t) => t.segment, format: 'text', width: 100 },
  { id: 'subSegment', header: 'Customer Sub-Segment', group: G[0], value: (t) => t.subSegment, format: 'text' },
  { id: 'industry', header: 'Industry / Vertical', group: G[0], value: (t) => t.industry, format: 'text' },
  { id: 'tpid', header: 'Customer TPID', group: G[0], value: (t) => t.tpid, format: 'text', width: 100 },
  { id: 'customerName', header: 'Customer Name', group: G[0], value: (t) => t.customerName, format: 'text', width: 160 },
  // --- Renewals & licensing
  { id: 'eaRenewal', header: 'EA Renewal', group: G[1], value: (t) => t.eaRenewal, format: 'month', width: 95 },
  { id: 'largestCspRenewal', header: 'Largest Seat CSP Renewal', group: G[1], value: (t) => t.largestCspRenewal, format: 'month', width: 100 },
  { id: 'dominantSku', header: 'Dominant SKU Group', group: G[1], value: (t) => t.dominantSku, format: 'text', width: 110 },
  // --- Copilot seats & trial
  { id: 'eligibleSeats', header: 'Copilot Eligible M365 Seats', group: G[2], value: (t) => t.eligibleSeats, format: 'int', width: 95 },
  { id: 'seatsWhitespace', header: 'Copilot Seats Whitespace', group: G[2], value: (t) => t.seatsWhitespace, format: 'int', width: 100 },
  { id: 'trialRec', header: 'Copilot in 30 Trial Recommendation', group: G[2], value: (t) => t.trialRecommendation, format: 'text', width: 150 },
  { id: 'trialDays', header: 'Copilot in 30 Days Remaining', group: G[2], value: (t) => t.trialDaysRemaining, format: 'int', width: 100 },
  { id: 'cspLicenses', header: 'CSP Transacted Licenses', group: G[2], value: (t) => t.cspTransactedLicenses, format: 'int', width: 100 },
  { id: 'cspPct', header: 'CSP Transacted Licenses %', group: G[2], value: (t) => t.cspTransactedPct, format: 'pct', width: 100 },
  // --- Usage & adoption
  { id: 'licensedMau', header: 'Copilot MAU (Licensed)', group: G[3], value: (t) => t.licensedMau, format: 'int', width: 95 },
  { id: 'pau', header: 'Copilot PAU', group: G[3], value: (t) => t.pau, format: 'int', width: 85 },
  { id: 'utilization', header: 'Copilot Utilization', group: G[3], value: (t) => t.utilization, format: 'pct', width: 95 },
  { id: 'frontier', header: 'Frontier Enabled', group: G[3], value: (t) => t.frontier, format: 'text', width: 100 },
  {
    id: 'adminSettings',
    header: 'Admin Settings Recommendations',
    group: G[3],
    value: (t) => t.adminNeedsAttention,
    display: adminLabel,
    format: 'int',
    flyout: 'admin',
    width: 130,
  },
  // --- Free-to-paid signals
  { id: 'unlicensedMau', header: 'Free Copilot Chat MAU (Unlicensed)', group: G[4], value: (t) => t.unlicensedMau, format: 'int', width: 110 },
  { id: 'freeChatWhitespace', header: 'Free Chat MAU Whitespace', group: G[4], value: (t) => t.freeChatWhitespace, format: 'int', width: 100 },
  { id: 'allCopilotMau', header: 'All Copilot MAU', group: G[4], value: (t) => t.allCopilotMau, format: 'int', flyout: 'allMau', width: 90 },
  { id: 'freeToPaid', header: 'Free to Paid Whitespace', group: G[4], value: (t) => t.freeToPaidWhitespace, format: 'pct', width: 100 },
  { id: 'usageLimits', header: 'Monthly Users Experiencing Usage Limits', group: G[4], value: (t) => t.usageLimitUsers, format: 'int', width: 120 },
  { id: 'licenseRequests', header: 'Cumulative License Requests', group: G[4], value: (t) => t.licenseRequests, format: 'int', width: 100 },
  // --- Agents, credits & Cowork
  { id: 'allAgentsMau', header: 'All Agents MAU', group: G[5], value: (t) => t.allAgentsMau, format: 'int', flyout: 'agents', width: 90 },
  { id: 'mtdCredits', header: 'MTD Credits Consumed', group: G[5], value: (t) => t.mtdCredits, format: 'int', flyout: 'mtdCredits', width: 100 },
  { id: 'monthlyCreditLimit', header: 'Monthly Credit Limit', group: G[5], value: (t) => t.monthlyCreditLimit, format: 'int', width: 95 },
  { id: 'peakMonthly', header: 'Peak Monthly Consumption', group: G[5], value: (t) => t.credits?.peakMonthly ?? null, format: 'int', width: 105 },
  { id: 'weekly', header: 'Weekly Consumption', group: G[5], value: (t) => t.weeklyConsumption, format: 'int', flyout: 'weekly', width: 100 },
  { id: 'coworkMau', header: 'Cowork MAU', group: G[5], value: (t) => t.coworkMau, format: 'int', flyout: 'cowork', width: 85 },
  { id: 'coworkCredits', header: 'Monthly Cowork Credits per User', group: G[5], value: (t) => t.coworkCreditsPerUser, format: 'int', width: 110 },
  // --- Opportunity & E7
  { id: 'scenario', header: 'Copilot Opportunity', group: G[6], value: (t) => t.scenario, format: 'text', flyout: 'opportunity', width: 110 },
  {
    id: 'e7',
    header: 'E7 Opportunity',
    group: G[6],
    value: (t) => (t.e7Ready ? 'Upsell to E7' : null),
    format: 'text',
    flyout: 'e7',
    width: 105,
  },
  // --- Partner & incentives
  { id: 'partnerName', header: 'Partner Name', group: G[7], value: (t) => t.partnerName, format: 'text', width: 160 },
  { id: 'mpn', header: 'Partner Center ID (MPN)', group: G[7], value: (t) => t.partnerMpnId, format: 'text', width: 100 },
  { id: 'dsm', header: 'Data Security Maturity', group: G[7], value: (t) => t.dataSecurityMaturity, format: 'text', flyout: 'dataSecurity', width: 120 },
  { id: 'mciEligibility', header: 'MCI Eligibility', group: G[7], value: (t) => (t.mciEligible ? 'Eligible' : 'Not eligible'), format: 'text', width: 95 },
  { id: 'claimId', header: 'Claim ID', group: G[7], value: (t) => t.claimId, format: 'text', width: 115 },
  { id: 'claimedByOthers', header: 'Claimed By Others', group: G[7], value: (t) => t.claimedByOthers, format: 'bool', width: 90 },
  { id: 'potentialEarnings', header: 'Potential Earnings', group: G[7], value: (t) => t.potentialEarnings, format: 'usd', width: 100 },
  { id: 'cspTier', header: 'CSP Tier', group: G[7], value: (t) => t.cspTier, format: 'text', width: 90 },
  { id: 'cporAssociation', header: 'CPOR Association', group: G[7], value: (t) => t.cporAssociation, format: 'bool', width: 95 },
  { id: 'cspAssociation', header: 'CSP Association', group: G[7], value: (t) => t.cspAssociation, format: 'bool', width: 95 },
  { id: 't2Id', header: 'T2 Reseller ID', group: G[7], value: (t) => t.t2ResellerId, format: 'text', width: 95 },
  { id: 't2Name', header: 'T2 Reseller Name', group: G[7], value: (t) => t.t2ResellerName, format: 'text', width: 130 },
  { id: 'mciEngagement', header: 'MCI Engagement Name', group: G[7], value: (t) => t.mciEngagementName, format: 'text', width: 170 },
  // --- E7 readiness
  { id: 'agentIntensity', header: 'Agent Intensity', group: G[8], value: (t) => t.agentIntensity, format: 'text', width: 90 },
  { id: 'entraPen', header: 'Entra Penetration', group: G[8], value: (t) => t.entraPenetration, format: 'pct', width: 95 },
  { id: 'paidPen', header: 'M365 Copilot Penetration', group: G[8], value: (t) => t.paidPenetration, format: 'pct', width: 100 },
  { id: 'e7Sub', header: 'E7 Sub Scenario', group: G[8], value: (t) => t.e7SubScenario, format: 'text', width: 150 },

  // ===== Hidden by default =====
  { id: 'adoptionStatus', header: 'Adoption Status', group: G[3], value: (t) => t.adoptionStatus, format: 'text', hidden: true, width: 130 },
  { id: 'freeChatPen', header: 'Free Chat Penetration', group: G[4], value: (t) => t.freeChatPenetration, format: 'pct', hidden: true },
  {
    id: 'pctFreeLimits',
    header: 'Percentage of Free Users Reaching Usage Limits',
    group: G[4],
    value: (t) => t.pctFreeUsersReachingLimits,
    format: 'pct',
    hidden: true,
    width: 130,
  },
  { id: 'appWord', header: 'Copilot in Word MAU', group: G[3], value: (t) => t.apps.word, format: 'int', hidden: true },
  { id: 'appExcel', header: 'Copilot in Excel MAU', group: G[3], value: (t) => t.apps.excel, format: 'int', hidden: true },
  { id: 'appPpt', header: 'Copilot in PowerPoint MAU', group: G[3], value: (t) => t.apps.powerpoint, format: 'int', hidden: true },
  { id: 'appOutlook', header: 'Copilot in Outlook MAU', group: G[3], value: (t) => t.apps.outlook, format: 'int', hidden: true },
  { id: 'appTeams', header: 'Copilot in Teams MAU', group: G[3], value: (t) => t.apps.teams, format: 'int', hidden: true },
  { id: 'appOneNote', header: 'Copilot in OneNote MAU', group: G[3], value: (t) => t.apps.onenote, format: 'int', hidden: true },
  { id: 'appEngage', header: 'Copilot in Engage MAU', group: G[3], value: (t) => t.apps.engage, format: 'int', hidden: true },
  { id: 'agChat', header: 'Copilot Chat Agents MAU', group: G[5], value: (t) => t.agents.chat, format: 'int', hidden: true },
  { id: 'agConnector', header: 'Connector Agents MAU', group: G[5], value: (t) => t.agents.connector, format: 'int', hidden: true },
  { id: 'agPlugins', header: 'Plugins Agents MAU', group: G[5], value: (t) => t.agents.plugins, format: 'int', hidden: true },
  { id: 'agCustom', header: 'Custom Engine Agents MAU', group: G[5], value: (t) => t.agents.customEngine, format: 'int', hidden: true },
  { id: 'appSales', header: 'Sales Copilot (CRM) MAU', group: G[3], value: (t) => t.apps.salesCrm, format: 'int', hidden: true },
  { id: 'webSearch', header: 'Web Search', group: G[3], value: (t) => t.admin.webSearch, format: 'text', hidden: true },
  { id: 'webSearchH', header: 'Web Search - Healthy', group: G[3], value: (t) => check(t, 'webSearch'), format: 'bool', hidden: true },
  { id: 'taskbar', header: 'Taskbar Pinning', group: G[3], value: (t) => t.admin.taskbarPinning, format: 'text', hidden: true },
  { id: 'taskbarH', header: 'Taskbar Pinning - Healthy', group: G[3], value: (t) => check(t, 'taskbar'), format: 'bool', hidden: true },
  { id: 'blocked1P', header: 'Blocked 1P Agents', group: G[3], value: (t) => t.admin.blocked1PAgents, format: 'int', hidden: true },
  { id: 'blocked1PH', header: 'Blocked 1P Agents - Healthy', group: G[3], value: (t) => check(t, 'blocked1P'), format: 'bool', hidden: true },
  { id: 'appStatus', header: 'App Status in Integrated Apps', group: G[3], value: (t) => t.admin.appStatus, format: 'text', hidden: true },
  {
    id: 'appStatusH',
    header: 'App Status in Integrated Apps - Healthy',
    group: G[3],
    value: (t) => check(t, 'appStatus'),
    format: 'bool',
    hidden: true,
  },
  { id: 'channel', header: 'Channel Readiness', group: G[3], value: (t) => t.admin.channelReadiness, format: 'pct', hidden: true },
  { id: 'channelH', header: 'Channel Readiness - Healthy', group: G[3], value: (t) => check(t, 'channel'), format: 'bool', hidden: true },
  { id: 'priorHwm', header: 'Prior High Water Mark (HWM)', group: G[7], value: (t) => t.priorHwm, format: 'int', hidden: true },
  { id: 'startingHwm', header: 'Starting High Water Mark (HWM)', group: G[7], value: (t) => t.startingHwm, format: 'int', hidden: true },
  { id: 'oppUnits', header: 'Opportunity Units', group: G[7], value: (t) => t.opportunityUnits, format: 'int', hidden: true },
  { id: 'rate', header: 'Rate per Unit', group: G[7], value: (t) => t.ratePerUnit, format: 'usd', hidden: true },
  { id: 'maxComp', header: 'Max Comp Units', group: G[7], value: (t) => t.maxCompUnits, format: 'int', hidden: true },
  { id: 'cporEarnings', header: 'CPOR Potential Earnings', group: G[7], value: (t) => t.cporPotentialEarnings, format: 'usd', hidden: true },
  { id: 'mciEarnings', header: 'MCI Potential Earnings', group: G[7], value: (t) => t.mciPotentialEarnings, format: 'usd', hidden: true },
  { id: 'earliestCsp', header: 'Earliest CSP Renewal', group: G[1], value: (t) => t.earliestCspRenewal, format: 'month', hidden: true },
  { id: 'nonProfit', header: 'Non-Profit Pricing', group: G[7], value: (t) => t.nonProfit, format: 'bool', hidden: true },
  { id: 'domain', header: 'Tenant Domain', group: G[0], value: (t) => t.tenantDomain, format: 'text', hidden: true, width: 150 },
  { id: 'cspPromotions', header: 'CSP Promotions', group: G[7], value: (t) => t.cspPromotions, format: 'text', hidden: true, width: 180 },

  // ----- Hidden: flyout detail available as columns (ABSSInsights export layout) -----
  { id: 'propensity', header: 'Copilot Purchase Propensity', group: G[6], value: (t) => t.propensity, format: 'text', hidden: true },
  ...creditColumns(),
  ...weeklyColumns(),
  ...coworkColumns(),
  { id: 'utilMipP2', header: 'Utilization MIP P2', group: G[7], value: (t) => secUtil(t, 'mipP2'), format: 'pct', hidden: true },
  { id: 'utilIrm', header: 'Utilization IRM', group: G[7], value: (t) => secUtil(t, 'irm'), format: 'pct', hidden: true },
  ...adminColumns(),
];

/** Fields that only exist inside flyouts and are selectable for Download only (none left: all are columns now). */
export const DOWNLOAD_ONLY: ColumnSpec[] = [];

// ---------- hidden column builders ----------

function secUtil(t: TenantView, key: 'mipP2' | 'irm'): number | null {
  const w = t.dataSecurity.workloads.find((x) => x.key === key)!;
  return w.pau > 0 ? w.utilization : null;
}

function creditColumns(): ColumnSpec[] {
  // months: [M-2, M-1, MTD]
  const periods: { idx: 0 | 1 | 2; p: string; id: string }[] = [
    { idx: 2, p: 'MTD', id: 'mtd' },
    { idx: 1, p: 'M-1', id: 'm1' },
    { idx: 0, p: 'M-2', id: 'm2' },
  ];
  const at = (t: TenantView, i: number) => t.credits?.months[i] ?? null;
  const n = (v: number | undefined) => (v == null ? null : v);
  const cols: ColumnSpec[] = [
    { id: 'm1Credits', header: 'M-1 Credits Consumed', group: G[5], value: (t) => (at(t, 1) ? creditsConsumed(at(t, 1)!) : null), format: 'int', hidden: true },
    { id: 'm2Credits', header: 'M-2 Credits Consumed', group: G[5], value: (t) => (at(t, 0) ? creditsConsumed(at(t, 0)!) : null), format: 'int', hidden: true },
  ];
  for (const { idx, p, id } of periods) {
    cols.push({ id: `${id}Paygo`, header: `${p} PAYGO Credits Consumed`, group: G[5], value: (t) => n(at(t, idx)?.paygo), format: 'int', hidden: true });
    cols.push({ id: `${id}Prepaid`, header: `${p} Pre-Paid Credits Consumed`, group: G[5], value: (t) => n(at(t, idx)?.prepaid), format: 'int', hidden: true });
  }
  for (const { idx, p, id } of periods) {
    cols.push({ id: `${id}NonBill`, header: `${p} Non Billable Credits Consumed`, group: G[5], value: (t) => n(at(t, idx)?.nonBillable), format: 'int', hidden: true });
  }
  for (const { idx, p, id } of periods) {
    cols.push({ id: `${id}Overage`, header: `${p} Overage`, group: G[5], value: (t) => (at(t, idx) ? creditOverage(at(t, idx)!) : null), format: 'int', hidden: true });
  }
  for (const { idx, p, id } of periods) {
    const header = p === 'MTD' ? 'Current Monthly Credit Limit' : `${p} Monthly Credit Limit`;
    cols.push({ id: `${id}Limit`, header, group: G[5], value: (t) => n(at(t, idx)?.limit), format: 'int', hidden: true });
  }
  for (const { idx, p, id } of periods) {
    const header = p === 'MTD' ? 'Available Billable Credits' : `${p} Available Billable Credits`;
    cols.push({ id: `${id}Avail`, header, group: G[5], value: (t) => (at(t, idx) ? availableBillableCredits(at(t, idx)!) : null), format: 'int', hidden: true });
  }
  return cols;
}

function weeklyColumns(): ColumnSpec[] {
  const w = (t: TenantView) => t.weekly;
  return [
    { id: 'wkCowork', header: 'Cowork Credits Consumed', group: G[5], value: (t) => w(t)?.cowork ?? null, format: 'int', hidden: true },
    { id: 'wkWorkIq', header: 'WorkIQ Credits Consumed', group: G[5], value: (t) => w(t)?.workIq ?? null, format: 'int', hidden: true },
    { id: 'wkGh', header: 'GitHub Copilot Credits Consumed', group: G[5], value: (t) => w(t)?.githubCopilot ?? null, format: 'int', hidden: true },
    { id: 'wkDeep', header: 'Deepwork Credits Consumed', group: G[5], value: (t) => w(t)?.deepWork ?? null, format: 'int', hidden: true },
  ];
}

function coworkColumns(): ColumnSpec[] {
  const c = (t: TenantView) => t.coworkStats;
  return [
    { id: 'cwRetention', header: 'Cowork MoM Retention', group: G[5], value: (t) => c(t)?.momRetention ?? null, format: 'pct', hidden: true },
    { id: 'cwTasks', header: 'Total Cowork Tasks', group: G[5], value: (t) => c(t)?.totalTasks ?? null, format: 'int', hidden: true },
    { id: 'cwScheduled', header: 'Scheduled Cowork Tasks', group: G[5], value: (t) => c(t)?.scheduledTasks ?? null, format: 'int', hidden: true },
    { id: 'cwInteractive', header: 'Interactive Tasks', group: G[5], value: (t) => c(t)?.interactiveTasks ?? null, format: 'int', hidden: true },
    { id: 'cwSucceed', header: 'Turns Succeed', group: G[5], value: (t) => c(t)?.turnsSucceeded ?? null, format: 'int', hidden: true },
    { id: 'cwFailed', header: 'Turns Failed', group: G[5], value: (t) => c(t)?.turnsFailed ?? null, format: 'int', hidden: true },
    { id: 'cwAbandoned', header: 'Turns Abandoned', group: G[5], value: (t) => c(t)?.turnsAbandoned ?? null, format: 'int', hidden: true },
    { id: 'cwSuccessRate', header: 'Turns Success Rate', group: G[5], value: (t) => c(t)?.turnsSuccessRate ?? null, format: 'pct', hidden: true },
  ];
}

function adminColumns(): ColumnSpec[] {
  const pair = (id: string, header: string, key: string): ColumnSpec[] => [
    { id, header, group: G[3], value: (t) => t.adminChecks.find((c) => c.key === key)!.value, format: 'text', hidden: true },
    { id: `${id}H`, header: `${header} - Healthy`, group: G[3], value: (t) => check(t, key), format: 'bool', hidden: true },
  ];
  return [
    ...pair('copilotFrontier', 'Copilot Frontier', 'frontier'),
    ...pair('teamsTranscription', 'Teams Transcription', 'transcription'),
    ...pair('ubb', 'Usage-Based Billing', 'ubb'),
    ...pair('copilotConnectors', 'Copilot Connectors', 'connectors'),
  ];
}

export const DEFAULT_ORDER = COLUMNS.map((c) => c.id);
export const DEFAULT_VISIBILITY: Record<string, boolean> = Object.fromEntries(COLUMNS.map((c) => [c.id, !c.hidden]));
export const columnById = (id: string) => COLUMNS.find((c) => c.id === id) ?? DOWNLOAD_ONLY.find((c) => c.id === id);
