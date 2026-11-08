import { describe, expect, it } from 'vitest';
import { PARTNERS, TENANTS } from '../data/tenants';
import {
  allCopilotMau,
  assignScenario,
  computeKpis,
  copilotUtilization,
  enrich,
  freeChatPenetration,
  freePaidSignals,
  freeToPaidWhitespace,
  isEligibleForCopilotTab,
  monthsUntil,
  seatsWhitespace,
  tenantPenetration,
  usageHistory,
} from './metrics';
import { PLAYBOOKS, applyFacets, applySearch, quickTest } from './filters';
import { tenantAdvice } from './advice';
import { COLUMNS, DEFAULT_VISIBILITY } from './columns';
import { DEFS } from './dictionary';

const rows = TENANTS.map(enrich);

describe('formulas', () => {
  it('Copilot Utilization = min(MAU/PAU, 1), null without PAU', () => {
    expect(copilotUtilization(50, 100)).toBe(0.5);
    expect(copilotUtilization(150, 100)).toBe(1);
    expect(copilotUtilization(10, 0)).toBeNull();
  });
  it('Copilot Seats Whitespace = Eligible − PAU', () => {
    expect(seatsWhitespace(400, 80)).toBe(320);
    expect(seatsWhitespace(10, 20)).toBe(0);
  });
  it('Free to Paid Whitespace = Unlicensed / (Unlicensed + PAU)', () => {
    expect(freeToPaidWhitespace(30, 10)).toBe(0.75);
    expect(freeToPaidWhitespace(0, 0)).toBeNull();
  });
  it('Free Chat Penetration = Free MAU / Eligible', () => {
    expect(freeChatPenetration(18, 100)).toBe(0.18);
  });
  it('All Copilot MAU = Licensed + Unlicensed', () => {
    expect(allCopilotMau(5, 7)).toBe(12);
  });
  it('monthsUntil counts from the 11/06/2026 snapshot', () => {
    expect(monthsUntil('2027-03')).toBe(4);
    expect(monthsUntil(null)).toBeNull();
  });
});

describe('scenario rule', () => {
  const base = { eligibleSeats: 100, propensity: 'High' as const };
  it('paid > 5% → Grow', () => expect(assignScenario({ ...base, pau: 6, unlicensedMau: 0 })).toBe('Grow'));
  it('chat > 5% and paid ≤ 5% → Monetize', () => expect(assignScenario({ ...base, pau: 2, unlicensedMau: 9 })).toBe('Monetize'));
  it('both ≤ 5% → Acquire', () => expect(assignScenario({ ...base, pau: 1, unlicensedMau: 3 })).toBe('Acquire'));
  it('Low propensity → Not targeted', () =>
    expect(assignScenario({ ...base, propensity: 'Low', pau: 50, unlicensedMau: 50 })).toBe('Not targeted'));
  it('Medium propensity is still targeted', () =>
    expect(assignScenario({ ...base, propensity: 'Medium', pau: 20, unlicensedMau: 0 })).toBe('Grow'));

  it('each teaching case lands in its intended scenario', () => {
    const expected: Record<number, string> = {
      1: 'Acquire',
      2: 'Acquire',
      3: 'Monetize',
      4: 'Monetize',
      5: 'Monetize',
      6: 'Grow',
      7: 'Grow',
      8: 'Grow',
      9: 'Monetize',
      10: 'Not targeted',
    };
    rows.forEach((r) => expect(r.scenario, `case ${r.caseNo}`).toBe(expected[r.caseNo]));
  });
});

describe('dataset totals', () => {
  const k = computeKpis(rows);
  it('Tenants 10', () => expect(k.tenants).toBe(10));
  it('Acquire 2, Monetize 4, Grow 3, Not targeted 1', () => {
    expect(k.acquire).toBe(2);
    expect(k.monetize).toBe(4);
    expect(k.grow).toBe(3);
    expect(k.notTargeted).toBe(1);
  });
  it('E7 Upsell-ready 2', () => expect(k.e7UpsellReady).toBe(2));
  it('Has Copilot Licenses + No Copilot Licenses = 10', () => {
    const p = tenantPenetration(rows);
    expect(p.has + p.none).toBe(10);
    expect(p.has).toBe(rows.filter((r) => r.pau > 0).length);
  });
  it('Seat Penetration and Paid Utilization are aggregate ratios', () => {
    const pau = TENANTS.reduce((s, t) => s + t.pau, 0);
    const elig = TENANTS.reduce((s, t) => s + t.eligibleSeats, 0);
    const mau = TENANTS.reduce((s, t) => s + t.licensedMau, 0);
    expect(k.seatPenetration).toBeCloseTo(pau / elig);
    expect(k.paidUtilization).toBeCloseTo(Math.min(mau / pau, 1));
  });
  it('Potential Earnings is the sum by tenant (MCI + CPOR)', () => {
    expect(k.potentialEarnings).toBe(rows.reduce((s, r) => s + r.mciPotentialEarnings + r.cporPotentialEarnings, 0));
  });
});

describe('dataset integrity', () => {
  it('uses 3 partners and countries MX/GT/CO/CR only', () => {
    expect(PARTNERS).toHaveLength(3);
    expect(new Set(TENANTS.map((t) => t.partnerId)).size).toBe(3);
    TENANTS.forEach((t) => expect(['Mexico', 'Guatemala', 'Colombia', 'Costa Rica']).toContain(t.country));
  });
  it('all tenants meet the eligibility threshold (SME&C > 25, Enterprise > 150)', () => {
    TENANTS.forEach((t) => expect(isEligibleForCopilotTab(t), t.tenantName).toBe(true));
    TENANTS.forEach((t) => expect(t.eligibleSeats).toBeGreaterThanOrEqual(60));
    TENANTS.forEach((t) => expect(t.eligibleSeats).toBeLessThanOrEqual(4000));
  });
  it('6-month history ends at the current MAU values', () => {
    TENANTS.forEach((t) => {
      expect(t.history.licensedMau).toHaveLength(6);
      expect(t.history.unlicensedMau).toHaveLength(6);
      expect(t.history.licensedMau[5]).toBe(t.licensedMau);
      expect(t.history.unlicensedMau[5]).toBe(t.unlicensedMau);
    });
    const h = usageHistory(rows);
    expect(h.all[5]).toBe(rows.reduce((s, r) => s + r.allCopilotMau, 0));
  });
  it('PAU never exceeds eligible seats and tenant IDs are unique GUIDs', () => {
    TENANTS.forEach((t) => expect(t.pau).toBeLessThanOrEqual(t.eligibleSeats));
    const ids = TENANTS.map((t) => t.tenantId);
    expect(new Set(ids).size).toBe(10);
    ids.forEach((id) => expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/));
  });
  it('teaching-case specifics', () => {
    const byCase = (n: number) => rows.find((r) => r.caseNo === n)!;
    expect(Math.round(byCase(1).freeChatPenetration * 100)).toBe(2);
    expect(Math.round(byCase(3).freeChatPenetration * 100)).toBe(18);
    expect(byCase(2).mciEligible).toBe(true);
    expect(byCase(4).mtdCredits! / byCase(4).monthlyCreditLimit!).toBeGreaterThan(0.9);
    expect(byCase(5).trialDaysRemaining).toBe(9);
    expect(monthsUntil(byCase(6).largestCspRenewal)).toBe(4);
    expect(byCase(7).adminNeedsAttention).toBe(3);
    expect(byCase(8).frontier).toBe('Enabled');
    expect(byCase(9).dataSecurityMaturity).toBe('Limited-Unhealthy');
    expect(byCase(10).dataSecurityMaturity).toBe('Minimal');
  });
});

describe('filters, playbooks and advice', () => {
  it('free-paid signals count tenants', () => {
    const s = freePaidSignals(rows);
    expect(s.usageLimits).toBe(rows.filter((r) => r.usageLimitUsers > 0).length);
    expect(s.freeChat).toBe(rows.filter((r) => r.freeChatPenetration > 0.05).length);
  });
  it('playbooks return the expected tenants', () => {
    const hit = (id: string) =>
      rows.filter((r) => PLAYBOOKS.find((p) => p.id === id)!.test(r)).map((r) => r.caseNo);
    expect(hit('growRenewal')).toEqual([6]);
    expect(hit('e7p1')).toEqual([8]);
    expect(hit('monetizeMci')).toEqual([3, 4, 9]);
    expect(hit('dataSecurity')).toEqual([9, 10]);
  });
  it('quick filter by scenario matches KPI counts', () => {
    expect(rows.filter((r) => quickTest({ kind: 'scenario', value: 'Monetize' }, r))).toHaveLength(4);
  });
  it('facets and search narrow the rows', () => {
    expect(applyFacets(rows, { segment: ['Enterprise'] })).toHaveLength(4);
    expect(applySearch(rows, 'quetzal').every((r) => r.partnerId === 'p2')).toBe(true);
  });
  it('"What to do with this tenant" gives up to 3 bullets for every tenant', () => {
    rows.forEach((r) => {
      const a = tenantAdvice(r);
      expect(a.length).toBeGreaterThan(0);
      expect(a.length).toBeLessThanOrEqual(3);
    });
  });
});

describe('columns', () => {
  it('every column has an English definition in the Data Dictionary', () => {
    COLUMNS.forEach((c) => expect(DEFS[c.header], c.header).toBeTruthy());
  });
  it('default visible columns start with Tenant Name and end with E7 Sub Scenario', () => {
    const visible = COLUMNS.filter((c) => DEFAULT_VISIBILITY[c.id]).map((c) => c.header);
    expect(visible[0]).toBe('Tenant Name');
    expect(visible[visible.length - 1]).toBe('E7 Sub Scenario');
    expect(visible).toHaveLength(54);
  });
});
