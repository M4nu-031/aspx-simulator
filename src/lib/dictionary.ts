/**
 * Official definitions (English) — wording taken from the Microsoft Learn data dictionary
 * "Copilot growth opportunities data in AI Business Solutions & Security Insights".
 * Fields marked (simulator) have no public definition and use a short English description.
 *
 * TRAINING_NOTES are the only Spanish text in the app; technical terms stay in English.
 */

export const DEFS: Record<string, string> = {
  // KPI tiles
  Tenants: 'Total number of tenants with some Copilot footprint, either through licenses or some free chat usage.',
  'Seat Penetration': 'Total Copilot PAU / Copilot eligible Microsoft 365 licenses across all tenants.',
  'Paid Utilization':
    'The total ratio of MAU divided by PAU, capped at 100%, for all tenants and Land and Expand Growth Propensity Model workloads within the pipeline. Land and Expand Growth Propensity Model workloads are specifically identified workloads that have high correlation to upsell.',
  Acquire:
    "Count of tenants in Acquire targeting scenario. These customers have high propensity to purchase and/or use Copilot, but they have low Chat MAU penetration and low Microsoft 365 paid license penetration. The recommendation here's to acquire the customer by growing the use of Copilot Free Chat.",
  Monetize:
    "Count of tenants in Monetize targeting scenario. These customers have high propensity to purchase and/or use Copilot and have penetrated Copilot Chat but not penetrated with Microsoft 365 paid licenses. The recommendation here's to focus on monetizing the customer via agents or through paid Copilot licenses.",
  Grow: "Count of tenants in Grow targeting scenario. These customers have high propensity to purchase and/or use Copilot and have notable penetration in Copilot Chat and paid Copilot licenses. The recommendation here's to focus on increasing the customer’s paid copilot licenses further.",
  'E7 Upsell-ready':
    'Tenants that meet criteria for an E7 upsell motion. These tenants are identified based on their security licensing and agent intensity signals, including foundry signals. Use this tile to prioritize high-propensity E7 upsell opportunities and focus account planning on tenants with stronger readiness indicators.',
  'Potential Earnings':
    "Potential earnings from all tenants via MCI engagements and CPOR usage incentives. This isn't a precise number, but more an estimate of incentive earnings. This estimate isn't simply the sum of potential earnings in the following table, because one MCI engagement can span multiple workloads. Thus, partners can't sum potential earnings across workloads, only across tenants.",

  // Charts
  'Copilot Tenant Penetration': 'Visualizes the number of tenants that have PAU > 0 as a percentage of Copilot pipeline.',
  'Copilot Opportunities': 'Maps the tenant counts based on the acquire/monetize/grow targeting scenarios and propensity.',
  'Free-Paid Signals by Tenant':
    'Count of tenants that have some of the following free-paid signals: Experiencing Usage Limits: Tenant is flagged if any user experiences a usage limit. Penetrated with Free Chat: Tenant is flagged if free chat MAU penetration is greater than 5%. Have License Requests: Tenant is flagged if any user requests a Copilot license. Clicking on each of the bars filters tenants based on the logic described earlier.',
  'Copilot Usage by License':
    "Plots the historical view of Copilot usage across tenants, by product, so you can track if you're improving usage and converting from free to paid.",
  'MCI Potential Earnings': 'Potential earnings for the specific MCI engagement based on program rates and geography of the partner.',

  // Columns
  'Tenant Name': 'Name of the customer tenant as entered by the customer when the tenant was first created.',
  'Tenant ID':
    'Unique identifier of a customer tenant that contains all the unique users, domains, and subscriptions, and is administered by the tenant admin.',
  'Tenant Country/Region': 'The country/region assigned to the tenant when the tenant was first created.',
  'Tenant Segment': 'Indicates how Microsoft classifies the customer tenant segment.',
  'Customer Sub-Segment':
    'Represents Microsoft’s standardized customer sub-segment classification at the customer Top Parent Organization ID (TPID) level. This is used to group customers into comparable market tiers for segmentation, targeting, and prioritization.',
  'Industry / Vertical':
    'Indicates the customer’s primary industry or vertical at the customer TPID level, enabling industry-specific segmentation, filtering, and go-to-market analysis within ASPX.',
  'Customer TPID': "The TPID is associated with the Tenant ID. For any given Tenant ID on any given date, there's only one customer TPID.",
  'Customer Name': 'Name of the customer TPID.',
  'EA Renewal':
    "Month when the Microsoft Enterprise Agreement (EA) is up for renewal. This data only shows if the tenant has the partner's name listed as the EA reseller.",
  'Largest Seat CSP Renewal':
    'Month when the largest (by license count) Cloud Solutions Provider (CSP) subscription is up for renewal. This data is only visible if the tenant has the partner name listed as the CSP provider for the subscription.',
  'Dominant SKU Group':
    "Based on the tenant's largest license by license count, a categorization of the customer into the following: Business Basic (BB), Business Standard (BS), Business Premium (BP); Office 365 E1, Office 365 E3; Office 365 E3 + Enterprise Mobility + Security; Office 365 E1 + Enterprise Mobility + Security/Office 365 E1 Plus; Microsoft 365 E3 (ME3) or ME3 + Mini-bundles (Microsoft Purview Suite); Microsoft 365 E5.",
  'Copilot Eligible M365 Seats':
    'The total number of Microsoft 365 licenses within a tenant that meet the licensing prerequisites for Microsoft 365 Copilot. This capacity represents the potential base for Copilot activation and adoption.',
  'Copilot Seats Whitespace':
    'The gap between Copilot-eligible licenses and users currently licensed for Copilot. This metric highlights untapped opportunities for upsell and expansion within existing Microsoft 365 deployments.',
  'Copilot in 30 Trial Recommendation':
    "A single view for Copilot in 30 trial lifecycle management that suggests the next best action for each customer based on trial status, Copilot usage, and engagement signals, helping you prioritize the right sales and adoption motion for each customer. Recommended actions include: Offer Trial; Offer Trial - High Propensity; Drive Adoption – Churn Risk; Convert to Paid – Healthy Usage; Churned – Recover; Converted – Expand; Converted – Drive Adoption and Cowork; Not Eligible.",
  'Copilot in 30 Days Remaining':
    'For trials that are active, the number of days remaining (30 days or less) before the trial subscription ends.',
  'CSP Transacted Licenses':
    'The sum of the license count (not deduplicated) of all CSP transacted licenses by the partner associated to the tenant. This count does not include non-M365 licenses such as Dynamics/PowerBI.',
  'CSP Transacted Licenses %':
    'Percentage of total license count (not deduplicated) that is transacted via CSP by the partner associated to the tenant. This percentage helps prioritize those customers where the associated partner manages a majority of the licenses with the customer.',
  'Copilot MAU (Licensed)':
    'MAU is the measure, determined by Microsoft product telemetry, of unique signed-in users who have taken one or more intentional actions in the last rolling 28 days. The intentional action establishes clear user intent to perform a specific business action. MAU only measures licensed users (can be free trial) as well.',
  'Copilot PAU':
    "PAU is the measure of paid licenses assigned to a tenant that is revenue associated. PAU is always less than or equal to the number of licenses because PAU doesn't count trial licenses, promotional licenses, step-up SKUs, or any unpaid subscription. Also, PAU requires the license to be assigned to a user and requires the service plan to be enabled in the tenant admin portal. Since paid licenses fluctuate due to billing cycles, PAU smooths these fluctuations by applying logic that removes cyclical impacts.",
  'Copilot Utilization': 'The ratio of MAU divided by PAU, capped at 100%.',
  'Adoption Status':
    "Specifically for tenants with paid licenses, this provides a Machine-Learning estimate on whether a tenant is thriving with Copilot adoption or struggling with adoption. Healthy = Tenant on track to hit 80% MAU / PAU by one year; Failure to Start = Haven't broken 10% MAU / PAU in history; Failure to Adopt = Not on track to reach 80% MAU / PAU by one year; Failure to Adopt but Last Month Gain; Healthy but Last Month Drop; Healthy but Negative Slope; Big Gain & Big Drop; Starting = Recent purchase and more data is needed.",
  'Admin Settings Recommendations':
    'Admin Settings Recommendations can help you quickly identify Microsoft 365 Copilot configuration gaps that might limit customer adoption, engagement, and overall value realization. Use these recommendations to review tenant settings, identify whether each configuration is healthy or requires attention, and prioritize remediation before expansion or upsell conversations. Learn to Fix resources provide guidance for addressing the highest-impact configuration blockers.',
  'Frontier Enabled':
    'The Microsoft Frontier program gives organizations early access to innovative and emerging AI capabilities in Microsoft 365 before those features reach general availability. If a tenant is enabled then all users have access to frontier features. If a tenant is partially enabled, then specific users (including a single user) have access to frontier features. Disabled means that no users have access to frontier features.',
  'Free Copilot Chat MAU (Unlicensed)':
    "This provides the MAU that a customer has, based on free chat usage, which doesn't require Microsoft 365 Copilot licenses. MAU is the measure, determined by Microsoft product telemetry, of unique signed-in users who have taken one or more intentional actions in the last rolling 28 days.",
  'Free Chat MAU Whitespace':
    'Total Microsoft 365 licenses that are eligible to have a Microsoft 365 Copilot subscription subtracted by Copilot Chat MAU.',
  'All Copilot MAU': 'The sum of licensed and unlicensed Copilot MAU. Select for a further breakdown of Copilot usage by product, for the tenant.',
  'Free to Paid Whitespace':
    "This calculates the percentage of Copilot usage that's free and unlicensed. This metric is calculated as follows – Unlicensed Copilot MAU / (Unlicensed Copilot MAU + Copilot PAU). The higher this percentage, the more whitespace is available for free to paid conversion monetization.",
  'Monthly Users Experiencing Usage Limits':
    'The monthly active users of Copilot (primarily free tier) experiencing some sort of usage limits due to high demand.',
  'Cumulative License Requests':
    'Cumulative sum of license requests for Copilot. This signal indicates that users requested a Microsoft 365 Copilot license from their admin and can help partners identify customer interest in paid licensing. Because the value is cumulative and can include repeated requests or trial-related activity, use it as an intent signal rather than a direct seat-whitespace count.',
  'All Agents MAU': 'Total agent MAU for all users (licensed and unlicensed). Select for a breakdown by agent type. (simulator)',
  'MTD Credits Consumed':
    'The month-to-date (MTD) Copilot Credits consumed by the tenant across all enabled scenarios and billing configurations, including both pay-as-you-go (PAYGO) and pre-paid credits. Select the value to open the MTD Credits Consumed flyout.',
  'Monthly Credit Limit':
    "The total monthly Copilot Credit limit configured across all of the tenant's billing plans. Compare it with MTD Credits Consumed to gauge headroom and identify customers approaching their limit.",
  'Peak Monthly Consumption':
    "The highest monthly Copilot Credits consumption recorded for the tenant. Use it to compare current consumption with the customer's historical peak.",
  'Weekly Consumption':
    'Total Copilot Credits consumed by the tenant over the last rolling seven days, across all Copilot experiences. Credits are additive across experiences. Select the value to see consumption by experience.',
  'Cowork MAU':
    'Monthly active users of Cowork, measured over the last rolling 28 days. Use this signal to identify customers already engaging with Cowork and to prioritize value-realization, adoption, and upsell conversations.',
  'Monthly Cowork Credits per User': 'Average Copilot Credits consumed by Cowork per Cowork monthly active user. (simulator)',
  'Copilot Opportunity':
    'This field is a Microsoft recommendation of whether the next step should be to focus on acquiring, monetizing, or growing the customer along the Copilot journey. See Copilot Opportunity Details flyout for more details.',
  'E7 Opportunity':
    'E7 Opportunity describes whether a tenant maps to an E7 targeting scenario and provides a flyout with additional context, including agent intensity, Copilot penetration, and Microsoft Entra penetration. Use this field to prioritize E7 upsell conversations and focus outreach on tenants with stronger readiness indicators.',
  'Partner Name':
    'This is the name of the associated Partner Center ID (MPN). The associated partner is the partner on the specific claim with the tenant. This partner name is typically at a regional level. This could be a CPOR claim, a CSP association or more.',
  'Partner Center ID (MPN)':
    'This is the associated Partner Center ID (MPN). The associated partner is the partner on the specific claim with the tenant. This could be a CPOR claim, a CSP association or more.',
  'Data Security Maturity':
    'Data Security Maturity describes the tenant’s security license profile and usage of key data security features that are part of Purview. Use this field with Copilot opportunity data to identify customers that may need security readiness or adoption actions before Copilot upsell. Values include Advanced-Healthy, Advanced-Unhealthy, Limited-Healthy, Limited-Unhealthy, and Minimal.',
  'MCI Eligibility':
    'MCI Eligibility indicates whether the tenant and workload are eligible for one or more MCI engagements. Use this field with propensity, usage, and renewal context to prioritize workshop and adoption opportunities that are eligible for incentive-backed engagement.',
  'Claim ID': 'Identifier of the CPOR claim that associates the partner with the tenant. (simulator)',
  'Claimed By Others': 'Yes/No flag if another partner also has a claim on this tenant. (simulator)',
  'CSP Tier': 'If this is associated via CSP, a breakdown of which customers are associated as a distributor or as a reseller.',
  'CPOR Association': 'Yes/No flag if this customer is associated with the partner via a CPOR claim.',
  'CSP Association': 'Yes/No flag if this customer is associated with the partner via a CSP association.',
  'T2 Reseller ID': 'For tier 2 CSP associations, this is the identifier of the T2 reseller. (simulator)',
  'T2 Reseller Name':
    'For tier 2 CSP associations, this is the name of the T2 reseller. This data is only visible if the tenant has the partner name listed as the CSP provider for the subscription.',
  'MCI Engagement Name':
    'List of Microsoft Commerce incentivized Modern Work and Security engagements for which both partner and customer are eligible.',
  'Agent Intensity': 'Level (High, Medium, Low) of agent usage in the tenant, used to map the E7 targeting scenario. (simulator)',
  'Entra Penetration': 'Microsoft Entra active users as a percentage of eligible seats, shown in the E7 Opportunity flyout. (simulator)',
  'M365 Copilot Penetration': 'The number of Microsoft 365 Copilot paid available units / Copilot eligible licenses.',
  'E7 Sub Scenario':
    'ME5 with H/M agent intensity: Tenants with E5 and AI maturity, strong candidates for E7 upsell now, and are top priority. ME3 with H/M agent intensity: Tenants with AI maturity, but not primarily on E5 licenses. These tenants are second in priority. ME5 with low agent intensity: Tenants with E5 maturity and copilot penetration, but not high agent usage. These tenants are third priority.',

  // Hidden columns
  'Free Chat Penetration': 'Free Chat MAU as a percentage of total Copilot eligible seats.',
  'Percentage of Free Users Reaching Usage Limits': 'Users experiencing usage limits as a percentage of Free Chat MAU.',
  'Copilot in Word MAU': 'MAU for Copilot in Word, focusing on content generation, rewriting, and document summarization.',
  'Copilot in Excel MAU': 'MAU for Copilot in Excel, including data analysis, formula generation, and visualization assistance.',
  'Copilot in PowerPoint MAU': 'MAU for Copilot in PowerPoint, such as creating presentations, designing slides, and summarizing content.',
  'Copilot in Outlook MAU': 'MAU for Copilot features in Outlook, including email drafting, summarization, and scheduling assistance.',
  'Copilot in Teams MAU':
    'MAU for Copilot features embedded in Microsoft Teams, such as summarizing chats, generating meeting notes, or drafting responses.',
  'Copilot in OneNote MAU': 'MAU for Copilot in OneNote, including note summarization, organization, and content generation.',
  'Copilot in Engage MAU': 'MAU for Copilot in Viva Engage, supporting community engagement and content creation.',
  'Copilot Chat Agents MAU':
    'Monthly Active Users interacting with Copilot through the Chat interface (for example, Copilot in Microsoft 365 Chat or Business Chat).',
  'Connector Agents MAU':
    'MAU for Copilot agents that leverage connectors to pull data from external systems (for example, CRM, ERP, or third-party apps).',
  'Plugins Agents MAU': 'MAU for Copilot agents using plugins to extend functionality beyond native Microsoft 365 capabilities.',
  'Custom Engine Agents MAU': 'MAU for custom-built Copilot agents created by organizations using Microsoft’s extensibility frameworks.',
  'Sales Copilot (CRM) MAU':
    'MAU for Microsoft Sales Copilot, which integrates with CRM systems (Dynamics 365 or Salesforce) to assist sellers with insights, summaries, and recommendations.',
  'Web Search': 'Web Search enabled status.',
  'Web Search - Healthy': 'A flag that describes whether the Web Search admin setting is healthy.',
  'Taskbar Pinning': 'Windows Taskbar Pinning status.',
  'Taskbar Pinning - Healthy': 'A flag that describes whether Taskbar Pinning admin setting is healthy.',
  'Blocked 1P Agents': 'Number of blocked first-party agents.',
  'Blocked 1P Agents - Healthy': 'A flag that describes whether the blocked first-party agents admin setting is healthy.',
  'App Status in Integrated Apps': 'Integrated Apps app status.',
  'App Status in Integrated Apps - Healthy': 'A flag that describes whether the App Status in Integrated Apps admin setting is healthy.',
  'Channel Readiness': 'Channel readiness percentage.',
  'Channel Readiness - Healthy': 'A flag that describes whether channel readiness is healthy.',
  'Prior High Water Mark (HWM)':
    "The highest all-time recorded MAU for a particular service or subscription within a specified time frame before a certain event, such as the start of a new billing cycle or the date of a partner association. It's also used to determine the baseline from which growth is measured for incentive calculations.",
  'Starting High Water Mark (HWM)':
    "The highest all-time MAU before the partner association date. It's a benchmark used to measure the initial level of usage or engagement that a partner brings to the table when they begin their association with Microsoft.",
  'Opportunity Units': 'The available number of units for usage incentives (PAU minus Prior High Water Mark).',
  'Rate per Unit': 'The rate of usage incentive available for each compensable unit of active usage.',
  'Max Comp Units': 'The maximum compensable units for usage incentives.',
  'CPOR Potential Earnings':
    "Calculated by multiplying a workload's opportunity units by the rate per unit for a specific workload. This calculation provides an estimation of the earnings a partner could potentially receive for servicing a customer's Microsoft cloud environment under the CPOR program.",
  'Earliest CSP Renewal':
    'Month when the earliest (by subscription end date) CSP subscription is up for renewal. This data is only visible if the tenant has the partner name listed as the CSP provider for the subscription.',
  'Non-Profit Pricing':
    'Tenants that are eligible for non-profit pricing across their Microsoft subscriptions. This is a specific list that might not align with the tenant industry or vertical.',
  'Tenant Domain': 'The email domain of the tenant.',
  'CSP Promotions':
    'List of all active new Commerce Cloud Solution Provider (CSP) promotions related to this solution area. Active promotions do not necessarily meet the eligibility criteria for this tenant.',

  // Download-only (flyout fields)
  'PAYGO Credits Consumed': 'Copilot Credits consumed and billed on a pay-as-you-go basis.',
  'Prepaid Credits Consumed': 'Copilot Credits consumed from prepaid credit capacity.',
  'Non Billable Credits Consumed': 'Copilot Credits consumed that are non-billable.',
  'Available Billable Credits':
    'Remaining billable Copilot Credits available under the configured limit (the configured limit minus credits consumed) for billable plans.',
  'Copilot Purchase Propensity':
    'High, medium, or low propensity for a tenant to purchase more Copilot licenses. This propensity includes licensing across AI SKUs, including Microsoft 365 Copilot or Microsoft Copilot for Business.',
  'Cowork (Weekly)': 'Copilot Credits consumed by Cowork in the last rolling seven days.',
  'Work IQ (Weekly)': 'Copilot Credits consumed by Work IQ in the last rolling seven days.',
  'GitHub Copilot (Weekly)': 'Copilot Credits consumed by GitHub Copilot in the last rolling seven days.',
  'Agents (Weekly)': 'Copilot Credits consumed by agents in the last rolling seven days. (simulator)',
};

/** Optional Spanish training notes. Technical terms intentionally left in English. */
export const TRAINING_NOTES: Record<string, string> = {
  Tenants: 'Universo del pipeline: tenants con algún footprint de Copilot (licencias o uso de Free Chat) y que cumplen el umbral de seats (SME&C > 25, Enterprise > 150).',
  'Seat Penetration': 'Qué tanto del Whitespace ya convertiste en PAU. Un valor bajo = mucho espacio para vender seats de Copilot.',
  'Paid Utilization': 'MAU / PAU con tope de 100%. Si es bajo, el cliente pagó pero no usa: prioriza adopción antes de pedir más seats.',
  Acquire: 'Paid penetration y Chat MAU penetration ambos < 5%. Motion: activar Copilot Chat gratis, workshops, Offer Trial.',
  Monetize: 'Chat MAU penetration > 5% pero paid < 5%. El cliente ya usa Free Chat: convertir a paid o monetizar con agents / Copilot Credits.',
  Grow: 'Paid penetration > 5%. Ya hay seats pagados: crecer licencias, idealmente amarrado a la renovación CSP.',
  'E7 Upsell-ready': 'Tenants con señales de security licensing + agent intensity. Prioriza "ME5 with H/M agent intensity" primero.',
  'Potential Earnings': 'Estimado de incentivos (MCI + CPOR) sumado por tenant. No es un número exacto: úsalo para priorizar.',
  'Copilot Tenant Penetration': 'Has Copilot Licenses = PAU > 0. El anillo "No Copilot Licenses" es tu pipeline de primera venta.',
  'Copilot Opportunities': 'Distribución por escenario. "Not targeted" = propensity Low; no lo descartes, pero no es prioridad.',
  'Free-Paid Signals by Tenant': 'Señales de intención de compra. Usage Limits + License Requests = cliente listo para Free to Paid.',
  'Copilot Usage by License': 'Tendencia de 6 meses. Si Unlicensed MAU crece más rápido que Licensed MAU, hay Whitespace de Free to Paid.',
  'MCI Potential Earnings': 'Incentivos MCI por engagement. Si el anillo está gris, ningún tenant filtrado es elegible.',
  // column groups
  'Tenant profile': 'Quién es el cliente: identidad, país, segmento e industria. Útil para filtrar territorios.',
  'Renewals & licensing': 'Fechas de renovación y SKU dominante. Una renovación < 6 meses es el mejor momento para Grow.',
  'Copilot seats & trial': 'Eligible seats, Whitespace y estado del trial Copilot in 30.',
  'Usage & adoption': 'MAU, PAU, Copilot Utilization y Admin Settings. Aquí detectas problemas de adopción.',
  'Free-to-paid signals': 'Free Chat MAU, Free to Paid Whitespace, Usage Limits y License Requests: intención de compra.',
  'Agents, credits & Cowork': 'Consumo de agents y Copilot Credits (PAYGO / prepaid). Cerca del Monthly Credit Limit = oportunidad de vender credits.',
  'Opportunity & E7': 'La recomendación de Microsoft (Acquire / Monetize / Grow) y el escenario E7.',
  'Partner & incentives': 'Asociación (CPOR / CSP), elegibilidad MCI y Potential Earnings.',
  'E7 readiness': 'Agent Intensity, Entra Penetration y M365 Copilot Penetration explican el E7 Sub Scenario.',
};
