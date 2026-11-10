/**
 * Licensing profile and Purview data security workloads.
 *
 * Plan contents come from the Microsoft 365 comparison sheets in the project brief
 * (M365Enterprise.pdf and M365BP.pdf, publish date November 1, 2026). Quantities are
 * never invented here: every seat count is derived from the tenant's existing fields
 * (Copilot Eligible M365 Seats, total M365 licenses, Copilot PAU, add-ons).
 */
import type { DataSecurityMaturity, TenantRecord } from '../data/tenants';

// ---------- plan catalog (from the PDFs) ----------

type Workload = 'mip' | 'mipP2' | 'irm' | 'dlm' | 'dlmP2' | 'dnr' | 'dnrP2';

interface PlanInfo {
  /** Copilot Chat row (● = included). */
  copilotChat: boolean;
  /** Purview data security workloads the plan entitles. */
  workloads: Workload[];
}

/**
 * Workload mapping (PDF rows):
 *  MIP P1+P2  → Azure Information Protection Plan 1/2 or manual sensitivity labeling
 *  MIP P2     → Azure Information Protection Plan 2 / automatic labeling
 *  IRM        → Microsoft Purview Insider Risk Management
 *  DLM P1+P2  → Manual retention labels / basic retention policies
 *  DLM P2     → Rules-based automatic retention policies
 *  DNR P1+P2  → Audit (Standard) / eDiscovery (Standard)
 *  DNR P2     → eDiscovery (Premium) / Audit (Premium)
 */
export const PLANS: Record<string, PlanInfo> = {
  'Office 365 E1': { copilotChat: true, workloads: ['dlm', 'dnr'] },
  'Office 365 E3': { copilotChat: true, workloads: ['mip', 'dlm', 'dnr'] },
  'Microsoft 365 E3': { copilotChat: true, workloads: ['mip', 'dlm', 'dnr'] },
  'Microsoft 365 E5': { copilotChat: true, workloads: ['mip', 'mipP2', 'irm', 'dlm', 'dlmP2', 'dnr', 'dnrP2'] },
  'Enterprise Mobility + Security E3': { copilotChat: false, workloads: ['mip', 'dlm'] },
  'Microsoft 365 Business Basic': { copilotChat: true, workloads: ['dnr'] },
  'Microsoft 365 Business Premium': { copilotChat: true, workloads: ['mip', 'dlm', 'dnr'] },
  'Microsoft Purview Suite': { copilotChat: false, workloads: ['mip', 'mipP2', 'irm', 'dlm', 'dlmP2', 'dnr', 'dnrP2'] },
  'Microsoft Teams Rooms Pro': { copilotChat: false, workloads: [] },
};

/** Dominant SKU Group → base plans assigned to every Copilot-eligible user. */
export const SKU_GROUP_PLANS: Record<string, string[]> = {
  OE1: ['Office 365 E1'],
  OE3: ['Office 365 E3'],
  ME3: ['Microsoft 365 E3'],
  ME5: ['Microsoft 365 E5'],
  'OE1+EMS / OE1 Plus': ['Office 365 E1', 'Enterprise Mobility + Security E3'],
  'Business Basic': ['Microsoft 365 Business Basic'],
  'Business Premium': ['Microsoft 365 Business Premium'],
};

const isBusinessPlan = (dominantSku: string) => dominantSku.startsWith('Business');

/** Copilot add-on sold on top of the base plan (PDF "Add-on subscriptions › Copilot"). */
export const copilotAddOnName = (dominantSku: string) =>
  isBusinessPlan(dominantSku) ? 'Microsoft 365 Copilot Business' : 'Microsoft 365 Copilot';

// ---------- licenses shown in Tenant detail ----------

export type LicenseKind = 'Base' | 'Device' | 'Security add-on' | 'Copilot' | 'Copilot Credits';

export interface LicenseLine {
  product: string;
  kind: LicenseKind;
  /** Seat count, or null when the product is not seat-based. */
  seats: number | null;
  copilotChat: 'Included' | 'Not included' | '—';
  note: string;
}

export function tenantLicenses(t: TenantRecord): LicenseLine[] {
  const base = SKU_GROUP_PLANS[t.dominantSku] ?? [];
  const lines: LicenseLine[] = base.map((p) => ({
    product: p,
    kind: 'Base',
    seats: t.eligibleSeats,
    copilotChat: PLANS[p]?.copilotChat ? 'Included' : 'Not included',
    note: base.length > 1 ? 'Assigned to the same users' : 'Copilot eligible',
  }));

  const devices = t.totalM365Licenses - t.eligibleSeats;
  if (devices > 0) {
    lines.push({
      product: 'Microsoft Teams Rooms Pro',
      kind: 'Device',
      seats: devices,
      copilotChat: '—',
      note: 'Device license, not Copilot eligible',
    });
  }

  t.securityAddOns.forEach((a) =>
    lines.push({ product: a.sku, kind: 'Security add-on', seats: a.seats, copilotChat: '—', note: `Add-on to ${base[0] ?? t.dominantSku}` }),
  );

  const addOn = copilotAddOnName(t.dominantSku);
  if (t.pau > 0) {
    lines.push({ product: addOn, kind: 'Copilot', seats: t.pau, copilotChat: '—', note: 'Paid available units (Copilot PAU)' });
  }
  if (t.trialDaysRemaining != null) {
    lines.push({
      product: `${addOn} (Copilot in 30 trial)`,
      kind: 'Copilot',
      seats: null,
      copilotChat: '—',
      note: `${t.trialDaysRemaining} days remaining · ${t.licensedMau.toLocaleString('en-US')} active licensed users`,
    });
  }

  if (t.credits) {
    const m = t.credits.months[2];
    const limit = `Monthly Credit Limit ${m.limit.toLocaleString('en-US')}`;
    if (t.credits.months.some((x) => x.paygo > 0)) {
      lines.push({ product: 'Copilot Credits (pay-as-you-go)', kind: 'Copilot Credits', seats: null, copilotChat: '—', note: limit });
    }
    if (t.credits.months.some((x) => x.prepaid > 0)) {
      lines.push({ product: 'Copilot Credits (prepaid capacity)', kind: 'Copilot Credits', seats: null, copilotChat: '—', note: limit });
    }
  }
  return lines;
}

// ---------- Data Security Maturity flyout ----------

export interface SecurityWorkloadRow {
  key: Workload;
  label: string;
  mpu: number;
  dpu: number | null;
  pau: number;
  utilization: number;
  tippingPoint: number;
  above: boolean;
}

/** Workloads in the order of the product flyout, with their tipping points (MPU utilization). */
export const SECURITY_WORKLOADS: { key: Workload; label: string; tippingPoint: number; hasDpu: boolean }[] = [
  { key: 'mipP2', label: 'MIP P2', tippingPoint: 0.3, hasDpu: true },
  { key: 'irm', label: 'IRM', tippingPoint: 0.9, hasDpu: true },
  { key: 'mip', label: 'MIP P1 + P2', tippingPoint: 0.3, hasDpu: true },
  { key: 'dlm', label: 'DLM P1 + P2', tippingPoint: 0.1, hasDpu: false },
  { key: 'dnr', label: 'DNR P1 + P2', tippingPoint: 0.9, hasDpu: true },
  { key: 'dlmP2', label: 'DLM P2', tippingPoint: 0, hasDpu: false },
  { key: 'dnrP2', label: 'DNR P2', tippingPoint: 0.9, hasDpu: false },
];

/** Paid available units for a workload: base plans cover every eligible user, add-ons cover their seats. */
export function workloadPau(t: TenantRecord, w: Workload): number {
  const base = SKU_GROUP_PLANS[t.dominantSku] ?? [];
  if (base.some((p) => PLANS[p]?.workloads.includes(w))) return t.eligibleSeats;
  const addOnSeats = t.securityAddOns.filter((a) => PLANS[a.sku]?.workloads.includes(w)).reduce((s, a) => s + a.seats, 0);
  return Math.min(addOnSeats, t.eligibleSeats);
}

export function securityWorkloads(t: TenantRecord): SecurityWorkloadRow[] {
  const u = t.dataSecurityUsage;
  return SECURITY_WORKLOADS.map((w) => {
    const pau = workloadPau(t, w.key);
    const mpu = u[w.key];
    const utilization = pau > 0 ? Math.min(mpu / pau, 1) : 0;
    const dpu = w.hasDpu ? u.dpu[w.key as keyof typeof u.dpu] : null;
    return { key: w.key, label: w.label, mpu, dpu, pau, utilization, tippingPoint: w.tippingPoint, above: pau > 0 && utilization >= w.tippingPoint };
  });
}

export type SecurityLicensing = 'Advanced' | 'Limited' | 'Minimal';

export interface DataSecurityProfile {
  licensing: SecurityLicensing;
  health: 'Healthy' | 'Unhealthy';
  maturity: DataSecurityMaturity;
  workloads: SecurityWorkloadRow[];
}

/**
 * Security Licensing: Advanced when any P2 workload is licensed (E5 or Purview Suite), Limited when
 * MIP or DLM P1 is licensed (E3-level), otherwise Minimal.
 * Data Security Health: Healthy when every licensed workload is above its tipping point.
 */
export function dataSecurityProfile(t: TenantRecord): DataSecurityProfile {
  const workloads = securityWorkloads(t);
  const pau = (k: Workload) => workloads.find((w) => w.key === k)!.pau;
  const licensing: SecurityLicensing =
    pau('mipP2') + pau('irm') + pau('dlmP2') + pau('dnrP2') > 0 ? 'Advanced' : pau('mip') + pau('dlm') > 0 ? 'Limited' : 'Minimal';
  const health = workloads.filter((w) => w.pau > 0).every((w) => w.above) ? 'Healthy' : 'Unhealthy';
  const maturity = (licensing === 'Minimal' ? 'Minimal' : `${licensing}-${health}`) as DataSecurityMaturity;
  return { licensing, health, maturity, workloads };
}

// ---------- Cowork ----------

export interface CoworkMetrics {
  momRetention: number | null;
  totalTasks: number;
  scheduledTasks: number;
  interactiveTasks: number;
  turnsSucceeded: number;
  turnsFailed: number;
  turnsAbandoned: number;
  turnsSuccessRate: number | null;
}

export function coworkMetrics(t: TenantRecord): CoworkMetrics | null {
  const c = t.cowork;
  if (!c) return null;
  const turns = c.turnsSucceeded + c.turnsFailed + c.turnsAbandoned;
  return {
    momRetention: c.priorPeriodUsers > 0 ? c.returningUsers / c.priorPeriodUsers : null,
    totalTasks: c.scheduledTasks + c.interactiveTasks,
    scheduledTasks: c.scheduledTasks,
    interactiveTasks: c.interactiveTasks,
    turnsSucceeded: c.turnsSucceeded,
    turnsFailed: c.turnsFailed,
    turnsAbandoned: c.turnsAbandoned,
    turnsSuccessRate: turns > 0 ? c.turnsSucceeded / turns : null,
  };
}

/**
 * Monthly Cowork Credits per User (simulator rule): Cowork credits over a rolling 28 days
 * (4 × the weekly Cowork value) divided by Cowork MAU.
 */
export function coworkCreditsPerUser(t: TenantRecord): number | null {
  if (!t.weekly || t.coworkMau === 0) return null;
  return Math.round((t.weekly.cowork * 4) / t.coworkMau);
}
