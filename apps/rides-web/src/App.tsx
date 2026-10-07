import React, { useState } from 'react';
import { Car, LogOut, MapPin, Users } from 'lucide-react';
import { clearToken, getToken } from './api';
import { LoginPage } from './pages/LoginPage';
import { RidesPage } from './pages/RidesPage';
import { DriversPage } from './pages/DriversPage';

type Tab = 'rides' | 'drivers';

export const App: React.FC = () => {
  const [signedIn, setSignedIn] = useState<boolean>(Boolean(getToken()));
  const [tab, setTab] = useState<Tab>('rides');

  const signOut = () => {
    clearToken();
    setSignedIn(false);
  };

  if (!signedIn) return <LoginPage onSignedIn={() => setSignedIn(true)} />;

  return (
    <>
      <header className="topbar">
        <div className="brand">
          <Car size={22} />
          <span>ElderCare Rides</span>
        </div>
        <nav className="tabs">
          <button
            type="button"
            className={`tab ${tab === 'rides' ? 'active' : ''}`}
            onClick={() => setTab('rides')}
          >
            <MapPin size={17} /> Rides
          </button>
          <button
            type="button"
            className={`tab ${tab === 'drivers' ? 'active' : ''}`}
            onClick={() => setTab('drivers')}
          >
            <Users size={17} /> Drivers &amp; vehicles
          </button>
        </nav>
        <button type="button" className="btn btn-ghost btn-sm" onClick={signOut}>
          <LogOut size={15} /> Sign out
        </button>
      </header>
      <main className="page">
        {tab === 'rides' ? (
          <RidesPage onUnauthorized={signOut} />
        ) : (
          <DriversPage onUnauthorized={signOut} />
        )}
      </main>
    </>
  );
};

export default App;
