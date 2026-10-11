import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Mic, Plus, Package } from 'lucide-react';
import type { FamilyView, IDoseLog, IMedicationView, IPharmacyOrder } from '@eldercare/shared';
import {
  createMedication,
  getMyFamily,
  listDoses,
  listMedications,
  listPharmacyOrders,
  logDose,
  stopMedication,
  undoLastDose,
  updateMedication,
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Button,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  Notice,
  PageHeader,
  StatusBadge,
} from '../components/ui';
import { MedicineCard } from '../components/medicines/MedicineCard';
import {
  MedicineForm,
  emptyForm,
  formFromMedication,
  type FormState,
} from '../components/medicines/MedicineForm';
import {
  countWithUnit,
  doseState,
  isSameDay,
  ORDER_LABEL,
  type DoseState,
} from '../utils/careStatus';

/** Changes that alter how a medicine is taken: these need a second, explicit confirmation. */
function materialChanges(before: FormState, after: FormState): string[] {
  const out: string[] = [];
  const slots = (f: FormState) =>
    f.asNeeded ? 'only when needed' : [...f.slots].sort().join(', ');
  if (before.strength.trim() !== after.strength.trim())
    out.push(`Strength: ${before.strength} → ${after.strength}`);
  if (Number(before.doseAmount) !== Number(after.doseAmount) || before.doseUnit !== after.doseUnit)
    out.push(
      `Amount each time: ${before.doseAmount} ${before.doseUnit} → ${after.doseAmount} ${after.doseUnit}`,
    );
  if (slots(before) !== slots(after)) out.push(`When: ${slots(before)} → ${slots(after)}`);
  if (before.food !== after.food) out.push(`Food: ${before.food} → ${after.food}`);
  return out;
}

export const MedicationsPage: React.FC = () => {
  const { userId } = useAuth();
  const [family, setFamily] = useState<FamilyView | null>(null);
  const [elderId, setElderId] = useState<string>('');
  const [medications, setMedications] = useState<IMedicationView[]>([]);
  const [recorded, setRecorded] = useState<Record<string, number | null>>({});
  const [orders, setOrders] = useState<IPharmacyOrder[]>([]);
  const [canManage, setCanManage] = useState(false);
  const [showStopped, setShowStopped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [editing, setEditing] = useState<IMedicationView | 'new' | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [initialForm, setInitialForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [slotError, setSlotError] = useState<string | null>(null);
  const [pendingChanges, setPendingChanges] = useState<string[] | null>(null);
  const [stopping, setStopping] = useState<IMedicationView | null>(null);
  const [stopBusy, setStopBusy] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [taking, setTaking] = useState<string | null>(null);
  const [undoable, setUndoable] = useState<string | null>(null);

  // People whose medicines I can look after: myself, plus the family's elders.
  const people = useMemo(() => {
    const elders = (family?.members ?? []).filter((m) => m.isElder && !m.isMe);
    return [
      { id: userId ?? '', label: 'Me' },
      ...elders.map((m) => ({
        id: m.userId,
        label: `${m.name}${m.relationship ? ` (${m.relationship})` : ''}`,
      })),
    ];
  }, [family, userId]);

  const targetId = elderId || userId || '';

  const todayCount = (doses: IDoseLog[]) =>
    doses.filter((d) => !d.undoneAt && isSameDay(new Date(d.takenAt), new Date())).length;

  const load = useCallback(async (id: string, withStopped: boolean) => {
    if (!id) return;
    setLoading(true);
    setLoadError(null);
    try {
      const [meds, pharmacyOrders] = await Promise.all([
        listMedications(id, withStopped),
        listPharmacyOrders(id),
      ]);
      setMedications(meds.items);
      setCanManage(meds.canManage);
      setOrders(pharmacyOrders);
      // Doses are looked up per medicine. A failed lookup stays "unknown": we never guess "taken".
      const counts = await Promise.all(
        meds.items
          .filter((m) => m.active)
          .map(async (m) => {
            const doses = await listDoses(m._id, 10).catch(() => null);
            return [m._id, doses ? todayCount(doses) : null] as const;
          }),
      );
      setRecorded(Object.fromEntries(counts));
    } catch (err) {
      setLoadError((err as Error).message || 'Failed to load medicines');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getMyFamily()
      .then(setFamily)
      .catch(() => setFamily(null));
  }, []);

  useEffect(() => {
    setEditing(null);
    setError(null);
    setSuccess(null);
    setUndoable(null);
    void load(targetId, showStopped);
  }, [targetId, showStopped, load]);

  const stateOf = (m: IMedicationView): DoseState => doseState(m, recorded[m._id] ?? null);

  const startAdd = () => {
    setForm(emptyForm);
    setInitialForm(emptyForm);
    setFormError(null);
    setSlotError(null);
    setEditing('new');
    setSuccess(null);
  };

  const startEdit = (m: IMedicationView) => {
    const state = formFromMedication(m);
    setForm(state);
    setInitialForm(state);
    setFormError(null);
    setSlotError(null);
    setEditing(m);
    setSuccess(null);
  };

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (key === 'slots' || key === 'asNeeded') setSlotError(null);
  };

  const save = async () => {
    if (!editing) return;
    setFormError(null);
    setSuccess(null);

    const common = {
      name: form.name.trim(),
      genericName: form.genericName.trim() || undefined,
      strength: form.strength.trim(),
      form: form.form,
      dose: { amount: Number(form.doseAmount), unit: form.doseUnit.trim() || 'unit' },
      schedule: {
        slots: form.asNeeded ? [] : form.slots,
        asNeeded: form.asNeeded,
        food: form.food,
        instructions: form.instructions.trim() || undefined,
      },
      prescribedBy: form.prescribedBy.trim() || undefined,
    };

    setSaving(true);
    try {
      if (editing === 'new') {
        await createMedication({
          ...common,
          elderId: targetId,
          supply: {
            unitsPerPack: Number(form.unitsPerPack),
            unitsRemaining: Number(form.unitsOnHand),
            refillThresholdDays: Number(form.refillAtDays),
          },
        });
        setSuccess(`${common.name} was saved.`);
      } else {
        await updateMedication(editing._id, {
          ...common,
          supply: {
            unitsPerPack: Number(form.unitsPerPack),
            refillThresholdDays: Number(form.refillAtDays),
            // Only reset the count when the person actually changed it.
            ...(form.unitsOnHand !== initialForm.unitsOnHand
              ? { unitsRemaining: Number(form.unitsOnHand) }
              : {}),
          },
        });
        setSuccess(`${common.name} was updated.`);
      }
      setPendingChanges(null);
      setEditing(null);
      await load(targetId, showStopped);
    } catch (err) {
      // Keep everything the person typed so they can fix it and try again.
      setPendingChanges(null);
      setFormError((err as Error).message || 'Could not save the medicine');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.asNeeded && form.slots.length === 0) {
      setSlotError('Choose when it is taken, or tick “Only when needed”.');
      return;
    }
    if (editing && editing !== 'new') {
      const changes = materialChanges(initialForm, form);
      if (changes.length > 0) {
        setPendingChanges(changes);
        return;
      }
    }
    void save();
  };

  const confirmStop = async () => {
    if (!stopping) return;
    setStopBusy(true);
    setError(null);
    try {
      await stopMedication(stopping._id);
      setSuccess(`${stopping.name} was stopped. It stays in the history but won't be reordered.`);
      setStopping(null);
      await load(targetId, showStopped);
    } catch (err) {
      setStopping(null);
      setError((err as Error).message || 'Could not stop the medicine');
    } finally {
      setStopBusy(false);
    }
  };

  const replaceMedication = (updated: IMedicationView) =>
    setMedications((list) => list.map((x) => (x._id === updated._id ? updated : x)));

  const refreshRecorded = async (id: string) => {
    const doses = await listDoses(id, 10).catch(() => null);
    setRecorded((r) => ({ ...r, [id]: doses ? todayCount(doses) : null }));
  };

  const handleTake = async (m: IMedicationView) => {
    setError(null);
    setSuccess(null);
    setTaking(m._id);
    try {
      const { medication } = await logDose(m._id, { requestId: crypto.randomUUID() });
      replaceMedication(medication);
      await refreshRecorded(m._id);
      setSuccess(
        `Recorded: you took ${m.name}. ${countWithUnit(medication.supplyStatus.unitsLeft, m.dose.unit)} left.`,
      );
      setUndoable(m._id);
    } catch (err) {
      setError((err as Error).message || 'Could not record the dose');
    } finally {
      setTaking(null);
    }
  };

  const handleUndo = async (m: IMedicationView) => {
    setError(null);
    setSuccess(null);
    setTaking(m._id);
    try {
      const { medication } = await undoLastDose(m._id);
      replaceMedication(medication);
      await refreshRecorded(m._id);
      setSuccess(
        `Undone: the last ${m.name} record was removed. ${countWithUnit(medication.supplyStatus.unitsLeft, m.dose.unit)} left.`,
      );
      setUndoable(null);
    } catch (err) {
      setError((err as Error).message || 'Could not undo the dose');
    } finally {
      setTaking(null);
    }
  };

  const active = medications.filter((m) => m.active);
  const scheduled = active.filter((m) => !m.schedule.asNeeded);
  const shown = showStopped ? medications : active;

  return (
    <div>
      <PageHeader
        title="Medicines"
        subtitle="Your medicines, today's doses and orders in one place."
        actions={
          <>
            <Link to="/assistant?ask=Order my usual medicine" className="btn btn-primary">
              <Mic size={18} aria-hidden="true" /> Order medicine
            </Link>
            {canManage && !loading && (
              <Button variant="secondary" onClick={startAdd}>
                <Plus size={18} aria-hidden="true" /> Add a medicine
              </Button>
            )}
          </>
        }
      />

      {people.length > 1 && (
        <div className="form-group" style={{ maxWidth: '24rem' }}>
          <label className="form-label" htmlFor="person-select">
            Whose medicines
          </label>
          <select
            id="person-select"
            className="input-field"
            value={targetId}
            onChange={(e) => setElderId(e.target.value)}
          >
            {people.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {error && <Notice kind="error">{error}</Notice>}
      {success && <Notice kind="success">{success}</Notice>}

      {loadError ? (
        <ErrorState
          title="We couldn't load the medicines"
          message={loadError}
          onRetry={() => void load(targetId, showStopped)}
        />
      ) : loading && medications.length === 0 ? (
        <div className="card" role="status">
          Checking your medicines…
        </div>
      ) : (
        <>
          <section className="card" aria-labelledby="today-title">
            <h2 id="today-title" className="section-title">
              Today&apos;s schedule
            </h2>
            {scheduled.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)' }}>
                {active.length === 0
                  ? 'Nothing scheduled yet.'
                  : 'Your medicines are taken only when needed, so nothing is scheduled.'}
              </p>
            ) : (
              <>
                <ul style={{ listStyle: 'none' }}>
                  {scheduled.map((m) => {
                    const s = stateOf(m);
                    return (
                      <li key={m._id} className="today-row">
                        <span>
                          <strong>
                            {m.name} {m.strength}
                          </strong>
                          <br />
                          <span className="med-meta">{m.summary}</span>
                        </span>
                        {s.kind === 'due' ? (
                          <StatusBadge status="warning">Due now</StatusBadge>
                        ) : s.kind === 'taken' ? (
                          <StatusBadge status="success">Recorded as taken</StatusBadge>
                        ) : s.kind === 'upcoming' ? (
                          <StatusBadge status="info">Upcoming: {s.next}</StatusBadge>
                        ) : (
                          <StatusBadge status="neutral">Not checked</StatusBadge>
                        )}
                      </li>
                    );
                  })}
                </ul>
                <p className="form-hint">
                  “Mark as taken” saves what you tell us. It does not check that the medicine was
                  actually taken.
                </p>
              </>
            )}
          </section>

          {editing && (
            <MedicineForm
              title={editing === 'new' ? 'Add a medicine' : `Edit ${editing.name}`}
              form={form}
              isNew={editing === 'new'}
              saving={saving}
              error={formError}
              slotError={slotError}
              onChange={set}
              onSubmit={handleSubmit}
              onCancel={() => setEditing(null)}
            />
          )}

          <section className="card" aria-labelledby="current-title">
            <h2 id="current-title" className="section-title">
              Current medicines
            </h2>
            {!canManage && shown.length > 0 && (
              <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
                You can see these medicines. Only family members with order permission can change
                them.
              </p>
            )}
            {shown.length === 0 ? (
              <EmptyState
                icon={<Package size={28} aria-hidden="true" color="var(--primary)" />}
                title="No medicines saved yet"
                description={
                  canManage
                    ? 'Add a medicine so ElderCare can track doses and help with refills.'
                    : undefined
                }
                action={
                  canManage ? (
                    <Button onClick={startAdd}>
                      <Plus size={18} aria-hidden="true" /> Add a medicine
                    </Button>
                  ) : undefined
                }
              />
            ) : (
              <div className="med-list">
                {shown.map((m) => (
                  <MedicineCard
                    key={m._id}
                    med={m}
                    state={stateOf(m)}
                    canManage={canManage}
                    busy={taking === m._id}
                    canUndo={undoable === m._id}
                    onTake={() => void handleTake(m)}
                    onUndo={() => void handleUndo(m)}
                    onEdit={() => startEdit(m)}
                    onStop={() => setStopping(m)}
                  />
                ))}
              </div>
            )}
            <label className="checkbox-row" style={{ marginTop: 'var(--space-4)' }}>
              <input
                type="checkbox"
                checked={showStopped}
                onChange={(e) => setShowStopped(e.target.checked)}
              />
              <span>Also show stopped medicines</span>
            </label>
          </section>

          <section className="card" aria-labelledby="orders-title">
            <h2 id="orders-title" className="section-title">
              Medicine orders
            </h2>
            {orders.length === 0 ? (
              <EmptyState
                title="No orders yet"
                description="Ask ElderCare to order a medicine and it will show up here."
                action={
                  <Link to="/assistant?ask=Order my usual medicine" className="btn btn-primary">
                    Order medicine
                  </Link>
                }
              />
            ) : (
              <>
                <div className="med-list">
                  {orders.map((o) => (
                    <article key={o._id} className="med-card">
                      <div className="med-card-head">
                        <div>
                          <h3 className="med-name">
                            Order {o.orderNumber} · ₹{o.total}
                          </h3>
                          <p className="med-summary">
                            {o.items.map((i) => `${i.brand} ${i.strength} × ${i.packs}`).join(', ')}
                          </p>
                          <p className="med-meta">
                            Ordered by {o.orderedByName} on{' '}
                            {new Date(o.createdAt).toLocaleDateString()} · Pay cash on delivery
                          </p>
                        </div>
                        <StatusBadge status={ORDER_LABEL[o.status]?.status ?? 'neutral'}>
                          {ORDER_LABEL[o.status]?.text ?? o.status}
                        </StatusBadge>
                      </div>
                    </article>
                  ))}
                </div>
                <p className="form-hint">
                  This is the last status the pharmacy reported. Ask ElderCare to check an order for
                  the latest update.
                </p>
              </>
            )}
          </section>
        </>
      )}

      <ConfirmDialog
        open={!!stopping}
        title={`Stop ${stopping?.name ?? 'this medicine'}?`}
        confirmLabel="Yes, stop it"
        destructive
        busy={stopBusy}
        onConfirm={() => void confirmStop()}
        onCancel={() => setStopping(null)}
      >
        It will stay in the history, but ElderCare will no longer remind you about it or reorder it.
        You can add it again later. This does not change what your doctor has prescribed.
      </ConfirmDialog>

      <ConfirmDialog
        open={!!pendingChanges}
        title="Change how this medicine is taken?"
        confirmLabel="Yes, save the changes"
        busy={saving}
        onConfirm={() => void save()}
        onCancel={() => setPendingChanges(null)}
      >
        <p>Please check these changes match what the doctor or pharmacist told you:</p>
        <ul style={{ margin: 'var(--space-3) 0 0 var(--space-6)' }}>
          {pendingChanges?.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </ConfirmDialog>
    </div>
  );
};
