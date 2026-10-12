import React, { createContext, useContext, useEffect, useState } from 'react';
import { ChevronRight, LogOut } from 'lucide-react';
import { Avatar } from './Data';

export interface NavItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

interface LiveApi {
  report: (at: Date | null) => void;
}
const LiveContext = createContext<LiveApi>({ report: () => undefined });
/** Pages call this to tell the top bar when their data last refreshed. */
export const useReportLive = (at: Date | null) => {
  const { report } = useContext(LiveContext);
  useEffect(() => report(at), [at, report]);
};

/** Render anywhere inside AppShell to feed the "Live" indicator. */
export const LiveReporter: React.FC<{ at: Date | null }> = ({ at }) => {
  useReportLive(at);
  return null;
};

interface ShellProps {
  brand: { name: string; sub: string; icon: React.ReactNode };
  groupLabel: string;
  nav: NavItem[];
  active: string;
  onNavigate: (key: string) => void;
  user: { name: string; role: string };
  onSignOut: () => void;
  children: React.ReactNode;
}

export const AppShell: React.FC<ShellProps> = ({
  brand,
  groupLabel,
  nav,
  active,
  onNavigate,
  user,
  onSignOut,
  children,
}) => {
  const [liveAt, setLiveAt] = useState<Date | null>(null);
  const current = nav.find((n) => n.key === active);

  useEffect(() => {
    document.title = `${current?.label ?? ''} · ${brand.name}`;
  }, [current, brand.name]);

  return (
    <LiveContext.Provider value={{ report: setLiveAt }}>
      <div className="shell">
        <aside className="sidebar">
          <div className="sb-brand">
            <span className="sb-logo">{brand.icon}</span>
            <div className="sb-title">
              {brand.name}
              <div className="sb-sub">{brand.sub}</div>
            </div>
          </div>
          <nav>
            <div className="sb-label">{groupLabel}</div>
            {nav.map((n) => (
              <button
                key={n.key}
                type="button"
                className={`sb-link ${active === n.key ? 'active' : ''}`}
                aria-current={active === n.key ? 'page' : undefined}
                onClick={() => onNavigate(n.key)}
              >
                {n.icon}
                {n.label}
                {n.badge ? <span className="sb-count">{n.badge}</span> : null}
              </button>
            ))}
          </nav>
          <div className="sb-user">
            <Avatar name={user.name} size="sm" />
            <div className="grow">
              <div className="name truncate">{user.name}</div>
              <div className="sb-sub">{user.role}</div>
            </div>
            <button
              type="button"
              className="sb-signout"
              onClick={onSignOut}
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut size={17} />
            </button>
          </div>
        </aside>
        <div className="main">
          <header className="topbar">
            <div className="crumbs">
              <span>{brand.name}</span>
              <ChevronRight size={14} />
              <span className="current">{current?.label}</span>
            </div>
            <div className="live" title="Data refreshes automatically">
              <span className={`live-dot ${liveAt ? '' : 'off'}`} />
              {liveAt ? `Live · updated ${liveAt.toLocaleTimeString()}` : 'Connecting…'}
            </div>
          </header>
          <main className="content">{children}</main>
        </div>
      </div>
    </LiveContext.Provider>
  );
};
