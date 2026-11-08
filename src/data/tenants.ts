/**
 * ASPX Simulator — fictitious dataset.
 *
 * Every company, partner, GUID, TPID and MPN ID below is invented for training.
 * Only raw "source" signals live here; every derived field (utilization,
 * whitespace, scenario, earnings…) is computed in src/lib/metrics.ts.
 *
 * Teaching cases (see README):
 *  1 Acquire · 2 Acquire · 3 Monetize · 4 Monetize · 5 Monetize (trial)
 *  6 Grow · 7 Grow · 8 Grow + E7 · 9 Monetize + E7 · 10 Not targeted
 */

export type Country = 'Mexico' | 'Guatemala' | 'Colombia' | 'Costa Rica';
export type TenantSegment = 'SME&C Corporate' | 'Enterprise';
export type Propensity = 'High' | 'Medium' | 'Low';
export type FrontierStatus = 'Enabled' | 'Partially enabled' | 'Disabled';
export type DataSecurityMaturity =
  | 'Advanced-Healthy'
  | 'Advanced-Unhealthy'
  | 'Limited-Healthy'
  | 'Limited-Unhealthy'
  | 'Minimal';
export type AgentIntensity = 'High' | 'Medium' | 'Low';
export type E7SubScenario =
  | 'ME5 with H/M agent intensity'
  | 'ME3 with H/M agent intensity'
  | 'ME5 with low agent intensity';

export interface Partner {
  id: string;
  name: string;
  mpnId: string;
}

export interface AppMau {
  word: number;
  excel: number;
  powerpoint: number;
  outlook: number;
  teams: number;
  onenote: number;
  engage: number;
  salesCrm: number;
}

export interface AgentMau {
  chat: number;
  connector: number;
  plugins: number;
  customEngine: number;
}

export interface CreditMonth {
  paygo: number;
  prepaid: number;
  nonBillable: number;
  limit: number;
}

export interface Credits {
  /** [M-2, M-1, MTD] */
  months: [CreditMonth, CreditMonth, CreditMonth];
  peakMonthly: number;
}

export interface WeeklyConsumption {
  cowork: number;
  workIq: number;
  githubCopilot: number;
  agents: number;
}

export interface AdminSettings {
  webSearch: 'Enabled' | 'Disabled';
  taskbarPinning: 'Pinned' | 'Not pinned';
  blocked1PAgents: number;
  appStatus: 'Available' | 'Blocked';
  /** 0..1 share of devices on a Copilot-ready update channel */
  channelReadiness: number;
  usageBasedBilling: boolean;
  teamsTranscription: boolean;
  copilotConnectors: boolean;
}

export interface MciEngagement {
  name: string;
  earnings: number;
}

export interface TenantRecord {
  caseNo: number;
  tenantName: string;
  tenantId: string;
  tenantDomain: string;
  country: Country;
  segment: TenantSegment;
  subSegment: string;
  industry: string;
  tpid: number;
  customerName: string;
  /** YYYY-MM or null */
  eaRenewal: string | null;
  largestCspRenewal: string | null;
  earliestCspRenewal: string | null;
  dominantSku: string;
  totalM365Licenses: number;
  eligibleSeats: number;
  cspTransactedLicenses: number;
  pau: number;
  licensedMau: number;
  unlicensedMau: number;
  propensity: Propensity;
  propensityReasoning: string;
  trialRecommendation: string;
  trialDaysRemaining: number | null;
  adoptionStatus: string | null;
  frontier: FrontierStatus;
  usageLimitUsers: number;
  licenseRequests: number;
  apps: AppMau;
  agents: AgentMau;
  credits: Credits | null;
  weekly: WeeklyConsumption | null;
  coworkMau: number;
  coworkCreditsPerUser: number;
  e7SubScenario: E7SubScenario | null;
  agentIntensity: AgentIntensity;
  entraPenetration: number;
  dataSecurityMaturity: DataSecurityMaturity;
  admin: AdminSettings;
  partnerId: string;
  claimId: string | null;
  claimedByOthers: boolean;
  cporAssociation: boolean;
  cspAssociation: boolean;
  cspTier: 'Distributor' | 'Reseller' | null;
  t2ResellerId: string | null;
  t2ResellerName: string | null;
  mciEngagements: MciEngagement[];
  priorHwm: number;
  startingHwm: number;
  ratePerUnit: number;
  maxCompUnits: number;
  nonProfit: boolean;
  cspPromotions: string | null;
  /** 6 monthly points, oldest first; the last point equals the current value. */
  history: { licensedMau: number[]; unlicensedMau: number[] };
}

/** Data snapshot timestamp shown on every chart card. */
export const AS_OF = new Date(2026, 10, 6, 17, 6); // 11/06/2026 05:06 p.m.
/** Month labels for the 6-point MAU history (oldest first). */
export const HISTORY_MONTHS = ['2026-05', '2026-06', '2026-07', '2026-08', '2026-09', '2026-10'];

export const PARTNERS: Partner[] = [
  { id: 'p1', name: 'Nimbus Cloud Partners S.A. de C.V.', mpnId: '6100101' },
  { id: 'p2', name: 'Quetzal Digital Partners S.A.', mpnId: '6100202' },
  { id: 'p3', name: 'Andes Nube Consultores S.A.S.', mpnId: '6100303' },
];

const noApps: AppMau = { word: 0, excel: 0, powerpoint: 0, outlook: 0, teams: 0, onenote: 0, engage: 0, salesCrm: 0 };

const healthyAdmin: AdminSettings = {
  webSearch: 'Enabled',
  taskbarPinning: 'Pinned',
  blocked1PAgents: 0,
  appStatus: 'Available',
  channelReadiness: 0.92,
  usageBasedBilling: true,
  teamsTranscription: true,
  copilotConnectors: true,
};

export const TENANTS: TenantRecord[] = [
  // 1 — Acquire: SME&C, OE1, no paid seats, Free Chat ~2%
  {
    caseNo: 1,
    tenantName: 'BRISA DEL VALLE COMERCIAL S.A. DE C.V.',
    tenantId: '7c1e4a2b-3d5f-4e6a-9b8c-1d2e3f4a5b01',
    tenantDomain: 'brisadelvalle.example',
    country: 'Mexico',
    segment: 'SME&C Corporate',
    subSegment: 'SME&C - Corporate Commercial',
    industry: 'Retailers',
    tpid: 9900101,
    customerName: 'Comercializadora Brisa del Valle S.A. de C.V.',
    eaRenewal: null,
    largestCspRenewal: '2027-08',
    earliestCspRenewal: '2027-02',
    dominantSku: 'OE1',
    totalM365Licenses: 195,
    eligibleSeats: 180,
    cspTransactedLicenses: 195,
    pau: 0,
    licensedMau: 0,
    unlicensedMau: 4,
    propensity: 'High',
    propensityReasoning:
      'Strong Teams and Outlook engagement on Office 365 E1 with early Copilot Chat activity; no paid Copilot licenses yet.',
    trialRecommendation: 'Offer Trial',
    trialDaysRemaining: null,
    adoptionStatus: null,
    frontier: 'Disabled',
    usageLimitUsers: 0,
    licenseRequests: 0,
    apps: noApps,
    agents: { chat: 2, connector: 0, plugins: 0, customEngine: 0 },
    credits: null,
    weekly: null,
    coworkMau: 0,
    coworkCreditsPerUser: 0,
    e7SubScenario: null,
    agentIntensity: 'Low',
    entraPenetration: 0.35,
    dataSecurityMaturity: 'Limited-Healthy',
    admin: { ...healthyAdmin, taskbarPinning: 'Not pinned', channelReadiness: 0.72, usageBasedBilling: false, copilotConnectors: false },
    partnerId: 'p1',
    claimId: null,
    claimedByOthers: false,
    cporAssociation: false,
    cspAssociation: true,
    cspTier: 'Distributor',
    t2ResellerId: 'T2-50011',
    t2ResellerName: 'Servicios TI Horizonte',
    mciEngagements: [],
    priorHwm: 0,
    startingHwm: 0,
    ratePerUnit: 0,
    maxCompUnits: 0,
    nonProfit: false,
    cspPromotions: 'Microsoft 365 Copilot Business annual promo (fictitious)',
    history: { licensedMau: [0, 0, 0, 0, 0, 0], unlicensedMau: [1, 2, 2, 3, 3, 4] },
  },
  // 2 — Acquire: SME&C, Business Premium, high-propensity trial offer, MCI eligible
  {
    caseNo: 2,
    tenantName: 'AGROVOLCAN EXPORTADORA S.A.',
    tenantId: '2f8b6d1e-7a4c-4b3e-8d2f-5e6a7b8c9d02',
    tenantDomain: 'agrovolcan.example',
    country: 'Guatemala',
    segment: 'SME&C Corporate',
    subSegment: 'SME&C - Corporate Commercial',
    industry: 'Agriculture',
    tpid: 9900102,
    customerName: 'Agroexportadora Los Volcanes Azules S.A.',
    eaRenewal: null,
    largestCspRenewal: '2027-05',
    earliestCspRenewal: '2027-05',
    dominantSku: 'Business Premium',
    totalM365Licenses: 100,
    eligibleSeats: 95,
    cspTransactedLicenses: 100,
    pau: 3,
    licensedMau: 2,
    unlicensedMau: 3,
    propensity: 'High',
    propensityReasoning:
      'Business Premium tenant with growing Word and Excel usage and recent purchase of a few Copilot seats for leadership.',
    trialRecommendation: 'Offer Trial - High Propensity',
    trialDaysRemaining: null,
    adoptionStatus: 'Starting',
    frontier: 'Disabled',
    usageLimitUsers: 0,
    licenseRequests: 0,
    apps: { word: 2, excel: 1, powerpoint: 1, outlook: 2, teams: 2, onenote: 0, engage: 0, salesCrm: 0 },
    agents: { chat: 2, connector: 0, plugins: 0, customEngine: 0 },
    credits: null,
    weekly: null,
    coworkMau: 0,
    coworkCreditsPerUser: 0,
    e7SubScenario: null,
    agentIntensity: 'Low',
    entraPenetration: 0.88,
    dataSecurityMaturity: 'Limited-Healthy',
    admin: { ...healthyAdmin, channelReadiness: 0.81, usageBasedBilling: false },
    partnerId: 'p2',
    claimId: null,
    claimedByOthers: false,
    cporAssociation: false,
    cspAssociation: true,
    cspTier: 'Reseller',
    t2ResellerId: null,
    t2ResellerName: null,
    mciEngagements: [{ name: 'M365 Copilot Envision Workshop', earnings: 1500 }],
    priorHwm: 0,
    startingHwm: 0,
    ratePerUnit: 0,
    maxCompUnits: 0,
    nonProfit: false,
    cspPromotions: 'Microsoft 365 Copilot Business annual promo (fictitious)',
    history: { licensedMau: [0, 0, 1, 1, 2, 2], unlicensedMau: [1, 1, 2, 2, 3, 3] },
  },
  // 3 — Monetize: SME&C, OE3, Free Chat 18%, usage limits + license requests
  {
    caseNo: 3,
    tenantName: 'CLINICAS CORDILLERA VERDE S.A.S.',
    tenantId: '9a3c5e7f-1b2d-4c6e-a8f0-3b4c5d6e7f03',
    tenantDomain: 'cordilleraverde.example',
    country: 'Colombia',
    segment: 'SME&C Corporate',
    subSegment: 'SME&C - Corporate Commercial',
    industry: 'Health Provider',
    tpid: 9900103,
    customerName: 'Red de Clínicas Cordillera Verde S.A.S.',
    eaRenewal: null,
    largestCspRenewal: '2027-06',
    earliestCspRenewal: '2027-01',
    dominantSku: 'OE3',
    totalM365Licenses: 650,
    eligibleSeats: 640,
    cspTransactedLicenses: 520,
    pau: 0,
    licensedMau: 0,
    unlicensedMau: 115,
    propensity: 'High',
    propensityReasoning:
      'High free Copilot Chat adoption, users hitting usage limits and requesting licenses from their admin.',
    trialRecommendation: 'Offer Trial - High Propensity',
    trialDaysRemaining: null,
    adoptionStatus: null,
    frontier: 'Disabled',
    usageLimitUsers: 22,
    licenseRequests: 14,
    apps: noApps,
    agents: { chat: 30, connector: 0, plugins: 0, customEngine: 0 },
    credits: null,
    weekly: null,
    coworkMau: 0,
    coworkCreditsPerUser: 0,
    e7SubScenario: null,
    agentIntensity: 'Low',
    entraPenetration: 0.41,
    dataSecurityMaturity: 'Limited-Healthy',
    admin: { ...healthyAdmin, taskbarPinning: 'Not pinned', channelReadiness: 0.84, usageBasedBilling: false },
    partnerId: 'p3',
    claimId: null,
    claimedByOthers: false,
    cporAssociation: false,
    cspAssociation: true,
    cspTier: 'Reseller',
    t2ResellerId: null,
    t2ResellerName: null,
    mciEngagements: [{ name: 'M365 Copilot Envision Workshop', earnings: 3000 }],
    priorHwm: 0,
    startingHwm: 0,
    ratePerUnit: 0,
    maxCompUnits: 0,
    nonProfit: false,
    cspPromotions: null,
    history: { licensedMau: [0, 0, 0, 0, 0, 0], unlicensedMau: [40, 55, 70, 85, 100, 115] },
  },
  // 4 — Monetize: Enterprise, ME3, heavy agents, PAYGO credits near the monthly limit
  {
    caseNo: 4,
    tenantName: 'MANUFACTURAS NOGAL ROJO S.A. DE C.V.',
    tenantId: 'c4d6e8f0-2a3b-4c5d-9e7f-6a7b8c9d0e04',
    tenantDomain: 'nogalrojo.example',
    country: 'Mexico',
    segment: 'Enterprise',
    subSegment: 'Majors Growth - Commercial',
    industry: 'Manufacturing',
    tpid: 9900104,
    customerName: 'Grupo Industrial Nogal Rojo S.A.B. de C.V.',
    eaRenewal: null,
    largestCspRenewal: '2027-10',
    earliestCspRenewal: '2027-03',
    dominantSku: 'ME3',
    totalM365Licenses: 4000,
    eligibleSeats: 3850,
    cspTransactedLicenses: 4000,
    pau: 120,
    licensedMau: 96,
    unlicensedMau: 610,
    propensity: 'High',
    propensityReasoning:
      'Agents are used broadly by unlicensed users and pay-as-you-go Copilot Credits are close to the configured monthly limit.',
    trialRecommendation: 'Not Eligible',
    trialDaysRemaining: null,
    adoptionStatus: 'Healthy but Last Month Drop',
    frontier: 'Partially enabled',
    usageLimitUsers: 48,
    licenseRequests: 31,
    apps: { word: 70, excel: 52, powerpoint: 38, outlook: 81, teams: 90, onenote: 9, engage: 6, salesCrm: 4 },
    agents: { chat: 380, connector: 95, plugins: 60, customEngine: 45 },
    credits: {
      months: [
        { paygo: 28000, prepaid: 0, nonBillable: 1200, limit: 50000 },
        { paygo: 38500, prepaid: 0, nonBillable: 1400, limit: 50000 },
        { paygo: 46800, prepaid: 0, nonBillable: 900, limit: 50000 },
      ],
      peakMonthly: 46800,
    },
    weekly: { cowork: 2100, workIq: 3400, githubCopilot: 1800, agents: 4600 },
    coworkMau: 45,
    coworkCreditsPerUser: 46,
    e7SubScenario: null,
    agentIntensity: 'Medium',
    entraPenetration: 0.64,
    dataSecurityMaturity: 'Advanced-Healthy',
    admin: { ...healthyAdmin },
    partnerId: 'p1',
    claimId: 'CLM-DEMO-0004',
    claimedByOthers: false,
    cporAssociation: true,
    cspAssociation: true,
    cspTier: 'Reseller',
    t2ResellerId: null,
    t2ResellerName: null,
    mciEngagements: [{ name: 'Copilot Agents Accelerate', earnings: 6000 }],
    priorHwm: 60,
    startingHwm: 40,
    ratePerUnit: 25,
    maxCompUnits: 50,
    nonProfit: false,
    cspPromotions: null,
    history: { licensedMau: [60, 68, 75, 84, 102, 96], unlicensedMau: [330, 390, 450, 505, 560, 610] },
  },
  // 5 — Monetize: SME&C, OE1+EMS, active trial at churn risk, 9 days remaining
  {
    caseNo: 5,
    tenantName: 'HOTELES PLAYA CELESTE S.R.L.',
    tenantId: '5e7a9c1d-3f4b-4d6a-b8c0-7d8e9f0a1b05',
    tenantDomain: 'playaceleste.example',
    country: 'Costa Rica',
    segment: 'SME&C Corporate',
    subSegment: 'SME&C - Corporate Commercial',
    industry: 'Hospitality & Travel',
    tpid: 9900105,
    customerName: 'Corporación Hotelera Playa Celeste S.R.L.',
    eaRenewal: null,
    largestCspRenewal: '2027-04',
    earliestCspRenewal: '2027-01',
    dominantSku: 'OE1+EMS / OE1 Plus',
    totalM365Licenses: 270,
    eligibleSeats: 260,
    cspTransactedLicenses: 270,
    pau: 0,
    licensedMau: 25,
    unlicensedMau: 38,
    propensity: 'Medium',
    propensityReasoning:
      'Active Copilot trial with steady free Chat usage, but trial users are not building habits in Outlook and Teams.',
    trialRecommendation: 'Drive Adoption – Churn Risk',
    trialDaysRemaining: 9,
    adoptionStatus: null,
    frontier: 'Disabled',
    usageLimitUsers: 6,
    licenseRequests: 3,
    apps: { word: 9, excel: 4, powerpoint: 3, outlook: 14, teams: 11, onenote: 1, engage: 0, salesCrm: 0 },
    agents: { chat: 12, connector: 0, plugins: 0, customEngine: 0 },
    credits: null,
    weekly: null,
    coworkMau: 0,
    coworkCreditsPerUser: 0,
    e7SubScenario: null,
    agentIntensity: 'Low',
    entraPenetration: 0.7,
    dataSecurityMaturity: 'Limited-Healthy',
    admin: { ...healthyAdmin, teamsTranscription: false, usageBasedBilling: false },
    partnerId: 'p2',
    claimId: null,
    claimedByOthers: false,
    cporAssociation: false,
    cspAssociation: true,
    cspTier: 'Distributor',
    t2ResellerId: 'T2-50027',
    t2ResellerName: 'Redes del Istmo Tecnología',
    mciEngagements: [],
    priorHwm: 0,
    startingHwm: 0,
    ratePerUnit: 0,
    maxCompUnits: 0,
    nonProfit: false,
    cspPromotions: 'Copilot in 30 trial (fictitious)',
    history: { licensedMau: [0, 0, 0, 0, 31, 25], unlicensedMau: [20, 24, 28, 31, 35, 38] },
  },
  // 6 — Grow: Enterprise, ME5, Healthy adoption, largest CSP renewal in 4 months
  {
    caseNo: 6,
    tenantName: 'BANCO AURORA DEL PACIFICO',
    tenantId: 'e1f3a5b7-9c0d-4e2f-8a4b-8c9d0e1f2a06',
    tenantDomain: 'aurorapacifico.example',
    country: 'Mexico',
    segment: 'Enterprise',
    subSegment: 'Strategic - Commercial',
    industry: 'Banking & Capital Markets',
    tpid: 9900106,
    customerName: 'Grupo Financiero Aurora del Pacífico S.A.B. de C.V.',
    eaRenewal: null,
    largestCspRenewal: '2027-03',
    earliestCspRenewal: '2027-01',
    dominantSku: 'ME5',
    totalM365Licenses: 2500,
    eligibleSeats: 2400,
    cspTransactedLicenses: 2500,
    pau: 600,
    licensedMau: 510,
    unlicensedMau: 420,
    propensity: 'High',
    propensityReasoning:
      'Healthy Copilot adoption across Outlook, Teams and Word; license expansion requested by additional business units.',
    trialRecommendation: 'Converted – Expand',
    trialDaysRemaining: null,
    adoptionStatus: 'Healthy',
    frontier: 'Partially enabled',
    usageLimitUsers: 0,
    licenseRequests: 42,
    apps: { word: 330, excel: 260, powerpoint: 190, outlook: 420, teams: 470, onenote: 45, engage: 30, salesCrm: 18 },
    agents: { chat: 140, connector: 35, plugins: 20, customEngine: 10 },
    credits: {
      months: [
        { paygo: 8000, prepaid: 12000, nonBillable: 600, limit: 40000 },
        { paygo: 9500, prepaid: 12000, nonBillable: 700, limit: 40000 },
        { paygo: 7200, prepaid: 9000, nonBillable: 400, limit: 40000 },
      ],
      peakMonthly: 21500,
    },
    weekly: { cowork: 1400, workIq: 2200, githubCopilot: 900, agents: 1700 },
    coworkMau: 60,
    coworkCreditsPerUser: 28,
    e7SubScenario: null,
    agentIntensity: 'Low',
    entraPenetration: 0.95,
    dataSecurityMaturity: 'Advanced-Healthy',
    admin: { ...healthyAdmin },
    partnerId: 'p1',
    claimId: 'CLM-DEMO-0006',
    claimedByOthers: false,
    cporAssociation: true,
    cspAssociation: true,
    cspTier: 'Reseller',
    t2ResellerId: null,
    t2ResellerName: null,
    mciEngagements: [{ name: 'M365 Copilot Adoption Accelerate', earnings: 8000 }],
    priorHwm: 480,
    startingHwm: 300,
    ratePerUnit: 15,
    maxCompUnits: 150,
    nonProfit: false,
    cspPromotions: null,
    history: { licensedMau: [380, 410, 440, 465, 490, 510], unlicensedMau: [300, 325, 350, 375, 400, 420] },
  },
  // 7 — Grow: SME&C, ME3, Failure to Adopt, 3 admin settings need attention
  {
    caseNo: 7,
    tenantName: 'CONSULTORES PARAMO AZUL S.A.S.',
    tenantId: '3b5d7f9a-1c2e-4f4a-9b6c-9e0f1a2b3c07',
    tenantDomain: 'paramoazul.example',
    country: 'Colombia',
    segment: 'SME&C Corporate',
    subSegment: 'SME&C - Corporate Commercial',
    industry: 'Professional Services',
    tpid: 9900107,
    customerName: 'Páramo Azul Consultores Asociados S.A.S.',
    eaRenewal: null,
    largestCspRenewal: '2027-07',
    earliestCspRenewal: '2027-02',
    dominantSku: 'ME3',
    totalM365Licenses: 430,
    eligibleSeats: 420,
    cspTransactedLicenses: 430,
    pau: 80,
    licensedMau: 28,
    unlicensedMau: 60,
    propensity: 'Medium',
    propensityReasoning:
      'Licenses purchased months ago but usage stays low; configuration blockers limit Copilot grounding and agents.',
    trialRecommendation: 'Converted – Drive Adoption and Cowork',
    trialDaysRemaining: null,
    adoptionStatus: 'Failure to Adopt',
    frontier: 'Partially enabled',
    usageLimitUsers: 0,
    licenseRequests: 0,
    apps: { word: 18, excel: 9, powerpoint: 6, outlook: 21, teams: 15, onenote: 2, engage: 0, salesCrm: 0 },
    agents: { chat: 14, connector: 0, plugins: 0, customEngine: 0 },
    credits: null,
    weekly: null,
    coworkMau: 0,
    coworkCreditsPerUser: 0,
    e7SubScenario: null,
    agentIntensity: 'Low',
    entraPenetration: 0.82,
    dataSecurityMaturity: 'Limited-Healthy',
    admin: { ...healthyAdmin, webSearch: 'Disabled', blocked1PAgents: 4, channelReadiness: 0.55 },
    partnerId: 'p3',
    claimId: null,
    claimedByOthers: false,
    cporAssociation: false,
    cspAssociation: true,
    cspTier: 'Distributor',
    t2ResellerId: 'T2-50034',
    t2ResellerName: 'Soluciones Kawak Digital',
    mciEngagements: [{ name: 'M365 Copilot Adoption Accelerate', earnings: 2500 }],
    priorHwm: 0,
    startingHwm: 0,
    ratePerUnit: 0,
    maxCompUnits: 0,
    nonProfit: false,
    cspPromotions: null,
    history: { licensedMau: [35, 33, 31, 30, 29, 28], unlicensedMau: [45, 48, 51, 54, 57, 60] },
  },
  // 8 — Grow + E7: Enterprise, ME5, H/M agent intensity, Frontier Enabled, Cowork
  {
    caseNo: 8,
    tenantName: 'ALIMENTOS COLIBRI DORADO S.A. DE C.V.',
    tenantId: 'a7c9e1f3-5b6d-4a8c-8e0f-0a1b2c3d4e08',
    tenantDomain: 'colibridorado.example',
    country: 'Mexico',
    segment: 'Enterprise',
    subSegment: 'Strategic - Commercial',
    industry: 'Consumer Goods',
    tpid: 9900108,
    customerName: 'Corporativo Alimentos Colibrí Dorado S.A.B. de C.V.',
    eaRenewal: '2027-06',
    largestCspRenewal: '2027-09',
    earliestCspRenewal: '2027-02',
    dominantSku: 'ME5',
    totalM365Licenses: 4000,
    eligibleSeats: 4000,
    cspTransactedLicenses: 3200,
    pau: 900,
    licensedMau: 820,
    unlicensedMau: 1100,
    propensity: 'High',
    propensityReasoning:
      'E5 tenant with high agent intensity, Frontier enabled for all users and strong Cowork engagement.',
    trialRecommendation: 'Converted – Drive Adoption and Cowork',
    trialDaysRemaining: null,
    adoptionStatus: 'Healthy',
    frontier: 'Enabled',
    usageLimitUsers: 64,
    licenseRequests: 88,
    apps: { word: 540, excel: 430, powerpoint: 310, outlook: 690, teams: 740, onenote: 80, engage: 55, salesCrm: 120 },
    agents: { chat: 620, connector: 210, plugins: 140, customEngine: 95 },
    credits: {
      months: [
        { paygo: 30000, prepaid: 25000, nonBillable: 2100, limit: 120000 },
        { paygo: 38000, prepaid: 25000, nonBillable: 2600, limit: 120000 },
        { paygo: 46000, prepaid: 25000, nonBillable: 1900, limit: 120000 },
      ],
      peakMonthly: 71000,
    },
    weekly: { cowork: 9600, workIq: 7200, githubCopilot: 5400, agents: 8800 },
    coworkMau: 310,
    coworkCreditsPerUser: 62,
    e7SubScenario: 'ME5 with H/M agent intensity',
    agentIntensity: 'High',
    entraPenetration: 0.92,
    dataSecurityMaturity: 'Advanced-Healthy',
    admin: { ...healthyAdmin, channelReadiness: 0.96 },
    partnerId: 'p1',
    claimId: 'CLM-DEMO-0008',
    claimedByOthers: true,
    cporAssociation: true,
    cspAssociation: true,
    cspTier: 'Reseller',
    t2ResellerId: null,
    t2ResellerName: null,
    mciEngagements: [
      { name: 'Copilot Agents Accelerate', earnings: 12000 },
      { name: 'Secure AI Envision Workshop', earnings: 5000 },
    ],
    priorHwm: 850,
    startingHwm: 600,
    ratePerUnit: 15,
    maxCompUnits: 300,
    nonProfit: false,
    cspPromotions: null,
    history: { licensedMau: [610, 660, 705, 740, 785, 820], unlicensedMau: [780, 840, 910, 980, 1040, 1100] },
  },
  // 9 — Monetize + E7: Enterprise, ME3, H/M agent intensity, Limited-Unhealthy data security
  {
    caseNo: 9,
    tenantName: 'SEGUROS CEIBA MAYOR S.A.',
    tenantId: 'd2e4f6a8-0b1c-4d3e-a5f7-1b2c3d4e5f09',
    tenantDomain: 'ceibamayor.example',
    country: 'Guatemala',
    segment: 'Enterprise',
    subSegment: 'Majors Growth - Commercial',
    industry: 'Insurance',
    tpid: 9900109,
    customerName: 'Aseguradora Ceiba Mayor S.A.',
    eaRenewal: null,
    largestCspRenewal: '2027-08',
    earliestCspRenewal: '2027-04',
    dominantSku: 'ME3',
    totalM365Licenses: 1650,
    eligibleSeats: 1600,
    cspTransactedLicenses: 1650,
    pau: 40,
    licensedMau: 34,
    unlicensedMau: 290,
    propensity: 'High',
    propensityReasoning:
      'Agent usage is spreading through Copilot Chat without paid licenses; Purview data security controls are not in use.',
    trialRecommendation: 'Not Eligible',
    trialDaysRemaining: null,
    adoptionStatus: 'Healthy',
    frontier: 'Disabled',
    usageLimitUsers: 35,
    licenseRequests: 20,
    apps: { word: 22, excel: 18, powerpoint: 11, outlook: 29, teams: 31, onenote: 3, engage: 0, salesCrm: 0 },
    agents: { chat: 190, connector: 40, plugins: 25, customEngine: 15 },
    credits: {
      months: [
        { paygo: 6000, prepaid: 0, nonBillable: 500, limit: 20000 },
        { paygo: 7800, prepaid: 0, nonBillable: 650, limit: 20000 },
        { paygo: 9400, prepaid: 0, nonBillable: 300, limit: 20000 },
      ],
      peakMonthly: 9400,
    },
    weekly: { cowork: 300, workIq: 1100, githubCopilot: 700, agents: 2400 },
    coworkMau: 12,
    coworkCreditsPerUser: 25,
    e7SubScenario: 'ME3 with H/M agent intensity',
    agentIntensity: 'Medium',
    entraPenetration: 0.78,
    dataSecurityMaturity: 'Limited-Unhealthy',
    admin: { ...healthyAdmin, taskbarPinning: 'Not pinned' },
    partnerId: 'p2',
    claimId: 'CLM-DEMO-0009',
    claimedByOthers: false,
    cporAssociation: true,
    cspAssociation: true,
    cspTier: 'Reseller',
    t2ResellerId: null,
    t2ResellerName: null,
    mciEngagements: [{ name: 'Copilot Agents Accelerate', earnings: 6000 }],
    priorHwm: 20,
    startingHwm: 10,
    ratePerUnit: 25,
    maxCompUnits: 40,
    nonProfit: false,
    cspPromotions: null,
    history: { licensedMau: [18, 22, 25, 28, 31, 34], unlicensedMau: [150, 180, 210, 240, 265, 290] },
  },
  // 10 — Not targeted: SME&C, Business Basic, Low propensity, Minimal data security
  {
    caseNo: 10,
    tenantName: 'FUNDACION LUZ DE MONTAÑA',
    tenantId: 'f8a0b2c4-6d7e-4f9a-b1c3-2c3d4e5f6a10',
    tenantDomain: 'luzdemontana.example',
    country: 'Costa Rica',
    segment: 'SME&C Corporate',
    subSegment: 'SME&C - Corporate Commercial',
    industry: 'Nonprofit',
    tpid: 9900110,
    customerName: 'Asociación Fundación Luz de Montaña',
    eaRenewal: null,
    largestCspRenewal: '2027-01',
    earliestCspRenewal: '2027-01',
    dominantSku: 'Business Basic',
    totalM365Licenses: 62,
    eligibleSeats: 60,
    cspTransactedLicenses: 62,
    pau: 0,
    licensedMau: 0,
    unlicensedMau: 1,
    propensity: 'Low',
    propensityReasoning: 'Low collaboration activity and basic licensing; no meaningful Copilot signals yet.',
    trialRecommendation: 'Not Eligible',
    trialDaysRemaining: null,
    adoptionStatus: null,
    frontier: 'Disabled',
    usageLimitUsers: 0,
    licenseRequests: 0,
    apps: noApps,
    agents: { chat: 0, connector: 0, plugins: 0, customEngine: 0 },
    credits: null,
    weekly: null,
    coworkMau: 0,
    coworkCreditsPerUser: 0,
    e7SubScenario: null,
    agentIntensity: 'Low',
    entraPenetration: 0.2,
    dataSecurityMaturity: 'Minimal',
    admin: {
      ...healthyAdmin,
      taskbarPinning: 'Not pinned',
      channelReadiness: 0.4,
      usageBasedBilling: false,
      teamsTranscription: false,
      copilotConnectors: false,
    },
    partnerId: 'p2',
    claimId: null,
    claimedByOthers: false,
    cporAssociation: false,
    cspAssociation: true,
    cspTier: 'Distributor',
    t2ResellerId: 'T2-50027',
    t2ResellerName: 'Redes del Istmo Tecnología',
    mciEngagements: [],
    priorHwm: 0,
    startingHwm: 0,
    ratePerUnit: 0,
    maxCompUnits: 0,
    nonProfit: true,
    cspPromotions: null,
    history: { licensedMau: [0, 0, 0, 0, 0, 0], unlicensedMau: [0, 0, 1, 1, 1, 1] },
  },
];
