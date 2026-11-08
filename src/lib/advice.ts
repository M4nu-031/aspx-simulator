import type { TenantView } from './metrics';
import { monthsUntil, PENETRATION_THRESHOLD } from './metrics';
import { fmtInt, fmtMonth, fmtPct, fmtUsd } from './format';

/**
 * "What to do with this tenant" — up to 3 rule-based bullets, highest priority first.
 * Training content: Spanish, with technical terms kept in English.
 */
export function tenantAdvice(t: TenantView): string[] {
  const out: string[] = [];
  const renewal = monthsUntil(t.largestCspRenewal);
  const creditUse = t.credits ? t.mtdCredits! / t.credits.months[2].limit : 0;

  if (t.trialDaysRemaining != null && t.trialDaysRemaining <= 14) {
    out.push(
      `Trial activo (${t.trialRecommendation}) con ${t.trialDaysRemaining} días restantes: agenda una sesión de adopción esta semana y prepara la conversión a paid antes de que expire.`,
    );
  }
  if (creditUse >= 0.85) {
    out.push(
      `MTD Credits Consumed al ${fmtPct(creditUse)} del Monthly Credit Limit (${fmtInt(t.monthlyCreditLimit)}): propone prepaid Copilot Credits o ajustar el límite para no frenar el uso de agents.`,
    );
  }
  if (t.adoptionStatus?.startsWith('Failure')) {
    out.push(
      `Adoption Status "${t.adoptionStatus}" con Copilot Utilization de ${fmtPct(t.utilization)}: prioriza un plan de adopción (champions, escenarios por rol) antes de vender más seats.`,
    );
  }
  const adminBullet = () => {
    const names = t.adminChecks.filter((c) => !c.healthy).map((c) => c.label);
    return `${t.adminNeedsAttention} Admin Settings en "Needs attention" (${names.slice(0, 3).join(', ')}): corrígelos con "Learn to fix" — son blockers de adopción.`;
  };
  // Many blockers on a licensed tenant → high priority; otherwise it goes after the scenario motion.
  const adminHigh = t.hasCopilotLicenses && t.adminNeedsAttention >= 3;
  if (adminHigh) out.push(adminBullet());
  if (['Minimal', 'Limited-Unhealthy', 'Advanced-Unhealthy'].includes(t.dataSecurityMaturity)) {
    out.push(
      `Data Security Maturity ${t.dataSecurityMaturity}: posiciona Microsoft Purview / data security readiness antes (o junto con) el upsell de Copilot.`,
    );
  }
  if (t.scenario === 'Grow' && renewal != null && renewal >= 0 && renewal < 6) {
    out.push(
      `Largest Seat CSP Renewal en ${fmtMonth(t.largestCspRenewal)} (${renewal} meses): amarra la expansión de los ${fmtInt(t.seatsWhitespace)} seats de Copilot Seats Whitespace a la renovación.`,
    );
  }
  if (t.e7Ready) {
    out.push(`E7 Opportunity "${t.e7SubScenario}" (Agent Intensity ${t.agentIntensity}): incluye el upsell a E7 en el account plan.`);
  }
  switch (t.scenario) {
    case 'Acquire':
      out.push(
        `Escenario Acquire (paid y Chat MAU penetration < ${fmtPct(PENETRATION_THRESHOLD)}): activa Copilot Chat con un workshop de habilitación${t.trialRecommendation.startsWith('Offer Trial') ? ` y ofrece el Copilot in 30 trial (${t.trialRecommendation})` : ''}.`,
      );
      break;
    case 'Monetize':
      out.push(
        `Escenario Monetize: Free to Paid Whitespace de ${fmtPct(t.freeToPaidWhitespace)} con ${fmtInt(t.unlicensedMau)} Free Chat MAU; ${t.usageLimitUsers > 0 || t.licenseRequests > 0 ? `empieza por los ${fmtInt(t.usageLimitUsers)} usuarios con Usage Limits y ${fmtInt(t.licenseRequests)} License Requests` : 'identifica power users para la primera compra de licencias'}.`,
      );
      break;
    case 'Grow':
      out.push(`Escenario Grow: ${fmtInt(t.seatsWhitespace)} seats de Copilot Seats Whitespace; expande por departamento usando los casos de uso con más MAU.`);
      break;
    case 'Not targeted':
      out.push('Not targeted (propensity Low): mantén nurturing y revisa de nuevo el próximo mes; no inviertas preventa todavía.');
      break;
  }
  if (!adminHigh && t.adminNeedsAttention > 0 && t.hasCopilotLicenses) out.push(adminBullet());
  if (t.mciEligible) {
    out.push(`MCI Eligibility: Eligible (${t.mciEngagementName}) — financia el engagement con incentivos; Potential Earnings ${fmtUsd(t.potentialEarnings)}.`);
  }
  return out.slice(0, 3);
}

/** Hero motion per scenario (UI text, English). */
export const HERO_MOTION: Record<TenantView['scenario'], string> = {
  Acquire: 'Drive Copilot Chat activation and offer a Copilot in 30 trial to build usage.',
  Monetize: 'Convert free Copilot Chat users to paid Microsoft 365 Copilot licenses, or monetize via agents and Copilot Credits.',
  Grow: 'Expand paid Microsoft 365 Copilot seats across additional users, teams and workloads.',
  'Not targeted': 'Nurture: the tenant does not meet the propensity threshold for targeting scenarios.',
};

export function opportunityReasoning(t: TenantView): string {
  const p = fmtPct(t.paidPenetration);
  const c = fmtPct(t.freeChatPenetration);
  if (t.scenario === 'Not targeted') return `Copilot Purchase Propensity is ${t.propensity}, below the threshold for targeting scenarios.`;
  if (t.scenario === 'Grow') return `M365 Copilot Penetration (${p}) is above the 5% threshold.`;
  if (t.scenario === 'Monetize') return `M365 Copilot Penetration (${p}) is below 5% and Copilot Chat Penetration (${c}) is above 5%.`;
  return `Both M365 Copilot Penetration (${p}) and Copilot Chat Penetration (${c}) are below the 5% threshold.`;
}
