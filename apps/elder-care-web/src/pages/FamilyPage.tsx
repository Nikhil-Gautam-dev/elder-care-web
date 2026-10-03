import React, { useEffect, useState } from 'react';
import { Users, UserPlus, Copy, Check, Shield, AlertCircle, X, LogOut } from 'lucide-react';
import {
  COUNTRY_CODE,
  PHONE_DIGITS,
  formatIndianPhone,
  type FamilyMemberView,
  type FamilyRelationship,
  type FamilyView,
} from '@eldercare/shared';
import {
  acceptFamilyInvite,
  cancelFamilyInvite,
  createFamilyInvite,
  deleteFamilyAlias,
  getMyFamily,
  listFamilyInvites,
  rejectFamilyInvite,
  removeFamilyMember,
  setFamilyAlias,
  updateFamilyMember,
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import { PhoneInput } from '../components/PhoneInput';

export const FamilyPage: React.FC = () => {
  const { userId } = useAuth();
  const [family, setFamily] = useState<FamilyView | null>(null);
  const [aliasDrafts, setAliasDrafts] = useState<Record<string, string>>({});
  const [isElder, setIsElder] = useState<boolean>(false);
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
      const [familyData, invitesData] = await Promise.all([getMyFamily(), listFamilyInvites()]);
      setFamily(familyData);
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
    if (targetPhone && targetPhone.length !== PHONE_DIGITS) {
      setError(`Phone number must be exactly ${PHONE_DIGITS} digits`);
      return;
    }
    setLoading(true);
    try {
      const res = await createFamilyInvite({
        targetPhone: targetPhone ? `${COUNTRY_CODE}${targetPhone}` : undefined,
        relationship,
        isElder,
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

  const run = async (action: () => Promise<unknown>, done?: string) => {
    setError(null);
    setSuccess(null);
    try {
      await action();
      if (done) setSuccess(done);
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    }
  };

  const handleAddAlias = (member: FamilyMemberView) => {
    const alias = (aliasDrafts[member.userId] ?? '').trim();
    if (!alias) return;
    setAliasDrafts((d) => ({ ...d, [member.userId]: '' }));
    run(() => setFamilyAlias({ targetId: member.userId, alias }));
  };

  const handleLeave = () => {
    if (!userId || !window.confirm('Leave this family? You will need a new invite to rejoin.'))
      return;
    run(() => removeFamilyMember(userId), 'You left the family.');
  };

  const handleRemove = (member: FamilyMemberView) => {
    if (!window.confirm(`Remove ${member.name} from the family?`)) return;
    run(() => removeFamilyMember(member.userId), `${member.name} was removed.`);
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
          <span>{family ? family.name : 'Your family'}</span>
        </h2>

        {!family || family.members.length <= 1 ? (
          <p style={{ color: 'var(--text-secondary)', padding: '1rem 0' }}>
            No family members connected yet. Invite someone below — everyone you invite becomes part
            of one shared family, and they can invite others too.
          </p>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {family.members.map((m) => {
              const iAmAdmin = family.members.some((x) => x.isMe && x.isAdmin);
              return (
                <div
                  key={m.userId}
                  style={{
                    padding: '1rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-color)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '1rem',
                      flexWrap: 'wrap',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '1.05rem' }}>
                        {m.name || 'Family Member'} {m.isMe && '(You)'}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {formatIndianPhone(m.phone)}
                        {!m.isMe && (
                          <>
                            {' '}
                            &bull;{' '}
                            <span style={{ textTransform: 'capitalize' }}>
                              {m.relationship ? `Your ${m.relationship}` : 'Family member'}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {m.isElder && <span className="badge badge-warning">Elder</span>}
                      {m.isAdmin && <span className="badge badge-success">Admin</span>}
                      {m.canManageOrders && <span className="badge badge-success">Orders</span>}
                      {m.canManageRides && <span className="badge badge-success">Rides</span>}
                      {m.canReceiveNotifications && (
                        <span className="badge badge-warning">Alerts</span>
                      )}
                    </div>
                  </div>

                  {!m.isMe && (
                    <div style={{ marginTop: '0.75rem' }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        What you call them (only you see this)
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          gap: '0.5rem',
                          flexWrap: 'wrap',
                          alignItems: 'center',
                          marginTop: '0.35rem',
                        }}
                      >
                        {m.aliases.map((a) => (
                          <span key={a.id} className="badge badge-success">
                            {a.alias}
                            <button
                              type="button"
                              aria-label={`Remove ${a.alias}`}
                              onClick={() => run(() => deleteFamilyAlias(a.id))}
                              style={{
                                marginLeft: '0.35rem',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                              }}
                            >
                              <X size={12} />
                            </button>
                          </span>
                        ))}
                        <input
                          className="input-field"
                          style={{ width: '10rem', padding: '0.3rem 0.5rem' }}
                          placeholder="Add a nickname (Mom, Dadu…)"
                          value={aliasDrafts[m.userId] ?? ''}
                          maxLength={40}
                          onChange={(e) =>
                            setAliasDrafts((d) => ({ ...d, [m.userId]: e.target.value }))
                          }
                          onKeyDown={(e) => e.key === 'Enter' && handleAddAlias(m)}
                        />
                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{ padding: '0.3rem 0.75rem', fontSize: '0.85rem' }}
                          onClick={() => handleAddAlias(m)}
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  )}

                  <div
                    style={{
                      display: 'flex',
                      gap: '0.5rem',
                      flexWrap: 'wrap',
                      marginTop: '0.75rem',
                    }}
                  >
                    {iAmAdmin && (
                      <>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{ padding: '0.25rem 0.6rem', fontSize: '0.8rem' }}
                          onClick={() =>
                            run(() => updateFamilyMember(m.userId, { isElder: !m.isElder }))
                          }
                        >
                          {m.isElder ? 'Not an elder' : 'Mark as elder'}
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{ padding: '0.25rem 0.6rem', fontSize: '0.8rem' }}
                          onClick={() =>
                            run(() => updateFamilyMember(m.userId, { isAdmin: !m.isAdmin }))
                          }
                        >
                          {m.isAdmin ? 'Remove admin' : 'Make admin'}
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{ padding: '0.25rem 0.6rem', fontSize: '0.8rem' }}
                          onClick={() =>
                            run(() =>
                              updateFamilyMember(m.userId, {
                                canReceiveNotifications: !m.canReceiveNotifications,
                              }),
                            )
                          }
                        >
                          {m.canReceiveNotifications ? 'Mute alerts' : 'Enable alerts'}
                        </button>
                      </>
                    )}
                    {m.isMe ? (
                      <button
                        type="button"
                        className="btn btn-danger"
                        style={{ padding: '0.25rem 0.6rem', fontSize: '0.8rem' }}
                        onClick={handleLeave}
                      >
                        <LogOut size={14} /> Leave family
                      </button>
                    ) : (
                      iAmAdmin && (
                        <button
                          type="button"
                          className="btn btn-danger"
                          style={{ padding: '0.25rem 0.6rem', fontSize: '0.8rem' }}
                          onClick={() => handleRemove(m)}
                        >
                          Remove
                        </button>
                      )
                    )}
                  </div>
                </div>
              );
            })}
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
            <span>Invite to your family</span>
          </h2>

          <form onSubmit={handleCreateInvite}>
            <div className="form-group">
              <label className="form-label" htmlFor="target-phone">
                Their Mobile Number (Optional — only they can accept)
              </label>
              <PhoneInput id="target-phone" value={targetPhone} onChange={setTargetPhone} />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="rel-select">
                They are my… (relationship to me)
              </label>
              <select
                id="rel-select"
                className="input-field"
                value={relationship}
                onChange={(e) => setRelationship(e.target.value as FamilyRelationship)}
              >
                <option value="son">Son</option>
                <option value="daughter">Daughter</option>
                <option value="child">Child</option>
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
                  checked={isElder}
                  onChange={(e) => setIsElder(e.target.checked)}
                />
                <span>This person is an elder who needs care</span>
              </label>
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
                      From: {inv.inviterName} ({formatIndianPhone(inv.inviterPhone)})
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
                        Role: {inv.relationship}{' '}
                        {inv.targetPhone ? `(${formatIndianPhone(inv.targetPhone)})` : ''}
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
