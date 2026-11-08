import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../store';

const NAV: { group?: string; items: string[] }[] = [
  { items: ['Overview'] },
  { group: 'Membership', items: ['Training', 'Microsoft Learn', 'Solutions partner'] },
  { group: 'Surface', items: ['Summary'] },
  {
    group: 'Cloud product performance',
    items: [
      'Summary',
      'Customers',
      'Resellers',
      'Subscriptions',
      'Azure usage',
      'Teams usage',
      'Office 365 usage',
      'Dynamics usage',
      'EMS usage',
      'PowerBI usage',
      'Net paid seats',
      'Customer opportunities',
      'Lighthouse (Sales Advisor)',
      'GDAP relationship analytics',
    ],
  },
];

export function Sidebar() {
  const open = useApp((s) => s.sidebarOpen);
  const nav = useNavigate();
  const loc = useLocation();
  const activeGrowth = loc.pathname.startsWith('/growth');
  return (
    <aside className={`sidebar${open ? '' : ' collapsed'}`} aria-label="Partner Center navigation" aria-hidden={!open}>
      <div className="sidebar-scroll">
        {NAV.map((g, gi) => (
          <div key={gi} role="group" aria-label={g.group ?? 'Overview'}>
            {g.group && <div className="nav-group">{g.group}</div>}
            {g.items.map((it) => {
              const path = `/not-included/${encodeURIComponent(`${g.group ?? ''}|${it}`)}`;
              return (
                <button
                  key={it}
                  tabIndex={open ? 0 : -1}
                  className={`nav-item${g.group ? '' : ' top'}${decodeURIComponent(loc.pathname) === decodeURIComponent(path) ? ' active' : ''}`}
                  onClick={() => nav(path)}
                >
                  {it}
                </button>
              );
            })}
          </div>
        ))}
      </div>
      <div className="sidebar-pinned">
        <button
          tabIndex={open ? 0 : -1}
          className={`nav-item top${activeGrowth ? ' active' : ''}`}
          aria-current={activeGrowth ? 'page' : undefined}
          style={{ fontWeight: 700, fontSize: 12 }}
          onClick={() => nav('/growth/copilot')}
        >
          AI Business Solutions &amp; Security
        </button>
      </div>
    </aside>
  );
}
