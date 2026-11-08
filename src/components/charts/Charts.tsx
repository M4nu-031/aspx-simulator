import type { ReactNode } from 'react';
import ReactECharts from 'echarts-for-react';
import { Menu, MenuItem, MenuList, MenuPopover, MenuTrigger, Tooltip } from '@fluentui/react-components';
import { Filter20Regular, MoreHorizontal20Regular } from '@fluentui/react-icons';
import { HISTORY_MONTHS } from '../../data/tenants';
import { freePaidSignals, mciEarningsByEngagement, SCENARIOS, tenantPenetration, usageHistory, type Scenario } from '../../lib/metrics';
import { SIGNAL_LABELS, type QuickFilter } from '../../lib/filters';
import { asOfLabel, fmtMonthShort, fmtUsd } from '../../lib/format';
import { useApp, useData } from '../../store';
import { TipContent, TrainingBadge } from '../InfoTip';

export const COLORS = {
  cyan: '#1aa0c8',
  plum: '#7a1050',
  blue: '#4f6bed',
  mustard: '#b8960c',
  grey: '#8a8886',
};
const SCENARIO_COLORS: Record<Scenario, string> = {
  Acquire: COLORS.cyan,
  Monetize: COLORS.plum,
  Grow: COLORS.blue,
  'Not targeted': COLORS.mustard,
};

function useChartTheme() {
  const dark = useApp((s) => s.theme) === 'dark';
  return {
    text: dark ? '#ffffff' : '#201f1e',
    sub: dark ? '#d2d0ce' : '#3b3a39',
    grid: dark ? '#484644' : '#e1dfdd',
    tooltipBg: dark ? '#323130' : '#ffffff',
    ringBorder: dark ? '#292827' : '#ffffff',
  };
}

interface A11yItem {
  label: string;
  quick: QuickFilter;
}

function ChartCard({
  n,
  title,
  children,
  a11y,
  tour,
}: {
  n: number;
  title: string;
  children: ReactNode;
  a11y: A11yItem[];
  tour?: string;
}) {
  const s = useApp();
  return (
    <section className="chart-card" aria-label={title} data-tour={tour}>
      <TrainingBadge n={n} term={title} />
      <div className="chart-head">
        <div>
          <Tooltip content={<TipContent term={title} />} relationship="description" withArrow>
            <div className="chart-title" tabIndex={0}>
              {title}
            </div>
          </Tooltip>
          <div className="chart-asof">{asOfLabel()}</div>
        </div>
        <div className="chart-actions">
          <button className="ghost-btn" onClick={() => s.openPanel({ kind: 'filters' })}>
            <Filter20Regular /> Filter
          </button>
          <Menu>
            <MenuTrigger disableButtonEnhancement>
              <button className="ghost-btn" aria-label={`${title} more options`}>
                <MoreHorizontal20Regular style={{ color: 'var(--text)' }} />
              </button>
            </MenuTrigger>
            <MenuPopover>
              <MenuList>
                <MenuItem onClick={s.resetFilters}>Reset filters</MenuItem>
                <MenuItem onClick={() => s.openPanel({ kind: 'dictionary' })}>Data Dictionary</MenuItem>
              </MenuList>
            </MenuPopover>
          </Menu>
        </div>
      </div>
      <div className="chart-body">{children}</div>
      {/* Keyboard / screen-reader access to the same click-to-filter actions */}
      <ul className="sr-only" aria-label={`${title} filters`}>
        {a11y.map((a) => (
          <li key={a.label}>
            <button onClick={() => s.setQuick(a.quick)}>Filter table: {a.label}</button>
          </li>
        ))}
      </ul>
    </section>
  );
}

const echartsStyle = { height: '100%', width: '100%' };

export function Charts() {
  const { contextRows } = useData();
  const setQuick = useApp((s) => s.setQuick);
  const c = useChartTheme();
  const tooltip = { backgroundColor: c.tooltipBg, borderColor: c.grid, textStyle: { color: c.text, fontSize: 12 } };
  const legendBase = {
    bottom: 0,
    left: 0,
    icon: 'rect',
    itemWidth: 10,
    itemHeight: 10,
    textStyle: { color: c.text, fontSize: 12 },
    inactiveColor: '#605e5c',
  };
  const go = (q: QuickFilter) => {
    setQuick(q);
  };

  // A — Copilot Tenant Penetration
  const pen = tenantPenetration(contextRows);
  const optA = {
    tooltip: { ...tooltip, trigger: 'item' },
    legend: { ...legendBase, data: ['Has Copilot Licenses', 'No Copilot Licenses'] },
    series: [
      {
        type: 'pie',
        radius: ['42%', '62%'],
        center: ['50%', '46%'],
        itemStyle: { borderColor: c.ringBorder, borderWidth: 1 },
        label: { show: true, position: 'outside', color: c.text, formatter: (p: { value: number }) => (p.value ? String(p.value) : '') },
        labelLine: { show: true, length: 8, length2: 8 },
        data: [
          { name: 'Has Copilot Licenses', value: pen.has, itemStyle: { color: COLORS.cyan } },
          { name: 'No Copilot Licenses', value: pen.none, itemStyle: { color: COLORS.plum } },
        ],
      },
    ],
  };

  // B — Copilot Opportunities
  const optB = {
    tooltip: { ...tooltip, trigger: 'item' },
    legend: {
      ...legendBase,
      type: 'scroll',
      right: 0,
      pageFormatter: '{current}/{total}',
      pageTextStyle: { color: c.text },
      pageIconColor: c.text,
      pageIconInactiveColor: '#605e5c',
      pageIconSize: 10,
    },
    series: [
      {
        type: 'pie',
        radius: ['42%', '62%'],
        center: ['50%', '46%'],
        itemStyle: { borderColor: c.ringBorder, borderWidth: 1 },
        label: { show: true, position: 'outside', color: c.text, formatter: (p: { value: number }) => (p.value ? String(p.value) : '') },
        labelLine: { show: true, length: 8, length2: 8 },
        data: SCENARIOS.map((s) => ({
          name: s,
          value: contextRows.filter((r) => r.scenario === s).length,
          itemStyle: { color: SCENARIO_COLORS[s] },
        })),
      },
    ],
  };

  // C — Free-Paid Signals by Tenant
  const sig = freePaidSignals(contextRows);
  const sigKeys = ['usageLimits', 'freeChat', 'licenseRequests'] as const;
  const optC = {
    tooltip: { ...tooltip, trigger: 'item' },
    grid: { left: 4, right: 34, top: 8, bottom: 8, containLabel: true },
    xAxis: { type: 'value', minInterval: 1, axisLabel: { color: c.sub }, splitLine: { lineStyle: { color: c.grid } } },
    yAxis: {
      type: 'category',
      inverse: true,
      data: sigKeys.map((k) => SIGNAL_LABELS[k]),
      axisLabel: { color: c.text, fontSize: 11, width: 92, overflow: 'break', lineHeight: 14 },
      axisLine: { lineStyle: { color: c.grid } },
      axisTick: { show: false },
    },
    series: [
      {
        type: 'bar',
        barWidth: 22,
        data: sigKeys.map((k) => ({ value: sig[k], itemStyle: { color: COLORS.blue } })),
        label: { show: true, position: 'right', color: c.text },
        cursor: 'pointer',
      },
    ],
  };

  // D — Copilot Usage by License
  const hist = usageHistory(contextRows);
  const months = HISTORY_MONTHS.map(fmtMonthShort);
  const line = (name: string, data: number[], color: string) => ({
    name,
    type: 'line',
    data,
    smooth: true,
    symbol: 'circle',
    symbolSize: 6,
    lineStyle: { width: 2, color },
    itemStyle: { color },
  });
  const optD = {
    tooltip: { ...tooltip, trigger: 'axis' },
    legend: { ...legendBase, icon: 'circle', data: ['Unlicensed MAU', 'All MAU', 'Licensed MAU'] },
    grid: { left: 4, right: 14, top: 12, bottom: 46, containLabel: true },
    xAxis: {
      type: 'category',
      data: months,
      boundaryGap: false,
      axisLabel: { color: c.text, fontSize: 11, interval: 1 },
      axisLine: { lineStyle: { color: c.grid } },
    },
    yAxis: {
      type: 'value',
      splitNumber: 4,
      axisLabel: { color: c.sub, fontSize: 11, formatter: (v: number) => v.toLocaleString('en-US') },
      splitLine: { lineStyle: { color: c.grid } },
    },
    series: [
      line('Unlicensed MAU', hist.unlicensed, COLORS.cyan),
      line('All MAU', hist.all, COLORS.plum),
      line('Licensed MAU', hist.licensed, COLORS.blue),
    ],
  };

  // E — MCI Potential Earnings
  const mci = mciEarningsByEngagement(contextRows);
  const mciColors = [COLORS.cyan, COLORS.plum, COLORS.blue, COLORS.mustard, '#c239b3'];
  const optE = mci.length
    ? {
        tooltip: { ...tooltip, trigger: 'item', valueFormatter: (v: number) => fmtUsd(v) },
        legend: { ...legendBase, type: 'scroll', right: 0, pageFormatter: '{current}/{total}', pageTextStyle: { color: c.text }, pageIconColor: c.text },
        series: [
          {
            type: 'pie',
            radius: ['36%', '54%'],
            center: ['50%', '46%'],
            itemStyle: { borderColor: c.ringBorder, borderWidth: 1 },
            label: {
              show: true,
              position: 'outside',
              color: c.text,
              fontSize: 11,
              formatter: (p: { value: number }) => (p.value >= 1000 ? `$${(p.value / 1000).toLocaleString('en-US', { maximumFractionDigits: 1 })}K` : fmtUsd(p.value)),
            },
            labelLine: { show: true, length: 5, length2: 5 },
            data: mci.map((m, i) => ({ ...m, itemStyle: { color: mciColors[i % mciColors.length] } })),
          },
        ],
      }
    : {
        // Empty state: full grey ring
        legend: { ...legendBase, data: ['Workload'] },
        series: [
          {
            type: 'pie',
            radius: ['42%', '62%'],
            center: ['50%', '46%'],
            silent: true,
            label: { show: false },
            data: [{ name: 'Workload', value: 1, itemStyle: { color: '#c8c6c4' } }],
          },
        ],
      };

  return (
    <section className="charts" aria-label="Charts" data-tour="charts">
      <ChartCard
        n={9}
        title="Copilot Tenant Penetration"
        a11y={[
          { label: `Has Copilot Licenses (${pen.has})`, quick: { kind: 'licenses', value: 'Has Copilot Licenses' } },
          { label: `No Copilot Licenses (${pen.none})`, quick: { kind: 'licenses', value: 'No Copilot Licenses' } },
        ]}
      >
        <ReactECharts
          option={optA}
          style={echartsStyle}
          notMerge
          onEvents={{ click: (p: { name: string }) => go({ kind: 'licenses', value: p.name as 'Has Copilot Licenses' }) }}
        />
      </ChartCard>
      <ChartCard
        n={10}
        title="Copilot Opportunities"
        tour="chart-opportunities"
        a11y={SCENARIOS.map((s) => ({ label: s, quick: { kind: 'scenario', value: s } }))}
      >
        <ReactECharts
          option={optB}
          style={echartsStyle}
          notMerge
          onEvents={{ click: (p: { name: string }) => go({ kind: 'scenario', value: p.name as Scenario }) }}
        />
      </ChartCard>
      <ChartCard
        n={11}
        title="Free-Paid Signals by Tenant"
        tour="chart-signals"
        a11y={sigKeys.map((k) => ({ label: `${SIGNAL_LABELS[k]} (${sig[k]})`, quick: { kind: 'signal', value: k } }))}
      >
        <ReactECharts
          option={optC}
          style={echartsStyle}
          notMerge
          onEvents={{ click: (p: { dataIndex: number }) => go({ kind: 'signal', value: sigKeys[p.dataIndex] }) }}
        />
      </ChartCard>
      <ChartCard
        n={12}
        title="Copilot Usage by License"
        a11y={(['Unlicensed MAU', 'All MAU', 'Licensed MAU'] as const).map((v) => ({ label: v, quick: { kind: 'usage', value: v } }))}
      >
        <ReactECharts
          option={optD}
          style={echartsStyle}
          notMerge
          onEvents={{ click: (p: { seriesName: string }) => go({ kind: 'usage', value: p.seriesName as 'All MAU' }) }}
        />
      </ChartCard>
      <ChartCard n={13} title="MCI Potential Earnings" a11y={mci.map((m) => ({ label: m.name, quick: { kind: 'mciEngagement', value: m.name } }))}>
        <ReactECharts
          option={optE}
          style={echartsStyle}
          notMerge
          onEvents={{ click: (p: { name: string }) => mci.length && go({ kind: 'mciEngagement', value: p.name }) }}
        />
      </ChartCard>
    </section>
  );
}
