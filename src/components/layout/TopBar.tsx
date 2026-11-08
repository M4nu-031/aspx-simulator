import { Menu, MenuItem, MenuList, MenuPopover, MenuTrigger, Switch, Tooltip } from '@fluentui/react-components';
import {
  Alert20Regular,
  Navigation20Regular,
  Person20Regular,
  Search20Regular,
  Settings20Regular,
  Sparkle20Regular,
  WeatherMoon20Regular,
  WeatherSunny20Regular,
} from '@fluentui/react-icons';
import { useApp } from '../../store';

export function TopBar() {
  const { sidebarOpen, setSidebarOpen, theme, setTheme, training, setTraining, setTourRunning } = useApp();
  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          className="icon-btn"
          aria-label={sidebarOpen ? 'Collapse navigation' : 'Expand navigation'}
          aria-expanded={sidebarOpen}
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <Navigation20Regular />
        </button>
        <span className="app-name">ASPX Simulator</span>
      </div>
      <div className="top-search" role="search">
        <Search20Regular />
        <input placeholder="Search" aria-label="Search" />
      </div>
      <div className="topbar-right">
        <div className={`training-toggle${training ? ' on' : ''}`} data-tour="training-toggle">
          <label htmlFor="training-switch">Training mode</label>
          <Switch
            id="training-switch"
            checked={training}
            onChange={(_, d) => {
              setTraining(d.checked);
              if (!d.checked) setTourRunning(false);
            }}
          />
        </div>
        <Tooltip content="Notifications" relationship="label">
          <button className="icon-btn">
            <Alert20Regular />
            <span className="notif-badge">5+</span>
          </button>
        </Tooltip>
        <Tooltip content="Copilot" relationship="label">
          <button className="icon-btn">
            <Sparkle20Regular />
          </button>
        </Tooltip>
        <Menu>
          <MenuTrigger disableButtonEnhancement>
            <Tooltip content="Settings" relationship="label">
              <button className="icon-btn">
                <Settings20Regular />
              </button>
            </Tooltip>
          </MenuTrigger>
          <MenuPopover>
            <MenuList>
              <MenuItem
                icon={theme === 'dark' ? <WeatherSunny20Regular /> : <WeatherMoon20Regular />}
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                {theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
              </MenuItem>
            </MenuList>
          </MenuPopover>
        </Menu>
        <span className="avatar" aria-label="Account">
          <Person20Regular />
        </span>
      </div>
    </header>
  );
}

export function Breadcrumb() {
  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      <span className="home">Home</span>
      <span aria-hidden>›</span>
      <span>Insights</span>
      <span aria-hidden>›</span>
      <span className="current" aria-current="page">
        Growth Opportunities
      </span>
    </nav>
  );
}
