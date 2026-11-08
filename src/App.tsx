import { useEffect } from 'react';
import { HashRouter, Navigate, Route, Routes, useParams } from 'react-router-dom';
import { FluentProvider, webDarkTheme, webLightTheme, type Theme } from '@fluentui/react-components';
import { useApp } from './store';
import { TopBar, Breadcrumb } from './components/layout/TopBar';
import { Sidebar } from './components/layout/Sidebar';
import { PageHeader, PIVOTS } from './components/layout/PageHeader';
import { KpiTiles } from './components/kpi/KpiTiles';
import { Charts } from './components/charts/Charts';
import { TableToolbar } from './components/table/TableToolbar';
import { OpportunityTable } from './components/table/OpportunityTable';
import { Panels } from './components/panels/Panels';
import { Playbooks } from './components/training/Playbooks';
import { Tour } from './components/training/Tour';

const darkTheme: Theme = { ...webDarkTheme, colorNeutralBackground1: '#292827', colorBrandForeground1: '#479ef5' };

function CopilotTab() {
  return (
    <>
      <KpiTiles />
      <Charts />
      <Playbooks />
      <TableToolbar />
      <OpportunityTable />
    </>
  );
}

function NotIncluded({ label }: { label: string }) {
  return (
    <div className="empty-state" role="status">
      <h2>Not included in this demo</h2>
      <p>
        <b>{label}</b> is not part of ASPX Simulator. Only the Copilot Opportunities tab is available.
      </p>
    </div>
  );
}

function GrowthPage() {
  const { tab = 'copilot' } = useParams();
  const pivot = PIVOTS.find((p) => p.id === tab);
  if (!pivot) return <Navigate to="/growth/copilot" replace />;
  return (
    <>
      <PageHeader tab={tab} />
      {tab === 'copilot' ? <CopilotTab /> : <NotIncluded label={pivot.label} />}
    </>
  );
}

function NotIncludedPage() {
  const { item = '' } = useParams();
  const label = decodeURIComponent(item).split('|').filter(Boolean).join(' › ');
  return <NotIncluded label={label} />;
}

function Shell() {
  const theme = useApp((s) => s.theme);
  const training = useApp((s) => s.training);
  const setSidebarOpen = useApp((s) => s.setSidebarOpen);

  // Sidebar collapses automatically below 1280px.
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1280px)');
    const on = () => setSidebarOpen(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [setSidebarOpen]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return (
    <FluentProvider theme={theme === 'dark' ? darkTheme : webLightTheme} style={{ background: 'transparent' }}>
      <div className={`app${training ? ' training-on' : ''}`} data-theme={theme}>
        <div className="demo-banner" role="note">
          DEMO · Fictitious data for training purposes
        </div>
        <TopBar />
        <Breadcrumb />
        <div className="body">
          <Sidebar />
          <main className="main" id="main">
            <Routes>
              <Route path="/" element={<Navigate to="/growth/copilot" replace />} />
              <Route path="/growth/:tab" element={<GrowthPage />} />
              <Route path="/not-included/:item" element={<NotIncludedPage />} />
              <Route path="*" element={<Navigate to="/growth/copilot" replace />} />
            </Routes>
          </main>
        </div>
        <Panels />
        <Tour />
      </div>
    </FluentProvider>
  );
}

export default function App() {
  return (
    <HashRouter>
      <Shell />
    </HashRouter>
  );
}
