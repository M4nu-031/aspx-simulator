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
  projectedMonthEnd,
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
    const m4 = byCase(4).credits!.months;
    expect((m4[1].paygo + m4[1].prepaid) / m4[1].limit).toBeCloseTo(0.94);
    expect(projectedMonthEnd(byCase(4).mtdCredits!)).toBeGreaterThan(m4[2].limit);
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

describe('licenses, data security and Cowork stay consistent with the table', () => {
  it('Data Security Maturity in the table equals the value derived from licenses + workload usage', () => {
    rows.forEach((r) => expect(r.dataSecurity.maturity, `case ${r.caseNo}`).toBe(r.dataSecurityMaturity));
  });
  it('licenses add up to Total M365 licenses and Copilot PAU', () => {
    rows.forEach((r) => {
      const base = r.licenses.filter((l) => l.kind === 'Base');
      const devices = r.licenses.filter((l) => l.kind === 'Device').reduce((s, l) => s + (l.seats ?? 0), 0);
      base.forEach((l) => expect(l.seats).toBe(r.eligibleSeats));
      expect(r.eligibleSeats + devices, `case ${r.caseNo}`).toBe(r.totalM365Licenses);
      const copilotSeats = r.licenses.filter((l) => l.kind === 'Copilot').reduce((s, l) => s + (l.seats ?? 0), 0);
      expect(copilotSeats).toBe(r.pau);
    });
  });
  it('security workload MPU and DPU never exceed what is plausible', () => {
    rows.forEach((r) =>
      r.dataSecurity.workloads.forEach((w) => {
        expect(w.mpu).toBeLessThanOrEqual(r.eligibleSeats);
        if (w.dpu != null) expect(w.dpu).toBeLessThanOrEqual(w.mpu);
      }),
    );
  });
  it('Cowork stats exist only when Cowork MAU > 0 and retention never exceeds 100%', () => {
    rows.forEach((r) => {
      expect(r.coworkStats != null).toBe(r.coworkMau > 0);
      if (r.cowork) {
        expect(r.cowork.returningUsers).toBeLessThanOrEqual(Math.min(r.cowork.priorPeriodUsers, r.coworkMau));
        expect(r.coworkStats!.turnsSuccessRate!).toBeLessThanOrEqual(1);
      }
    });
  });
  it('credits: MTD (6 days), Weekly Consumption (7 days) and full months tell the same story', () => {
    rows
      .filter((r) => r.credits)
      .forEach((r) => {
        const [m2, m1] = r.credits!.months;
        // last 7 days ≈ MTD daily pace × 7 (±10%)
        const weeklyFromMtd = (r.mtdCredits! / 6) * 7;
        expect(Math.abs(r.weeklyConsumption! - weeklyFromMtd) / weeklyFromMtd, `case ${r.caseNo}`).toBeLessThan(0.1);
        // MTD daily pace within ±40% of October's daily pace
        const ratio = r.mtdCredits! / 6 / ((m1.paygo + m1.prepaid) / 31);
        expect(ratio, `case ${r.caseNo}`).toBeGreaterThan(0.6);
        expect(ratio, `case ${r.caseNo}`).toBeLessThan(1.4);
        // Peak Monthly Consumption = highest full month
        expect(r.credits!.peakMonthly).toBe(Math.max(m2.paygo + m2.prepaid, m1.paygo + m1.prepaid));
      });
  });
  it('All Copilot MAU flyout: every tenant with MAU has filled app bars, and no app exceeds All Copilot MAU', () => {
    rows.forEach((r) => {
      const apps = Object.values(r.apps);
      const top = Math.max(...apps);
      apps.forEach((v) => expect(v, `case ${r.caseNo}`).toBeLessThanOrEqual(r.allCopilotMau));
      if (r.allCopilotMau > 0) expect(top / r.allCopilotMau, `case ${r.caseNo}`).toBeGreaterThanOrEqual(0.5);
      if (r.licensedMau === 0) expect(r.apps.salesCrm).toBe(0);
    });
  });
  it('All Agents MAU never exceeds the users who use Copilot plus a reasonable agent share', () => {
    rows.forEach((r) => {
      Object.values(r.agents).forEach((v) => expect(v, `case ${r.caseNo}`).toBeLessThanOrEqual(r.allCopilotMau));
    });
  });
  it('Monthly Cowork Credits per User = 4 × weekly Cowork credits / Cowork MAU', () => {
    const c8 = rows.find((r) => r.caseNo === 8)!;
    expect(c8.coworkCreditsPerUser).toBe(Math.round((c8.weekly!.cowork * 4) / c8.coworkMau));
  });
});

describe('columns', () => {
  it('missing export columns are added as hidden columns, not shown by default', () => {
    ['Utilization MIP P2', 'Cowork MoM Retention', 'M-2 Overage', 'Deepwork Credits Consumed', 'Copilot Connectors - Healthy'].forEach((h) => {
      const c = COLUMNS.find((x) => x.header === h);
      expect(c, h).toBeTruthy();
      expect(c!.hidden).toBe(true);
    });
  });
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
