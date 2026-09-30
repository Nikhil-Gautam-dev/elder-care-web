import React, { useState } from 'react';
import { User, Type, Volume2, Save, CheckCircle } from 'lucide-react';
import type { Gender, NotificationChannel, RidePreference } from '@eldercare/shared';
import { formatIndianPhone } from '@eldercare/shared';
import { useAuth } from '../context/AuthContext';
import { updateUserProfile } from '../services/api';

export const ProfilePage: React.FC = () => {
  const { user, userId, refreshUser, largeTextMode, toggleLargeTextMode } = useAuth();

  const [name, setName] = useState<string>(user?.name || '');
  const [age, setAge] = useState<number | undefined>(user?.age);
  const [gender, setGender] = useState<Gender | ''>(user?.gender ?? '');
  const [email, setEmail] = useState<string>(user?.email || '');
  const [city, setCity] = useState<string>(user?.address?.city || '');
  const [state, setState] = useState<string>(user?.address?.state || '');

  const [language, setLanguage] = useState<string>(user?.preferences?.language || 'en');
  const [notificationChannel, setNotificationChannel] = useState<NotificationChannel>(
    user?.preferences?.notificationChannel || 'sms',
  );
  const [preferredRide, setPreferredRide] = useState<RidePreference>(
    user?.preferences?.preferredRide || 'accessible',
  );

  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(
    user?.accessibility?.voiceEnabled ?? false,
  );

  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setError(null);
    setSuccess(false);
    setLoading(true);
    try {
      await updateUserProfile(userId, {
        name,
        age: age ? Number(age) : undefined,
        gender: gender || undefined,
        email: email || undefined,
        address: {
          city,
          state,
        },
        preferences: {
          language,
          notificationChannel,
          preferredRide,
        },
        accessibility: {
          largeText: largeTextMode,
          voiceEnabled,
        },
      });
      await refreshUser();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Profile & Care Preferences</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Manage your personal information, notification channels, and accessibility options.
        </p>
      </div>

      {success && (
        <div
          style={{
            background: 'var(--success-light)',
            color: 'var(--success)',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <CheckCircle size={18} />
          <span>Profile updated successfully!</span>
        </div>
      )}

      {error && (
        <div
          style={{
            background: 'var(--danger-light)',
            color: 'var(--danger)',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '1.5rem',
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="card">
          <h2
            style={{
              fontSize: '1.15rem',
              fontWeight: 600,
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <User size={20} style={{ color: 'var(--primary)' }} />
            <span>Personal Information</span>
          </h2>

          <div className="form-group">
            <label className="form-label" htmlFor="phone-display">
              Phone Number (Account Identity)
            </label>
            <input
              id="phone-display"
              type="text"
              className="input-field"
              value={formatIndianPhone(user?.phone)}
              disabled
              style={{ background: 'var(--bg-color)' }}
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="name-input">
                Full Name
              </label>
              <input
                id="name-input"
                type="text"
                className="input-field"
                placeholder="e.g. John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="age-input">
                Age
              </label>
              <input
                id="age-input"
                type="number"
                className="input-field"
                placeholder="e.g. 72"
                value={age || ''}
                onChange={(e) => setAge(e.target.value ? Number(e.target.value) : undefined)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="gender-select">
                Gender (Optional)
              </label>
              <select
                id="gender-select"
                className="input-field"
                value={gender}
                onChange={(e) => setGender(e.target.value as Gender | '')}
              >
                <option value="">Prefer not to say</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email-input">
              Email Address (Optional)
            </label>
            <input
              id="email-input"
              type="email"
              className="input-field"
              placeholder="e.g. john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="city-input">
                City
              </label>
              <input
                id="city-input"
                type="text"
                className="input-field"
                placeholder="e.g. San Francisco"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="state-input">
                State / Region
              </label>
              <input
                id="state-input"
                type="text"
                className="input-field"
                placeholder="e.g. CA"
                value={state}
                onChange={(e) => setState(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="card">
          <h2
            style={{
              fontSize: '1.15rem',
              fontWeight: 600,
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <Type size={20} style={{ color: 'var(--primary)' }} />
            <span>Accessibility & Readability</span>
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-color)',
              }}
            >
              <div>
                <div style={{ fontWeight: 600 }}>Large Text Display Mode</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Increases interface font size and spacing for easier reading.
                </div>
              </div>
              <button
                type="button"
                className={`btn ${largeTextMode ? 'btn-primary' : 'btn-secondary'}`}
                onClick={toggleLargeTextMode}
              >
                {largeTextMode ? 'Enabled' : 'Disabled'}
              </button>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-color)',
              }}
            >
              <div>
                <div
                  style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <Volume2 size={18} />
                  <span>Voice Assistance Prompts</span>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Enable audio feedback and speech input shortcuts.
                </div>
              </div>
              <button
                type="button"
                className={`btn ${voiceEnabled ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setVoiceEnabled(!voiceEnabled)}
              >
                {voiceEnabled ? 'Enabled' : 'Disabled'}
              </button>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '1rem' }}>
            Preferences & Notifications
          </h2>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="lang-select">
                Preferred Language
              </label>
              <select
                id="lang-select"
                className="input-field"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="hi">Hindi</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="channel-select">
                Preferred Notification Channel
              </label>
              <select
                id="channel-select"
                className="input-field"
                value={notificationChannel}
                onChange={(e) => setNotificationChannel(e.target.value as NotificationChannel)}
              >
                <option value="sms">SMS</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="app">App Notification</option>
                <option value="email">Email</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="ride-select">
                Preferred Ride Type
              </label>
              <select
                id="ride-select"
                className="input-field"
                value={preferredRide}
                onChange={(e) => setPreferredRide(e.target.value as RidePreference)}
              >
                <option value="accessible">Accessible (Wheelchair / Special Assistance)</option>
                <option value="standard">Standard Ride</option>
                <option value="premium">Premium Comfort Ride</option>
              </select>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-large"
          style={{ width: '100%', marginBottom: '2rem' }}
          disabled={loading}
        >
          <Save size={18} />
          <span>{loading ? 'Saving Changes...' : 'Save Profile Settings'}</span>
        </button>
      </form>
    </div>
  );
};
