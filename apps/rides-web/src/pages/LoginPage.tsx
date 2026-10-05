import React, { useState } from 'react';
import { Car } from 'lucide-react';
import { login, setToken } from '../api';

export const LoginPage: React.FC<{ onSignedIn: () => void }> = ({ onSignedIn }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { token } = await login(username.trim(), password);
      setToken(token);
      onSignedIn();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login">
      <div className="card">
        <div className="brand" style={{ marginBottom: '1.25rem' }}>
          <Car size={26} />
          <span>ElderCare Rides</span>
        </div>
        <p className="muted" style={{ marginBottom: '1.25rem' }}>
          Dispatcher sign in
        </p>
        {error && <div className="error">{error}</div>}
        <form onSubmit={submit} className="grid">
          <div>
            <label className="label" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              className="input"
              autoFocus
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="input"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
};
