import React, { useState } from 'react';
import { ClipboardList, LogOut, Pill, Store } from 'lucide-react';
import { clearToken, getToken } from './api';
import { LoginPage } from './pages/LoginPage';
import { OrdersPage } from './pages/OrdersPage';
import { CatalogPage } from './pages/CatalogPage';

type Tab = 'orders' | 'catalog';

export const App: React.FC = () => {
  const [signedIn, setSignedIn] = useState<boolean>(Boolean(getToken()));
  const [tab, setTab] = useState<Tab>('orders');

  const signOut = () => {
    clearToken();
    setSignedIn(false);
  };

  if (!signedIn) return <LoginPage onSignedIn={() => setSignedIn(true)} />;

  return (
    <>
      <header className="topbar">
        <div className="brand">
          <Store size={22} />
          <span>ElderCare Pharmacy</span>
        </div>
        <nav className="tabs">
          <button
            type="button"
            className={`tab ${tab === 'orders' ? 'active' : ''}`}
            onClick={() => setTab('orders')}
          >
            <ClipboardList size={17} /> Orders
          </button>
          <button
            type="button"
            className={`tab ${tab === 'catalog' ? 'active' : ''}`}
            onClick={() => setTab('catalog')}
          >
            <Pill size={17} /> Catalog &amp; stock
          </button>
        </nav>
        <button type="button" className="btn btn-ghost btn-sm" onClick={signOut}>
          <LogOut size={15} /> Sign out
        </button>
      </header>
      <main className="page">
        {tab === 'orders' ? (
          <OrdersPage onUnauthorized={signOut} />
        ) : (
          <CatalogPage onUnauthorized={signOut} />
        )}
      </main>
    </>
  );
};

export default App;
