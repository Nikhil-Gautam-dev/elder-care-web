import React, { useState } from 'react';
import { BellRing, PackageCheck, Pill, ShieldCheck } from 'lucide-react';
import { login, setToken } from '../api';
import { saveUser } from '../session';
import { Button, Field } from '../components/ui';

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
      const { token, pharmacist } = await login(username.trim(), password);
      setToken(token);
      saveUser(pharmacist?.name || username.trim());
      onSignedIn();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth">
      <section className="auth-brand">
        <div className="row" style={{ gap: 12 }}>
          <span className="sb-logo">
            <Pill size={20} />
          </span>
          <strong style={{ fontSize: '1.1rem' }}>ElderCare Pharmacy</strong>
        </div>
        <div>
          <h2>Fulfil every prescription, on time.</h2>
          <p>
            Receive medicine orders from families and care assistants, manage stock and deliver with
            cash on delivery, all from one console.
          </p>
          <div className="auth-points">
            <div>
              <span className="ico">
                <BellRing size={17} />
              </span>
              Live order feed with instant new-order alerts
            </div>
            <div>
              <span className="ico">
                <PackageCheck size={17} />
              </span>
              Accept, pack and dispatch in a few clicks
            </div>
            <div>
              <span className="ico">
                <ShieldCheck size={17} />
              </span>
              Stock reserved automatically when an order is placed
            </div>
          </div>
        </div>
        <div className="sb-sub">© ElderCare Pharmacy Partner Portal</div>
      </section>

      <section className="auth-form">
        <form onSubmit={submit}>
          <h1>Sign in</h1>
          <p className="muted">Pharmacist access to the order console.</p>
          {error && <div className="notice">{error}</div>}
          <Field label="Username" htmlFor="username">
            <input
              id="username"
              className="input"
              autoFocus
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </Field>
          <Field label="Password" htmlFor="password">
            <input
              id="password"
              type="password"
              className="input"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Field>
          <Button type="submit" className="btn-block" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
      </section>
    </div>
  );
};
