import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { MoreHorizontal, Package, Pencil, Undo2, Ban } from 'lucide-react';
import type { IMedicationView } from '@eldercare/shared';
import { Button, StatusBadge, type Status } from '../ui';
import { countWithUnit, type DoseState } from '../../utils/careStatus';

interface Props {
  med: IMedicationView;
  state: DoseState;
  canManage: boolean;
  busy: boolean;
  canUndo: boolean;
  onTake: () => void;
  onUndo: () => void;
  onEdit: () => void;
  onStop: () => void;
}

const BADGE: (s: DoseState) => { status: Status; text: string } | null = (s) => {
  switch (s.kind) {
    case 'due':
      return { status: 'warning', text: 'Due now' };
    case 'taken':
      return { status: 'success', text: 'Recorded as taken today' };
    case 'upcoming':
      return { status: 'info', text: `Upcoming: ${s.next}` };
    case 'asNeeded':
      return { status: 'neutral', text: 'Only when needed' };
    default:
      return null;
  }
};

/** Supply is described in days only when the schedule makes that estimate meaningful. */
const supplyText = (m: IMedicationView) => {
  const { daysLeft, unitsLeft } = m.supplyStatus;
  const unit = m.dose.unit;
  if (unitsLeft <= 0) return 'None left';
  if (daysLeft === null) return `${countWithUnit(unitsLeft, unit)} left`;
  return `About ${daysLeft} day${daysLeft === 1 ? '' : 's'} of supply left (${countWithUnit(unitsLeft, unit)})`;
};

export const MedicineCard: React.FC<Props> = ({
  med,
  state,
  canManage,
  busy,
  canUndo,
  onTake,
  onUndo,
  onEdit,
  onStop,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  const stopped = !med.active;
  const badge = stopped ? null : BADGE(state);
  const noStock = med.supplyStatus.unitsLeft < med.dose.amount;
  const due = state.kind === 'due';
  const needsRefill = !stopped && med.supplyStatus.needsRefill;
  const orderHref = `/assistant?ask=${encodeURIComponent(`Order more ${med.name}`)}`;

  return (
    <article className="med-card" aria-label={`${med.name} ${med.strength}`}>
      <div className="med-card-head">
        <div>
          <h3 className="med-name">
            {med.name} {med.strength}
          </h3>
          <p className="med-summary">{med.summary}</p>
          {(med.genericName || med.prescribedBy) && (
            <p className="med-meta">
              {[
                med.genericName,
                med.prescribedBy && `Dr. ${med.prescribedBy.replace(/^dr\.?\s*/i, '')}`,
              ]
                .filter(Boolean)
                .join(' · ')}
            </p>
          )}
        </div>
        <div className="med-badges">
          {stopped ? (
            <StatusBadge status="cancelled">Stopped</StatusBadge>
          ) : (
            badge && <StatusBadge status={badge.status}>{badge.text}</StatusBadge>
          )}
        </div>
      </div>

      {!stopped && (
        <p className={`med-supply ${needsRefill ? 'low' : ''}`}>
          <Package size={16} aria-hidden="true" style={{ flexShrink: 0 }} />
          <span>
            {supplyText(med)}
            {needsRefill && <strong> · Running low</strong>}
          </span>
        </p>
      )}

      {canManage && !stopped && (
        <div className="med-actions">
          {/* One main action per card, chosen from what matters right now. */}
          {state.kind === 'taken' && canUndo ? (
            <Button variant="secondary" onClick={onUndo} disabled={busy}>
              <Undo2 size={18} aria-hidden="true" /> Undo last record
            </Button>
          ) : (
            <Button
              variant={due || (!needsRefill && state.kind !== 'taken') ? 'primary' : 'secondary'}
              onClick={onTake}
              disabled={busy || noStock}
              title={noStock ? 'Not enough left to record a dose' : undefined}
            >
              Mark as taken
            </Button>
          )}
          {needsRefill && (
            <Link to={orderHref} className={`btn ${due ? 'btn-secondary' : 'btn-primary'}`}>
              Order more
            </Link>
          )}

          <div className="med-menu" ref={menuRef}>
            <button
              type="button"
              ref={toggleRef}
              className="btn btn-secondary btn-small"
              aria-haspopup="true"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((o) => !o)}
            >
              <MoreHorizontal size={18} aria-hidden="true" /> More
              <span className="sr-only"> options for {med.name}</span>
            </button>
            {menuOpen && (
              <div
                className="med-menu-panel"
                role="group"
                aria-label={`More options for ${med.name}`}
              >
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onEdit();
                  }}
                >
                  <Pencil size={16} aria-hidden="true" /> Edit details
                </button>
                <button
                  type="button"
                  className="danger"
                  onClick={() => {
                    setMenuOpen(false);
                    onStop();
                  }}
                >
                  <Ban size={16} aria-hidden="true" /> Stop this medicine
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </article>
  );
};
