import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Car, LayoutDashboard, MapPin, Users } from 'lucide-react';
import { ApiError, clearToken, getToken, listDrivers, listRides } from './api';
import { AppShell, LiveReporter, ToastProvider, useToast, type NavItem } from './components/ui';
import { useLiveData } from './hooks/useLiveData';
import { DriversPage } from './pages/DriversPage';
import { LoginPage } from './pages/LoginPage';
import { OverviewPage } from './pages/OverviewPage';
import { RidesPage } from './pages/RidesPage';
import { clearUser, loadUser } from './session';

const POLL_MS = 5000;

const Workspace: React.FC<{ onSignOut: () => void }> = ({ onSignOut }) => {
  const toast = useToast();
  const [page, setPage] = useState('overview');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [fresh, setFresh] = useState<Set<string>>(new Set());
  const seen = useRef<Set<string> | null>(null);

  // Shared feeds: power the Overview, Rides and Drivers pages, the sidebar badge and arrival alerts.
  const feed = useLiveData(() => listRides().then((r) => r.items), {
    intervalMs: POLL_MS,
    onUnauthorized: onSignOut,
  });
  const fleet = useLiveData(() => listDrivers().then((r) => r.items), {
    intervalMs: POLL_MS * 2,
    onUnauthorized: onSignOut,
  });
  const rides = feed.data;
  const drivers = fleet.data;

  useEffect(() => {
    if (!rides) return;
    if (seen.current) {
      const arrived = rides.filter((r) => !seen.current!.has(r.id));
      if (arrived.length) {
        setFresh((prev) => new Set([...prev, ...arrived.map((r) => r.id)]));
        toast.show(
          'info',
          arrived.length === 1
            ? `New ride ${arrived[0]!.rideNumber}`
            : `${arrived.length} new rides`,
          arrived.length === 1
            ? `${arrived[0]!.rider.name} → ${arrived[0]!.drop.address}`
            : undefined,
        );
      }
    }
    seen.current = new Set(rides.map((r) => r.id));
  }, [rides, toast]);

  const onError = useCallback(
    (err: unknown) => {
      if (err instanceof ApiError && err.status === 401) onSignOut();
      else toast.show('error', err instanceof Error ? err.message : 'Something went wrong');
    },
    [onSignOut, toast],
  );

  const openRide = (id: string) => {
    setSelectedId(id);
    setPage('rides');
  };

  const newCount = (rides ?? []).filter((r) => r.status === 'requested').length;
  const nav: NavItem[] = [
    { key: 'overview', label: 'Overview', icon: <LayoutDashboard size={18} /> },
    { key: 'rides', label: 'Rides', icon: <MapPin size={18} />, badge: newCount },
    { key: 'drivers', label: 'Drivers', icon: <Users size={18} /> },
  ];
  const activeDrivers = (drivers ?? []).filter((d) => d.active);

  return (
    <AppShell
      brand={{ name: 'ElderCare Rides', sub: 'Dispatch console', icon: <Car size={18} /> }}
      groupLabel="Workspace"
      nav={nav}
      active={page}
      onNavigate={(key) => {
        setSelectedId(null);
        setPage(key);
      }}
      user={{ name: loadUser(), role: 'Dispatcher' }}
      onSignOut={onSignOut}
    >
      <LiveReporter at={feed.updatedAt} />
      {feed.error && <div className="notice">{feed.error}</div>}
      {page === 'overview' && (
        <OverviewPage
          rides={rides}
          drivers={drivers ?? []}
          onOpenRide={openRide}
          onNavigate={setPage}
        />
      )}
      {page === 'rides' && (
        <RidesPage
          rides={rides}
          drivers={activeDrivers}
          loading={feed.loading}
          fresh={fresh}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onChanged={feed.reload}
          onError={onError}
        />
      )}
      {page === 'drivers' && (
        <DriversPage
          drivers={drivers}
          rides={rides ?? []}
          onChanged={fleet.reload}
          onError={onError}
        />
      )}
    </AppShell>
  );
};

export const App: React.FC = () => {
  const [signedIn, setSignedIn] = useState<boolean>(Boolean(getToken()));

  const signOut = useCallback(() => {
    clearToken();
    clearUser();
    setSignedIn(false);
  }, []);

  return (
    <ToastProvider>
      {signedIn ? (
        <Workspace onSignOut={signOut} />
      ) : (
        <LoginPage onSignedIn={() => setSignedIn(true)} />
      )}
    </ToastProvider>
  );
};

export default App;
