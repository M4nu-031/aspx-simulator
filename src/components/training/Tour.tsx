import { useState } from 'react';
import Joyride, { ACTIONS, EVENTS, STATUS, type CallBackProps, type Step } from 'react-joyride';
import { useApp } from '../../store';

/** Bring a cell inside the horizontally-scrolling table into view before its step. */
function revealInTable(selector: string) {
  const el = document.querySelector(selector);
  el?.scrollIntoView({ block: 'center', inline: 'center' });
}

interface TourStep extends Step {
  prepare?: () => void;
}

// Titles stay in English (UI terms); explanations are Spanish training notes with English technical terms.
const STEPS: TourStep[] = [
  {
    target: '[data-tour="kpis"]',
    title: '1 · KPI tiles',
    content:
      'Resumen del pipeline: Tenants, Seat Penetration (PAU / Copilot Eligible M365 Seats) y Paid Utilization (MAU / PAU, tope 100%). Acquire, Monetize, Grow, E7 Upsell-ready y Potential Earnings son links: al hacer clic filtran la tabla.',
    disableBeacon: true,
    placement: 'bottom',
  },
  {
    target: '[data-tour="chart-opportunities"]',
    title: '2 · Targeting scenarios',
    content:
      'Regla: propensity High/Medium. Paid penetration > 5% → Grow. Chat MAU penetration > 5% (paid < 5%) → Monetize. Ambos < 5% → Acquire. Propensity Low → Not targeted.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="chart-signals"]',
    title: '3 · Free-Paid Signals',
    content:
      'Experiencing Usage Limits, Penetrated with Free Chat (> 5%) y Have License Requests son señales de intención de compra. Haz clic en una barra para filtrar la tabla.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="context"]',
    title: '4 · Partner context',
    content: 'Como distribuidor puedes ver All partners o un partner específico; KPIs, charts y tabla se recalculan.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="toolbar"]',
    title: '5 · Table toolbar',
    content:
      'Download exporta las filas filtradas y columnas visibles (CSV/XLSX). Data Dictionary tiene todas las definiciones. Change columns muestra columnas ocultas y la sección Download-only. Filter aplica filtros por segmento, país, SKU, etc.',
    placement: 'top',
  },
  {
    target: '[data-tour="table"]',
    title: '6 · Copilot Opportunities table',
    content:
      'Una fila por tenant. En Training mode la banda amarilla agrupa las columnas por tema (perfil, renovaciones, uso, free-to-paid, credits, oportunidad, partner, E7). Pasa el mouse por un header para ver su definición.',
    placement: 'top',
    prepare: () => document.querySelector('.table-wrap')?.scrollTo({ left: 0 }),
  },
  {
    target: '[data-tour="cell-scenario"]',
    title: '7 · Copilot Opportunity flyout',
    content:
      'Los valores en azul abren flyouts. Copilot Opportunity explica el escenario: propensity, criteria met vs el umbral de 5% y el hero motion. También hay flyouts para E7 Opportunity, All Copilot MAU, MTD Credits Consumed, Weekly Consumption y Admin Settings Recommendations.',
    placement: 'left',
    prepare: () => revealInTable('[data-tour="cell-scenario"]'),
  },
  {
    target: '[data-tour="cell-tenantName"]',
    title: '8 · Tenant detail',
    content: 'El Tenant Name abre el Tenant detail. En Training mode incluye "What to do with this tenant": 3 acciones basadas en reglas.',
    placement: 'right',
    prepare: () => document.querySelector('.table-wrap')?.scrollTo({ left: 0 }),
  },
  {
    target: '[data-tour="playbooks"]',
    title: '9 · Playbooks',
    content: 'Filtros guardados para los motions más comunes. Haz clic de nuevo en un Playbook activo para quitarlo.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="playbooks"]',
    title: '10 · Prioritization',
    content:
      'Prioriza así: (1) tenants con Largest Seat CSP Renewal próxima (< 6 meses), (2) escenario Monetize con Free-Paid signals, (3) MCI Eligibility = Eligible para financiar el workshop. Combina "Grow with renewal < 6 months" y "Monetize with MCI eligibility".',
    placement: 'bottom',
  },
];

export function Tour() {
  const run = useApp((s) => s.tourRunning);
  const setRun = useApp((s) => s.setTourRunning);
  const theme = useApp((s) => s.theme);
  const [index, setIndex] = useState(0);

  const go = (i: number) => {
    STEPS[i]?.prepare?.();
    // let scrolling settle before Joyride measures the target
    setTimeout(() => setIndex(i), 120);
  };

  const onEvent = (d: CallBackProps) => {
    if (d.status === STATUS.FINISHED || d.status === STATUS.SKIPPED || d.action === ACTIONS.CLOSE) {
      setRun(false);
      setIndex(0);
      return;
    }
    if (d.type === EVENTS.STEP_AFTER || d.type === EVENTS.TARGET_NOT_FOUND) {
      go(d.index + (d.action === ACTIONS.PREV ? -1 : 1));
    }
  };

  const dark = theme === 'dark';
  return (
    <Joyride
      steps={STEPS}
      run={run}
      stepIndex={index}
      continuous
      showProgress
      showSkipButton
      scrollOffset={120}
      disableScrollParentFix
      callback={onEvent}
      locale={{ back: 'Back', close: 'Close', last: 'Finish', next: 'Next', skip: 'Skip tour' }}
      styles={{
        options: {
          primaryColor: '#479ef5',
          backgroundColor: dark ? '#292827' : '#ffffff',
          textColor: dark ? '#ffffff' : '#201f1e',
          arrowColor: dark ? '#292827' : '#ffffff',
          overlayColor: 'rgba(0,0,0,0.55)',
          zIndex: 100000,
          width: 400,
        },
        buttonNext: { color: '#001a33', fontWeight: 600 },
        buttonBack: { color: dark ? '#d2d0ce' : '#3b3a39' },
        tooltipContent: { fontSize: 13, lineHeight: 1.5, textAlign: 'left' },
        tooltipTitle: { fontSize: 15, textAlign: 'left' },
      }}
    />
  );
}
