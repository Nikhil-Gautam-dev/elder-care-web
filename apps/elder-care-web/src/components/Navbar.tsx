import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { HeartHandshake, Home, Mic, Users, User, LogOut, Type, Pill } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ConfirmDialog } from './ui';

const NAV = [
  { to: '/', label: 'Home', Icon: Home, end: true },
  { to: '/assistant', label: 'Talk to ElderCare', short: 'Talk', Icon: Mic },
  { to: '/medications', label: 'Medicines', Icon: Pill },
  { to: '/family', label: 'Family', Icon: Users },
  { to: '/profile', label: 'My profile', short: 'Profile', Icon: User },
] as const;

export const Navbar: React.FC = () => {
  const { isAuthenticated, logout, largeTextMode, toggleLargeTextMode } = useAuth();
  const navigate = useNavigate();
  const [confirmLogout, setConfirmLogout] = useState(false);

  const handleLogout = () => {
    setConfirmLogout(false);
    logout();
    navigate('/login');
  };

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to main content
      </a>
      <header className="navbar">
        <div className="brand">
          <div className="brand-icon" aria-hidden="true">
            <HeartHandshake size={20} />
          </div>
          <span>ElderCare</span>
        </div>

        {isAuthenticated && (
          <nav className="nav-links" aria-label="Main">
            {NAV.map(({ to, label, Icon, ...rest }) => (
              <NavLink
                key={to}
                to={to}
                end={'end' in rest}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={20} aria-hidden="true" />
                <span>{'short' in rest ? rest.short : label}</span>
              </NavLink>
            ))}
          </nav>
        )}

        <div className="nav-tools">
          <button
            onClick={toggleLargeTextMode}
            className="nav-tool"
            aria-pressed={largeTextMode}
            aria-label={
              largeTextMode
                ? 'Text size: large. Switch to standard'
                : 'Text size: standard. Switch to large'
            }
            type="button"
          >
            <Type size={18} aria-hidden="true" />
            <span>{largeTextMode ? 'Larger text: on' : 'Larger text'}</span>
          </button>
          {isAuthenticated && (
            <button
              onClick={() => setConfirmLogout(true)}
              className="nav-tool quiet"
              aria-label="Log out"
              type="button"
            >
              <LogOut size={18} aria-hidden="true" />
              <span>Log out</span>
            </button>
          )}
        </div>
      </header>

      <ConfirmDialog
        open={confirmLogout}
        title="Log out of ElderCare?"
        confirmLabel="Log out"
        onConfirm={handleLogout}
        onCancel={() => setConfirmLogout(false)}
      >
        You will need your phone number and a code to log back in.
      </ConfirmDialog>
    </>
  );
};
