import React, { useCallback, useEffect, useState } from 'react';
import { Check, Copy } from 'lucide-react';
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
  listNotifications,
  rejectFamilyInvite,
  removeFamilyMember,
  setFamilyAlias,
  updateFamilyMember,
  type NotificationRecord,
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import { PhoneInput } from '../components/PhoneInput';
import {
  Button,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  FormField,
  Notice,
  PageHeader,
  StatusBadge,
  type Status,
} from '../components/ui';
import { FamilyMemberCard, type ManageAction } from '../components/family/FamilyMemberCard';

interface SentInvite {
  _id: string;
  token: string;
  relationship: string;
  targetPhone?: string;
  status: string;
}

interface ReceivedInvite {
  _id: string;
  token: string;
  inviterName: string;
  inviterPhone: string;
  relationship: string;
}

const INVITE_STATUS: Record<string, { text: string; status: Status }> = {
  pending: { text: 'Waiting for a reply', status: 'pending' },
  accepted: { text: 'Joined', status: 'success' },
  rejected: { text: 'Declined', status: 'danger' },
  cancelled: { text: 'Cancelled', status: 'cancelled' },
  expired: { text: 'Expired', status: 'cancelled' },
};

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString([], {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });

export const FamilyPage: React.FC = () => {
  const { userId } = useAuth();
  const [family, setFamily] = useState<FamilyView | null>(null);
  const [sentInvites, setSentInvites] = useState<SentInvite[]>([]);
  const [receivedInvites, setReceivedInvites] = useState<ReceivedInvite[]>([]);
  const [updates, setUpdates] = useState<NotificationRecord[] | null>(null);
  const [updatesError, setUpdatesError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [isElder, setIsElder] = useState(false);
  const [targetPhone, setTargetPhone] = useState('');
  const [relationship, setRelationship] = useState<FamilyRelationship>('caregiver');
  const [canReceiveNotifications, setCanReceiveNotifications] = useState(true);
  const [canManageOrders, setCanManageOrders] = useState(true);
  const [canManageRides, setCanManageRides] = useState(true);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const [createdCode, setCreatedCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [acceptToken, setAcceptToken] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [pending, setPending] = useState<ManageAction | null>(null);

  const loadData = useCallback(async () => {
    if (!userId) return;
    try {
      const [familyData, invitesData] = await Promise.all([getMyFamily(), listFamilyInvites()]);
      setFamily(familyData);
      setSentInvites(invitesData.sent ?? []);
      setReceivedInvites(invitesData.received ?? []);
      setLoadError(null);
    } catch (err) {
      setLoadError((err as Error).message || 'Failed to load family data');
    } finally {
      setLoading(false);
    }
    // Updates are optional: the rest of the page works if this fails.
    listNotifications()
      .then((items) => {
        setUpdates(items);
        setUpdatesError(false);
      })
      .catch(() => setUpdatesError(true));
  }, [userId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const run = async (action: () => Promise<unknown>, done?: string): Promise<boolean> => {
    setError(null);
    setSuccess(null);
    try {
      await action();
      if (done) setSuccess(done);
      await loadData();
      return true;
    } catch (err) {
      setError((err as Error).message || 'Something went wrong');
      return false;
    }
  };

  const confirmPending = async () => {
    if (!pending) return;
    setBusy(true);
    await run(pending.run, pending.done);
    setBusy(false);
    setPending(null);
  };

  const handleCreateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (targetPhone && targetPhone.length !== PHONE_DIGITS) {
      setPhoneError(`A phone number has exactly ${PHONE_DIGITS} digits. Please check it.`);
      return;
    }
    setPhoneError(null);
    setBusy(true);
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
      setSuccess('Invite created. Share the code below with them.');
      setTargetPhone('');
      await loadData();
    } catch (err) {
      setError((err as Error).message || 'Could not create the invite');
    } finally {
      setBusy(false);
    }
  };

  const handleAccept = async (token: string) => {
    setBusy(true);
    const ok = await run(async () => {
      const res = await acceptFamilyInvite(token);
      setSuccess(res.message || 'Invite accepted.');
    });
    if (ok) setAcceptToken('');
    setBusy(false);
  };

  const handleCopy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Could not copy automatically. Please select the code and copy it.');
    }
  };

  const iAmAdmin = !!family?.members.some((x) => x.isMe && x.isAdmin);
  const others = family?.members.filter((x) => !x.isMe) ?? [];
  const hasFamily = !!family && family.members.length > 1;
  const recipients = others.filter((x) => x.canReceiveNotifications).map((x) => x.name);

  const addAlias = (member: FamilyMemberView, alias: string) =>
    void run(
      () => setFamilyAlias({ targetId: member.userId, alias }),
      `Saved: you call ${member.name} “${alias}”.`,
    );

  return (
    <div>
      <PageHeader
        title="My family"
        subtitle="The people who help look after you, and what they can see and do."
      />

      {error && <Notice kind="error">{error}</Notice>}
      {success && <Notice kind="success">{success}</Notice>}

      {receivedInvites.length > 0 && (
        <section
          className="card"
          aria-labelledby="invites-for-me"
          style={{ borderColor: 'var(--primary)' }}
        >
          <h2 id="invites-for-me" className="section-title">
            Someone invited you
          </h2>
          <div className="med-list">
            {receivedInvites.map((inv) => (
              <article key={inv._id} className="member-card">
                <h3 className="med-name">{inv.inviterName}</h3>
                <p className="med-meta">
                  {formatIndianPhone(inv.inviterPhone)} · wants to add you as their{' '}
                  {inv.relationship}
                </p>
                <div className="med-actions">
                  <Button onClick={() => void handleAccept(inv.token)} disabled={busy}>
                    Accept invite
                  </Button>
                  <Button
                    variant="secondary"
                    disabled={busy}
                    onClick={() =>
                      void run(() => rejectFamilyInvite(inv.token), 'Invite declined.')
                    }
                  >
                    Decline
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {loadError ? (
        <ErrorState
          title="We couldn't load your family"
          message={loadError}
          onRetry={() => void loadData()}
        />
      ) : loading ? (
        <div className="card" role="status">
          Loading your family…
        </div>
      ) : (
        <>
          <section className="card" aria-labelledby="family-title">
            <h2 id="family-title" className="section-title">
              {family ? family.name : 'Your family'}
            </h2>
            {!hasFamily ? (
              <EmptyState
                title="No family members yet"
                description="Invite someone below. Everyone you invite joins one shared family, and they can invite others too."
              />
            ) : (
              <div className="med-list">
                {family!.members.map((m) => (
                  <FamilyMemberCard
                    key={m.userId}
                    member={m}
                    iAmAdmin={iAmAdmin}
                    onAction={setPending}
                    onUpdate={updateFamilyMember}
                    onRemove={removeFamilyMember}
                    onAddAlias={addAlias}
                    onDeleteAlias={(id) => void run(() => deleteFamilyAlias(id))}
                  />
                ))}
              </div>
            )}
          </section>

          <section className="card" aria-labelledby="updates-title">
            <h2 id="updates-title" className="section-title">
              Recent family updates
            </h2>
            {hasFamily && (
              <p className="form-hint" style={{ marginBottom: 'var(--space-3)' }}>
                {recipients.length > 0
                  ? `When ElderCare sends a family update, for example a message you ask it to send, it goes to: ${recipients.join(', ')}.`
                  : 'Family updates are turned off for everyone else right now.'}
              </p>
            )}
            {updatesError ? (
              <ErrorState
                title="We couldn't load updates"
                message="Please try again in a moment."
                onRetry={() => void loadData()}
              />
            ) : updates === null ? (
              <p role="status">Checking for updates…</p>
            ) : updates.length === 0 ? (
              <EmptyState
                title="No updates yet"
                description="Messages from your family and from ElderCare will appear here."
              />
            ) : (
              <>
                <ul style={{ listStyle: 'none' }}>
                  {updates.map((n) => (
                    <li key={n._id} className="update-item">
                      <div className="update-head">
                        <span>From {n.senderName}</span>
                        <time dateTime={n.createdAt}>{formatDateTime(n.createdAt)}</time>
                      </div>
                      <p>{n.message}</p>
                      <StatusBadge status={n.read ? 'success' : 'info'}>
                        {n.read ? 'Opened' : 'Sent'}
                      </StatusBadge>
                    </li>
                  ))}
                </ul>
                <p className="form-hint">
                  These are messages that were sent to you. They don’t show how anyone is doing.
                </p>
              </>
            )}
          </section>

          <div className="grid-2">
            <section className="card" aria-labelledby="invite-title">
              <h2 id="invite-title" className="section-title">
                Invite someone
              </h2>
              <form onSubmit={handleCreateInvite}>
                <FormField
                  label="Their mobile number"
                  optional
                  hint="If you add it, only they can accept the invite."
                  error={phoneError}
                >
                  {(a) => (
                    <PhoneInput
                      id={a.id}
                      value={targetPhone}
                      onChange={(v) => {
                        setTargetPhone(v);
                        setPhoneError(null);
                      }}
                    />
                  )}
                </FormField>

                <FormField label="They are my…">
                  {(a) => (
                    <select
                      {...a}
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
                  )}
                </FormField>

                <fieldset className="form-group" style={{ border: 0 }}>
                  <legend className="form-label">What can they do?</legend>
                  <label className="checkbox-row">
                    <input
                      type="checkbox"
                      checked={isElder}
                      onChange={(e) => setIsElder(e.target.checked)}
                    />
                    <span>This person is someone who needs care</span>
                  </label>
                  <label className="checkbox-row">
                    <input
                      type="checkbox"
                      checked={canManageOrders}
                      onChange={(e) => setCanManageOrders(e.target.checked)}
                    />
                    <span>Can order medicines</span>
                  </label>
                  <label className="checkbox-row">
                    <input
                      type="checkbox"
                      checked={canManageRides}
                      onChange={(e) => setCanManageRides(e.target.checked)}
                    />
                    <span>Can book rides</span>
                  </label>
                  <label className="checkbox-row">
                    <input
                      type="checkbox"
                      checked={canReceiveNotifications}
                      onChange={(e) => setCanReceiveNotifications(e.target.checked)}
                    />
                    <span>Gets family updates</span>
                  </label>
                </fieldset>

                <Button type="submit" block disabled={busy}>
                  {busy ? 'Creating invite…' : 'Create invite code'}
                </Button>
              </form>

              {createdCode && (
                <div className="invite-code">
                  <strong>Invite code</strong>
                  <code>{createdCode}</code>
                  <Button
                    variant="secondary"
                    size="small"
                    onClick={() => void handleCopy(createdCode)}
                  >
                    {copied ? (
                      <Check size={16} aria-hidden="true" />
                    ) : (
                      <Copy size={16} aria-hidden="true" />
                    )}
                    {copied ? 'Copied' : 'Copy code'}
                  </Button>
                </div>
              )}
            </section>

            <section className="card" aria-labelledby="join-title">
              <h2 id="join-title" className="section-title">
                Join with a code
              </h2>
              <FormField label="Invite code" hint="Paste the code someone gave you.">
                {(a) => (
                  <input
                    {...a}
                    type="text"
                    className="input-field"
                    value={acceptToken}
                    onChange={(e) => setAcceptToken(e.target.value)}
                  />
                )}
              </FormField>
              <Button
                block
                onClick={() => void handleAccept(acceptToken.trim())}
                disabled={busy || !acceptToken.trim()}
              >
                Join family
              </Button>

              {sentInvites.length > 0 && (
                <div style={{ marginTop: 'var(--space-6)' }}>
                  <h3 className="form-section" style={{ marginTop: 0 }}>
                    Invites you sent
                  </h3>
                  <ul style={{ listStyle: 'none' }}>
                    {sentInvites.map((inv) => {
                      const s = INVITE_STATUS[inv.status] ?? {
                        text: inv.status,
                        status: 'neutral' as Status,
                      };
                      return (
                        <li key={inv._id} className="update-item">
                          <div className="update-head">
                            <span>
                              Invited as {inv.relationship}
                              {inv.targetPhone ? ` · ${formatIndianPhone(inv.targetPhone)}` : ''}
                            </span>
                            <StatusBadge status={s.status}>{s.text}</StatusBadge>
                          </div>
                          {inv.status === 'pending' && (
                            <Button
                              variant="secondary"
                              size="small"
                              style={{ marginTop: 'var(--space-2)' }}
                              onClick={() =>
                                void run(() => cancelFamilyInvite(inv.token), 'Invite cancelled.')
                              }
                            >
                              Cancel this invite
                            </Button>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </section>
          </div>
        </>
      )}

      <ConfirmDialog
        open={!!pending}
        title={pending?.confirmTitle ?? ''}
        confirmLabel={pending?.confirmLabel ?? 'Yes'}
        destructive={pending?.destructive}
        busy={busy}
        onConfirm={() => void confirmPending()}
        onCancel={() => setPending(null)}
      >
        {pending?.confirmBody}
      </ConfirmDialog>
    </div>
  );
};
