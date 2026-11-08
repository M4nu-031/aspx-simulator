import { create } from 'zustand';
import { useMemo } from 'react';
import { TENANTS } from './data/tenants';
import { enrich, type TenantView } from './lib/metrics';
import { applyFacets, applySearch, quickTest, type FacetState, type QuickFilter } from './lib/filters';
import { DEFAULT_ORDER, DEFAULT_VISIBILITY, type FlyoutKind } from './lib/columns';

export type PanelState =
  | { kind: 'dictionary' }
  | { kind: 'columns' }
  | { kind: 'filters' }
  | { kind: FlyoutKind; tenantKey: number };

interface AppState {
  theme: 'dark' | 'light';
  sidebarOpen: boolean;
  partner: string; // 'all' | partner id
  facets: FacetState;
  quick: QuickFilter | null;
  search: string;
  columnVisibility: Record<string, boolean>;
  columnOrder: string[];
  downloadOnly: string[];
  panel: PanelState | null;
  training: boolean;
  tourRunning: boolean;

  setTheme: (t: 'dark' | 'light') => void;
  setSidebarOpen: (v: boolean) => void;
  setPartner: (p: string) => void;
  setFacets: (f: FacetState) => void;
  setQuick: (q: QuickFilter | null) => void;
  setSearch: (s: string) => void;
  resetFilters: () => void;
  setColumnVisibility: (v: Record<string, boolean>) => void;
  setColumnOrder: (o: string[]) => void;
  resetColumns: () => void;
  setDownloadOnly: (ids: string[]) => void;
  openPanel: (p: PanelState) => void;
  closePanel: () => void;
  setTraining: (v: boolean) => void;
  setTourRunning: (v: boolean) => void;
}

const savedTheme = (() => {
  try {
    return (localStorage.getItem('aspx-theme') as 'dark' | 'light' | null) ?? 'dark';
  } catch {
    return 'dark';
  }
})();

export const useApp = create<AppState>((set) => ({
  theme: savedTheme,
  sidebarOpen: typeof window === 'undefined' ? true : window.innerWidth >= 1280,
  partner: 'all',
  facets: {},
  quick: null,
  search: '',
  columnVisibility: DEFAULT_VISIBILITY,
  columnOrder: DEFAULT_ORDER,
  downloadOnly: [],
  panel: null,
  training: false,
  tourRunning: false,

  setTheme: (theme) => {
    try {
      localStorage.setItem('aspx-theme', theme);
    } catch {
      /* ignore */
    }
    set({ theme });
  },
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setPartner: (partner) => set({ partner }),
  setFacets: (facets) => set({ facets }),
  setQuick: (quick) => set({ quick }),
  setSearch: (search) => set({ search }),
  resetFilters: () => set({ facets: {}, quick: null, search: '' }),
  setColumnVisibility: (columnVisibility) => set({ columnVisibility }),
  setColumnOrder: (columnOrder) => set({ columnOrder }),
  resetColumns: () => set({ columnVisibility: DEFAULT_VISIBILITY, columnOrder: DEFAULT_ORDER, downloadOnly: [] }),
  setDownloadOnly: (downloadOnly) => set({ downloadOnly }),
  openPanel: (panel) => set({ panel }),
  closePanel: () => set({ panel: null }),
  setTraining: (training) => set({ training }),
  setTourRunning: (tourRunning) => set({ tourRunning }),
}));

/** All tenants, enriched once. */
export const ALL_TENANTS: TenantView[] = TENANTS.map(enrich);

/**
 * contextRows → partner selector + Filter drawer (drives KPIs and charts).
 * tableRows   → contextRows + KPI/chart/playbook quick filter + search box.
 */
export function useData() {
  const partner = useApp((s) => s.partner);
  const facets = useApp((s) => s.facets);
  const quick = useApp((s) => s.quick);
  const search = useApp((s) => s.search);
  return useMemo(() => {
    const byPartner = partner === 'all' ? ALL_TENANTS : ALL_TENANTS.filter((t) => t.partnerId === partner);
    const contextRows = applyFacets(byPartner, facets);
    const quickRows = quick ? contextRows.filter((t) => quickTest(quick, t)) : contextRows;
    const tableRows = applySearch(quickRows, search);
    return { contextRows, tableRows };
  }, [partner, facets, quick, search]);
}

export const tenantByKey = (k: number) => ALL_TENANTS.find((t) => t.caseNo === k)!;
