import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { HeartHandshake, MessageSquare, Users, User, LogOut, Type } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout, largeTextMode, toggleLargeTextMode } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="brand">
        <div className="brand-icon">
          <HeartHandshake size={20} />
        </div>
        <span>ElderCare</span>
      </div>

      <nav className="nav-links">
        <button
          onClick={toggleLargeTextMode}
          className={`nav-item ${largeTextMode ? 'active' : ''}`}
          title="Toggle Large Text Mode for better readability"
          type="button"
        >
          <Type size={18} />
          <span>{largeTextMode ? 'Standard Text' : 'Large Text'}</span>
        </button>

        {isAuthenticated && (
          <>
            <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <span>Dashboard</span>
            </NavLink>
            <NavLink
              to="/assistant"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <MessageSquare size={18} />
              <span>Care Assistant</span>
            </NavLink>
            <NavLink
              to="/family"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <Users size={18} />
              <span>Family</span>
            </NavLink>
            <NavLink
              to="/profile"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <User size={18} />
              <span>{user?.name || 'Profile'}</span>
            </NavLink>
            <button onClick={handleLogout} className="nav-item" type="button">
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </>
        )}
      </nav>
    </header>
  );
};
