import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Users, ArrowRight, ShieldCheck, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div>
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
          color: '#ffffff',
          border: 'none',
          padding: '2.5rem 2rem',
        }}
      >
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}
        >
          <Heart size={28} />
          <span style={{ fontSize: '1.1rem', opacity: 0.9, fontWeight: 500 }}>
            Daily Care Dashboard
          </span>
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          Hello, {user?.name || 'Friend'}!
        </h1>
        <p style={{ opacity: 0.9, fontSize: '1.1rem', maxWidth: '600px' }}>
          Your AI Care Assistant is ready to help you with rides, medicine reminders, and keeping
          your family updated.
        </p>
      </div>

      <div className="grid-2">
        <div className="card">
          <div
            style={{
              width: '48px',
              height: '48px',
              background: 'var(--primary-light)',
              color: 'var(--primary)',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
            }}
          >
            <MessageSquare size={24} />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            Talk to AI Assistant
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Book rides, order medicines, check health status, or talk directly using voice or text.
          </p>
          <Link to="/assistant" className="btn btn-primary btn-large" style={{ width: '100%' }}>
            <span>Start Assistant</span>
            <ArrowRight size={18} />
          </Link>
        </div>

        <div className="card">
          <div
            style={{
              width: '48px',
              height: '48px',
              background: 'var(--success-light)',
              color: 'var(--success)',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
            }}
          >
            <Users size={24} />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            Family & Caregivers
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Manage family member connections, invite new caregivers, or view pending invite
            requests.
          </p>
          <Link to="/family" className="btn btn-secondary btn-large" style={{ width: '100%' }}>
            <span>Manage Family</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>

      <div className="card">
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}
        >
          <ShieldCheck size={22} style={{ color: 'var(--success)' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Care Status Summary</h3>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
          }}
        >
          <div
            style={{
              padding: '1rem',
              background: 'var(--bg-color)',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Phone Number</div>
            <div style={{ fontWeight: 600, marginTop: '0.25rem' }}>{user?.phone || 'Not set'}</div>
          </div>
          <div
            style={{
              padding: '1rem',
              background: 'var(--bg-color)',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Account Status</div>
            <div style={{ marginTop: '0.25rem' }}>
              <span className="badge badge-success">{user?.status || 'Active'}</span>
            </div>
          </div>
          <div
            style={{
              padding: '1rem',
              background: 'var(--bg-color)',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Family Members Linked
            </div>
            <div style={{ fontWeight: 600, marginTop: '0.25rem' }}>
              {user?.familyMembers?.length || 0} Connected
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
