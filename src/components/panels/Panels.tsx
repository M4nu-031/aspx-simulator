import type { ReactNode } from 'react';
import { OverlayDrawer } from '@fluentui/react-components';
import { useApp, tenantByKey } from '../../store';
import { DictionaryPanel, ColumnsPanel, FilterPanel } from './SidePanels';
import {
  AdminFlyout,
  AgentsFlyout,
  AllMauFlyout,
  E7Flyout,
  MtdCreditsFlyout,
  OpportunityFlyout,
  TenantFlyout,
  WeeklyFlyout,
} from './Flyouts';

const FLYOUTS = {
  tenant: TenantFlyout,
  opportunity: OpportunityFlyout,
  e7: E7Flyout,
  allMau: AllMauFlyout,
  agents: AgentsFlyout,
  mtdCredits: MtdCreditsFlyout,
  weekly: WeeklyFlyout,
  admin: AdminFlyout,
} as const;

export function Panels() {
  const panel = useApp((s) => s.panel);
  const close = useApp((s) => s.closePanel);
  let content: ReactNode = null;
  if (panel) {
    if (panel.kind === 'dictionary') content = <DictionaryPanel />;
    else if (panel.kind === 'columns') content = <ColumnsPanel />;
    else if (panel.kind === 'filters') content = <FilterPanel />;
    else {
      const C = FLYOUTS[panel.kind];
      content = <C t={tenantByKey(panel.tenantKey)} />;
    }
  }
  return (
    <OverlayDrawer
      open={!!panel}
      position="end"
      onOpenChange={(_, d) => !d.open && close()}
      style={{ width: 480, maxWidth: '100vw' }}
    >
      {content}
    </OverlayDrawer>
  );
}
