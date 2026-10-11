import React, { useState } from 'react';
import { Settings2, X } from 'lucide-react';
import { formatIndianPhone, type FamilyMemberView, type UpdateMemberBody } from '@eldercare/shared';
import { Button, StatusBadge } from '../ui';

/** A change to access or sharing. The page asks for confirmation before running it. */
export interface ManageAction {
  key: string;
  label: string;
  description: string;
  confirmTitle: string;
  confirmBody: string;
  confirmLabel: string;
  destructive?: boolean;
  done: string;
  run: () => Promise<unknown>;
}

interface Props {
  member: FamilyMemberView;
  iAmAdmin: boolean;
  onAction: (a: ManageAction) => void;
  onUpdate: (userId: string, body: UpdateMemberBody) => Promise<unknown>;
  onRemove: (userId: string) => Promise<unknown>;
  onAddAlias: (member: FamilyMemberView, alias: string) => void;
  onDeleteAlias: (aliasId: string) => void;
}

function buildActions(
  m: FamilyMemberView,
  iAmAdmin: boolean,
  update: Props['onUpdate'],
  remove: Props['onRemove'],
): { access: ManageAction[]; leave?: ManageAction } {
  const who = m.isMe ? 'you' : m.name;
  const name = m.isMe ? 'yourself' : m.name;
  const access: ManageAction[] = [];

  if (iAmAdmin) {
    access.push(
      m.isElder
        ? {
            key: 'elder',
            label: `Stop treating ${name} as someone who needs care`,
            description: 'Other members will no longer be able to manage their medicines or rides.',
            confirmTitle: 'No longer needs care?',
            confirmBody: `Family members will lose the ability to manage ${who === 'you' ? 'your' : `${m.name}'s`} medicines and rides through ElderCare.`,
            confirmLabel: 'Yes, change it',
            done: `${m.name} is no longer marked as needing care.`,
            run: () => update(m.userId, { isElder: false }),
          }
        : {
            key: 'elder',
            label: `Mark ${name} as someone who needs care`,
            description:
              'Family members with permission can then help with their medicines and rides.',
            confirmTitle: 'Mark as needing care?',
            confirmBody: `Family members who have permission will be able to manage ${who === 'you' ? 'your' : `${m.name}'s`} medicines and rides.`,
            confirmLabel: 'Yes, mark them',
            done: `${m.name} is now marked as needing care.`,
            run: () => update(m.userId, { isElder: true }),
          },
      m.isAdmin
        ? {
            key: 'admin',
            label: `Remove admin access from ${name}`,
            description: 'Admins can change who is in the family and what everyone can do.',
            confirmTitle: 'Remove admin access?',
            confirmBody: m.isMe
              ? 'You will no longer be able to change who is in the family or what people can do. Another admin would have to give it back.'
              : `${m.name} will no longer be able to change who is in the family or what people can do.`,
            confirmLabel: 'Yes, remove admin',
            destructive: true,
            done: `${m.name} is no longer an admin.`,
            run: () => update(m.userId, { isAdmin: false }),
          }
        : {
            key: 'admin',
            label: `Make ${name} an admin`,
            description: 'Admins can change who is in the family and what everyone can do.',
            confirmTitle: 'Make an admin?',
            confirmBody: `${m.name} will be able to change who is in the family, remove people and change what everyone can do. Only do this for someone you fully trust.`,
            confirmLabel: 'Yes, make admin',
            done: `${m.name} is now an admin.`,
            run: () => update(m.userId, { isAdmin: true }),
          },
      m.canReceiveNotifications
        ? {
            key: 'updates',
            label: `Turn off family updates for ${name}`,
            description: 'They will stop getting messages about rides and care.',
            confirmTitle: 'Turn off updates?',
            confirmBody: `${m.name} will stop receiving family updates and may miss important news.`,
            confirmLabel: 'Yes, turn off',
            done: `Family updates are off for ${m.name}.`,
            run: () => update(m.userId, { canReceiveNotifications: false }),
          }
        : {
            key: 'updates',
            label: `Turn on family updates for ${name}`,
            description: 'They will get messages about rides and care.',
            confirmTitle: 'Turn on updates?',
            confirmBody: `${m.name} will receive family updates, including news about the people they are connected to.`,
            confirmLabel: 'Yes, turn on',
            done: `Family updates are on for ${m.name}.`,
            run: () => update(m.userId, { canReceiveNotifications: true }),
          },
      {
        key: 'orders',
        label: m.canManageOrders
          ? `Stop ${name} ordering medicines for the family`
          : `Let ${name} order medicines for the family`,
        description:
          'This covers adding, changing and ordering medicines for people who need care.',
        confirmTitle: m.canManageOrders ? 'Stop medicine ordering?' : 'Allow medicine ordering?',
        confirmBody: m.canManageOrders
          ? `${m.name} will no longer be able to change or order medicines for others.`
          : `${m.name} will be able to change and order medicines for people who need care.`,
        confirmLabel: 'Yes, change it',
        done: `Medicine ordering ${m.canManageOrders ? 'turned off' : 'turned on'} for ${m.name}.`,
        run: () => update(m.userId, { canManageOrders: !m.canManageOrders }),
      },
      {
        key: 'rides',
        label: m.canManageRides
          ? `Stop ${name} booking rides for the family`
          : `Let ${name} book rides for the family`,
        description: 'This covers booking and cancelling rides for people who need care.',
        confirmTitle: m.canManageRides ? 'Stop ride booking?' : 'Allow ride booking?',
        confirmBody: m.canManageRides
          ? `${m.name} will no longer be able to book or cancel rides for others.`
          : `${m.name} will be able to book and cancel rides for people who need care.`,
        confirmLabel: 'Yes, change it',
        done: `Ride booking ${m.canManageRides ? 'turned off' : 'turned on'} for ${m.name}.`,
        run: () => update(m.userId, { canManageRides: !m.canManageRides }),
      },
    );
  }

  let leave: ManageAction | undefined;
  if (m.isMe) {
    leave = {
      key: 'leave',
      label: 'Leave this family',
      description: 'You will need a new invite to come back.',
      confirmTitle: 'Leave this family?',
      confirmBody:
        'You will stop seeing the family’s care information and updates. To rejoin, someone has to invite you again.',
      confirmLabel: 'Yes, leave',
      destructive: true,
      done: 'You left the family.',
      run: () => remove(m.userId),
    };
  } else if (iAmAdmin) {
    leave = {
      key: 'remove',
      label: `Remove ${m.name} from the family`,
      description: 'They will lose access. They can only come back with a new invite.',
      confirmTitle: `Remove ${m.name}?`,
      confirmBody: `${m.name} will lose access to the family’s care information and updates. They can only rejoin with a new invite.`,
      confirmLabel: 'Yes, remove',
      destructive: true,
      done: `${m.name} was removed.`,
      run: () => remove(m.userId),
    };
  }
  return { access, leave };
}

export const FamilyMemberCard: React.FC<Props> = ({
  member: m,
  iAmAdmin,
  onAction,
  onUpdate,
  onRemove,
  onAddAlias,
  onDeleteAlias,
}) => {
  const [open, setOpen] = useState(false);
  const [alias, setAlias] = useState('');
  const { access, leave } = buildActions(m, iAmAdmin, onUpdate, onRemove);
  const canManage = access.length > 0 || !!leave;
  const panelId = `manage-${m.userId}`;

  const relation = m.isMe ? 'You' : m.relationship ? `Your ${m.relationship}` : 'Family member';

  const submitAlias = () => {
    const a = alias.trim();
    if (!a) return;
    setAlias('');
    onAddAlias(m, a);
  };

  return (
    <article className="member-card" aria-label={m.name}>
      <div className="med-card-head">
        <div>
          <h3 className="med-name">
            {m.name || 'Family member'}
            {m.isMe && ' (you)'}
          </h3>
          <p className="med-summary">
            {relation}
            {m.aliases.length > 0 && !m.isMe && (
              <> · you call them {m.aliases.map((a) => a.alias).join(', ')}</>
            )}
          </p>
          <p className="med-meta">{formatIndianPhone(m.phone)}</p>
        </div>
        <div className="med-badges">
          {m.isElder && <StatusBadge status="info">Needs care</StatusBadge>}
          {m.isAdmin && <StatusBadge status="neutral">Family admin</StatusBadge>}
        </div>
      </div>

      <ul className="member-perms" aria-label={`What ${m.isMe ? 'you' : m.name} can do`}>
        <li>{m.canReceiveNotifications ? 'Gets family updates' : 'Family updates are off'}</li>
        {m.canManageOrders && <li>Can order medicines</li>}
        {m.canManageRides && <li>Can book rides</li>}
      </ul>

      {!m.isMe && (
        <details className="member-nicknames">
          <summary>Nicknames only you see</summary>
          <div className="nick-row">
            {m.aliases.map((a) => (
              <span key={a.id} className="badge badge-info">
                {a.alias}
                <button
                  type="button"
                  className="icon-btn"
                  aria-label={`Remove nickname ${a.alias}`}
                  onClick={() => onDeleteAlias(a.id)}
                >
                  <X size={14} aria-hidden="true" />
                </button>
              </span>
            ))}
          </div>
          <div className="nick-row">
            <label className="sr-only" htmlFor={`alias-${m.userId}`}>
              Add a nickname for {m.name}
            </label>
            <input
              id={`alias-${m.userId}`}
              className="input-field"
              style={{ flex: '1 1 12rem' }}
              placeholder="e.g. Mom, Dadu"
              value={alias}
              maxLength={40}
              onChange={(e) => setAlias(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  submitAlias();
                }
              }}
            />
            <Button variant="secondary" onClick={submitAlias} disabled={!alias.trim()}>
              Add nickname
            </Button>
          </div>
        </details>
      )}

      {canManage && (
        <div style={{ marginTop: 'var(--space-4)' }}>
          <Button
            variant="secondary"
            size="small"
            aria-expanded={open}
            aria-controls={panelId}
            onClick={() => setOpen((o) => !o)}
          >
            <Settings2 size={18} aria-hidden="true" /> Manage access
            <span className="sr-only"> for {m.isMe ? 'yourself' : m.name}</span>
          </Button>

          {open && (
            <div id={panelId} className="manage-panel">
              {access.map((a) => (
                <div key={a.key} className="manage-row">
                  <div>
                    <strong>{a.label}</strong>
                    <p className="med-meta">{a.description}</p>
                  </div>
                  <Button
                    variant={a.destructive ? 'danger' : 'secondary'}
                    size="small"
                    onClick={() => {
                      setOpen(false);
                      onAction(a);
                    }}
                  >
                    Change
                    <span className="sr-only">: {a.label}</span>
                  </Button>
                </div>
              ))}
              {leave && (
                <div className="manage-row danger-zone">
                  <div>
                    <strong>{leave.label}</strong>
                    <p className="med-meta">{leave.description}</p>
                  </div>
                  <Button
                    variant="danger"
                    size="small"
                    onClick={() => {
                      setOpen(false);
                      onAction(leave);
                    }}
                  >
                    {m.isMe ? 'Leave' : 'Remove'}
                    <span className="sr-only">: {leave.label}</span>
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </article>
  );
};
