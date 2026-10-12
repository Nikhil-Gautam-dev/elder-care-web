import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ClipboardList, LayoutDashboard, Pill, Store } from 'lucide-react';
import { ApiError, clearToken, getToken, listOrders } from './api';
import { AppShell, LiveReporter, ToastProvider, useToast, type NavItem } from './components/ui';
import { useLiveData } from './hooks/useLiveData';
import { CatalogPage } from './pages/CatalogPage';
import { LoginPage } from './pages/LoginPage';
import { OrdersPage } from './pages/OrdersPage';
import { OverviewPage } from './pages/OverviewPage';
import { clearUser, loadUser } from './session';

const POLL_MS = 5000;

const Workspace: React.FC<{ onSignOut: () => void }> = ({ onSignOut }) => {
  const toast = useToast();
  const [page, setPage] = useState('overview');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [fresh, setFresh] = useState<Set<string>>(new Set());
  const seen = useRef<Set<string> | null>(null);

  // One shared orders feed: powers the Overview, Orders page, sidebar badge and arrival alerts.
  const feed = useLiveData(() => listOrders().then((r) => r.items), {
    intervalMs: POLL_MS,
    onUnauthorized: onSignOut,
  });
  const orders = feed.data;

  useEffect(() => {
    if (!orders) return;
    if (seen.current) {
      const arrived = orders.filter((o) => !seen.current!.has(o.id));
      if (arrived.length) {
        setFresh((prev) => new Set([...prev, ...arrived.map((o) => o.id)]));
        toast.show(
          'info',
          arrived.length === 1
            ? `New order ${arrived[0]!.orderNumber}`
            : `${arrived.length} new orders`,
          arrived.length === 1 ? `${arrived[0]!.customer.name} · ₹${arrived[0]!.total}` : undefined,
        );
      }
    }
    seen.current = new Set(orders.map((o) => o.id));
  }, [orders, toast]);

  const onError = useCallback(
    (err: unknown) => {
      if (err instanceof ApiError && err.status === 401) onSignOut();
      else toast.show('error', err instanceof Error ? err.message : 'Something went wrong');
    },
    [onSignOut, toast],
  );

  const openOrder = (id: string) => {
    setSelectedId(id);
    setPage('orders');
  };

  const newCount = (orders ?? []).filter((o) => o.status === 'placed').length;
  const nav: NavItem[] = [
    { key: 'overview', label: 'Overview', icon: <LayoutDashboard size={18} /> },
    { key: 'orders', label: 'Orders', icon: <ClipboardList size={18} />, badge: newCount },
    { key: 'catalog', label: 'Catalog & stock', icon: <Pill size={18} /> },
  ];

  return (
    <AppShell
      brand={{ name: 'ElderCare Pharmacy', sub: 'Partner console', icon: <Store size={18} /> }}
      groupLabel="Workspace"
      nav={nav}
      active={page}
      onNavigate={(key) => {
        setSelectedId(null);
        setPage(key);
      }}
      user={{ name: loadUser(), role: 'Pharmacist' }}
      onSignOut={onSignOut}
    >
      <LiveReporter at={feed.updatedAt} />
      {feed.error && <div className="notice">{feed.error}</div>}
      {page === 'overview' && (
        <OverviewPage
          orders={orders}
          onOpenOrder={openOrder}
          onNavigate={setPage}
          onUnauthorized={onSignOut}
        />
      )}
      {page === 'orders' && (
        <OrdersPage
          orders={orders}
          loading={feed.loading}
          fresh={fresh}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onChanged={feed.reload}
          onError={onError}
        />
      )}
      {page === 'catalog' && <CatalogPage onUnauthorized={onSignOut} />}
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
