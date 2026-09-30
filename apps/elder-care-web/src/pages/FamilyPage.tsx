import React, { useEffect, useState } from 'react';
import { Users, UserPlus, Copy, Check, Shield, AlertCircle } from 'lucide-react';
import type { FamilyRelationship } from '@eldercare/shared';
import {
  acceptFamilyInvite,
  cancelFamilyInvite,
  createFamilyInvite,
  getFamilyMembers,
  listFamilyInvites,
  rejectFamilyInvite,
} from '../services/api';
import { useAuth } from '../context/AuthContext';

export const FamilyPage: React.FC = () => {
  const { userId } = useAuth();
  const [members, setMembers] = useState<any[]>([]);
  const [sentInvites, setSentInvites] = useState<any[]>([]);
  const [receivedInvites, setReceivedInvites] = useState<any[]>([]);

  const [targetPhone, setTargetPhone] = useState<string>('');
  const [relationship, setRelationship] = useState<FamilyRelationship>('caregiver');
  const [canReceiveNotifications, setCanReceiveNotifications] = useState<boolean>(true);
  const [canManageOrders, setCanManageOrders] = useState<boolean>(true);
  const [canManageRides, setCanManageRides] = useState<boolean>(true);

  const [createdCode, setCreatedCode] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [acceptTokenInput, setAcceptTokenInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadData = async () => {
    if (!userId) return;
    try {
      const [membersData, invitesData] = await Promise.all([
        getFamilyMembers(userId),
        listFamilyInvites(),
      ]);
      setMembers(membersData);
      setSentInvites(invitesData.sent || []);
      setReceivedInvites(invitesData.received || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load family data');
    }
  };

  useEffect(() => {
    loadData();
  }, [userId]);

  const handleCreateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const res = await createFamilyInvite({
        targetPhone: targetPhone.trim() || undefined,
        relationship,
        canReceiveNotifications,
        canManageOrders,
        canManageRides,
      });
      setCreatedCode(res.inviteCode);
      setSuccess('Family invite created successfully!');
      setTargetPhone('');
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to create invite');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvite = async (token: string) => {
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const res = await acceptFamilyInvite(token);
      setSuccess(res.message || 'Invite accepted successfully!');
      setAcceptTokenInput('');
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to accept invite');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectInvite = async (token: string) => {
    try {
      await rejectFamilyInvite(token);
      setSuccess('Invite rejected.');
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to reject invite');
    }
  };

  const handleCancelInvite = async (token: string) => {
    try {
      await cancelFamilyInvite(token);
      setSuccess('Invite cancelled.');
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to cancel invite');
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Family & Caregivers</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Manage your trusted family members and caregivers who assist with your care.
        </p>
      </div>

      {error && (
        <div
          style={{
            background: 'var(--danger-light)',
            color: 'var(--danger)',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div
          style={{
            background: 'var(--success-light)',
            color: 'var(--success)',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '1.5rem',
          }}
        >
          {success}
        </div>
      )}

      <div className="card">
        <h2
          style={{
            fontSize: '1.25rem',
            fontWeight: 600,
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Users size={20} style={{ color: 'var(--primary)' }} />
          <span>Connected Family Members ({members.length})</span>
        </h2>

        {members.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', padding: '1rem 0' }}>
            No family members connected yet. Invite a family member below!
          </p>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {members.map((m: any) => (
              <div
                key={m.userId}
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
                  <div style={{ fontWeight: 600, fontSize: '1.05rem' }}>
                    {m.user?.name || 'Family Member'}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {m.user?.phone} &bull;{' '}
                    <span style={{ textTransform: 'capitalize' }}>{m.relationship}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {m.canManageOrders && <span className="badge badge-success">Orders</span>}
                  {m.canManageRides && <span className="badge badge-success">Rides</span>}
                  {m.canReceiveNotifications && <span className="badge badge-warning">Alerts</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid-2">
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
            <UserPlus size={20} style={{ color: 'var(--primary)' }} />
            <span>Invite a Caregiver</span>
          </h2>

          <form onSubmit={handleCreateInvite}>
            <div className="form-group">
              <label className="form-label" htmlFor="target-phone">
                Target Phone Number (Optional)
              </label>
              <input
                id="target-phone"
                type="tel"
                className="input-field"
                placeholder="e.g. +1 (555) 123-4567"
                value={targetPhone}
                onChange={(e) => setTargetPhone(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="rel-select">
                Relationship
              </label>
              <select
                id="rel-select"
                className="input-field"
                value={relationship}
                onChange={(e) => setRelationship(e.target.value as FamilyRelationship)}
              >
                <option value="son">Son</option>
                <option value="daughter">Daughter</option>
                <option value="spouse">Spouse</option>
                <option value="parent">Parent</option>
                <option value="sibling">Sibling</option>
                <option value="caregiver">Caregiver</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div
              className="form-group"
              style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
            >
              <label className="form-label">Permissions</label>
              <label
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
              >
                <input
                  type="checkbox"
                  checked={canManageOrders}
                  onChange={(e) => setCanManageOrders(e.target.checked)}
                />
                <span>Can Manage Medicine Orders</span>
              </label>
              <label
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
              >
                <input
                  type="checkbox"
                  checked={canManageRides}
                  onChange={(e) => setCanManageRides(e.target.checked)}
                />
                <span>Can Manage Rides</span>
              </label>
              <label
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
              >
                <input
                  type="checkbox"
                  checked={canReceiveNotifications}
                  onChange={(e) => setCanReceiveNotifications(e.target.checked)}
                />
                <span>Can Receive Notifications</span>
              </label>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%' }}
              disabled={loading}
            >
              {loading ? 'Creating Invite...' : 'Generate Invite Link'}
            </button>
          </form>

          {createdCode && (
            <div
              style={{
                marginTop: '1.25rem',
                padding: '1rem',
                background: 'var(--primary-light)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--primary)',
              }}
            >
              <div style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600 }}>
                Invite Token Code
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: '0.5rem',
                }}
              >
                <code
                  style={{
                    fontSize: '0.9rem',
                    wordBreak: 'break-all',
                    background: '#fff',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                  }}
                >
                  {createdCode}
                </code>
                <button
                  type="button"
                  onClick={() => handleCopyCode(createdCode)}
                  className="btn btn-secondary"
                  style={{ padding: '0.4rem 0.75rem' }}
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
            </div>
          )}
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
            <Shield size={20} style={{ color: 'var(--primary)' }} />
            <span>Accept an Invite Code</span>
          </h2>

          <div className="form-group">
            <label className="form-label" htmlFor="accept-code">
              Enter Invite Token Code
            </label>
            <input
              id="accept-code"
              type="text"
              className="input-field"
              placeholder="Paste invite token here..."
              value={acceptTokenInput}
              onChange={(e) => setAcceptTokenInput(e.target.value)}
            />
          </div>

          <button
            type="button"
            className="btn btn-primary"
            style={{ width: '100%', marginBottom: '1.5rem' }}
            onClick={() => handleAcceptInvite(acceptTokenInput.trim())}
            disabled={loading || !acceptTokenInput.trim()}
          >
            Accept Invite
          </button>

          {receivedInvites.length > 0 && (
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>
                Pending Invites for You
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {receivedInvites.map((inv: any) => (
                  <div
                    key={inv._id}
                    style={{
                      padding: '0.75rem',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    <div style={{ fontWeight: 600 }}>
                      From: {inv.inviterName} ({inv.inviterPhone})
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      Relationship: {inv.relationship}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                      <button
                        type="button"
                        className="btn btn-primary"
                        style={{ padding: '0.3rem 0.75rem', fontSize: '0.85rem' }}
                        onClick={() => handleAcceptInvite(inv.token)}
                      >
                        Accept
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger"
                        style={{ padding: '0.3rem 0.75rem', fontSize: '0.85rem' }}
                        onClick={() => handleRejectInvite(inv.token)}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {sentInvites.length > 0 && (
            <div style={{ marginTop: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>
                Sent Invites History
              </h3>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  maxHeight: '200px',
                  overflowY: 'auto',
                }}
              >
                {sentInvites.map((inv: any) => (
                  <div
                    key={inv._id}
                    style={{
                      padding: '0.5rem 0.75rem',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.85rem',
                    }}
                  >
                    <div>
                      <div>
                        Role: {inv.relationship} {inv.targetPhone ? `(${inv.targetPhone})` : ''}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Status: {inv.status}
                      </div>
                    </div>
                    {inv.status === 'pending' && (
                      <button
                        type="button"
                        className="btn btn-danger"
                        style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                        onClick={() => handleCancelInvite(inv.token)}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
