import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Lock, ArrowRight, HeartHandshake } from 'lucide-react';
import { sendOtp, verifyOtp } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState<string>('');
  const [otp, setOtp] = useState<string>('');
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const { setAuthData } = useAuth();
  const navigate = useNavigate();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;
    setError(null);
    setLoading(true);
    try {
      const res = await sendOtp(phone.trim());
      if (res.otp) {
        setDevOtpHint(res.otp);
      }
      setStep('otp');
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) return;
    setError(null);
    setLoading(true);
    try {
      const res = await verifyOtp(phone.trim(), otp.trim());
      await setAuthData(res.token, res.user.id);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '440px', margin: '4rem auto', width: '100%' }}>
      <div className="card" style={{ textAlign: 'center', padding: '2.5rem 2rem' }}>
        <div
          style={{
            width: '64px',
            height: '64px',
            background: 'var(--primary-light)',
            color: 'var(--primary)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem auto',
          }}
        >
          <HeartHandshake size={36} />
        </div>

        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          Welcome to ElderCare
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          {step === 'phone'
            ? 'Sign in or register with your phone number'
            : `Enter the 6-digit code sent to ${phone}`}
        </p>

        {error && (
          <div
            style={{
              background: 'var(--danger-light)',
              color: 'var(--danger)',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '1.5rem',
              textAlign: 'left',
              fontSize: '0.95rem',
            }}
          >
            {error}
          </div>
        )}

        {devOtpHint && step === 'otp' && (
          <div
            style={{
              background: 'var(--warning-light)',
              color: 'var(--warning)',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '1.5rem',
              textAlign: 'left',
              fontSize: '0.95rem',
            }}
          >
            Dev OTP Code: <strong>{devOtpHint}</strong>
          </div>
        )}

        {step === 'phone' ? (
          <form onSubmit={handleSendOtp}>
            <div className="form-group" style={{ textAlign: 'left' }}>
              <label className="form-label" htmlFor="phone-input">
                Phone Number
              </label>
              <div style={{ position: 'relative' }}>
                <Phone
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                  }}
                />
                <input
                  id="phone-input"
                  type="tel"
                  className="input-field"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-large"
              style={{ width: '100%', marginTop: '1rem' }}
              disabled={loading}
            >
              <span>{loading ? 'Sending Code...' : 'Get Verification Code'}</span>
              <ArrowRight size={18} />
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp}>
            <div className="form-group" style={{ textAlign: 'left' }}>
              <label className="form-label" htmlFor="otp-input">
                Verification OTP Code
              </label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                  }}
                />
                <input
                  id="otp-input"
                  type="text"
                  className="input-field"
                  style={{ paddingLeft: '2.5rem', letterSpacing: '4px', fontWeight: 600 }}
                  placeholder="123456"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-large"
              style={{ width: '100%', marginTop: '1rem' }}
              disabled={loading}
            >
              <span>{loading ? 'Verifying...' : 'Verify & Continue'}</span>
              <ArrowRight size={18} />
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              style={{ width: '100%', marginTop: '0.75rem' }}
              onClick={() => setStep('phone')}
            >
              Change Phone Number
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
