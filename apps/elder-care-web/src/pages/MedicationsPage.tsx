import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, MessageSquare, Package, Pill, Plus } from 'lucide-react';
import {
  DAY_SLOTS,
  FOOD_TIMINGS,
  MEDICATION_FORMS,
  type DaySlot,
  type FamilyView,
  type FoodTiming,
  type IMedicationView,
  type IPharmacyOrder,
  type MedicationForm,
} from '@eldercare/shared';
import {
  createMedication,
  getMyFamily,
  listMedications,
  listPharmacyOrders,
  logDose,
  stopMedication,
  undoLastDose,
  updateMedication,
} from '../services/api';
import { useAuth } from '../context/AuthContext';

const FOOD_LABELS: Record<FoodTiming, string> = {
  any: 'Any time',
  before: 'Before food',
  after: 'After food',
  with: 'With food',
};

const STATUS_LABELS: Record<string, string> = {
  placed: 'Waiting for the pharmacy',
  accepted: 'Being prepared',
  packed: 'Packed',
  out_for_delivery: 'Out for delivery',
  delivered: 'Delivered',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
};

interface FormState {
  name: string;
  genericName: string;
  strength: string;
  form: MedicationForm;
  doseAmount: string;
  doseUnit: string;
  slots: DaySlot[];
  asNeeded: boolean;
  food: FoodTiming;
  instructions: string;
  unitsPerPack: string;
  unitsOnHand: string;
  refillAtDays: string;
  prescribedBy: string;
}

const emptyForm: FormState = {
  name: '',
  genericName: '',
  strength: '',
  form: 'tablet',
  doseAmount: '1',
  doseUnit: 'tablet',
  slots: ['morning'],
  asNeeded: false,
  food: 'any',
  instructions: '',
  unitsPerPack: '10',
  unitsOnHand: '0',
  refillAtDays: '5',
  prescribedBy: '',
};

const formFromMedication = (m: IMedicationView): FormState => ({
  name: m.name,
  genericName: m.genericName ?? '',
  strength: m.strength,
  form: m.form,
  doseAmount: String(m.dose.amount),
  doseUnit: m.dose.unit,
  slots: m.schedule.slots,
  asNeeded: m.schedule.asNeeded,
  food: m.schedule.food,
  instructions: m.schedule.instructions ?? '',
  unitsPerPack: String(m.supply.unitsPerPack),
  unitsOnHand: String(Math.round(m.supplyStatus.unitsLeft)),
  refillAtDays: String(m.supply.refillThresholdDays),
  prescribedBy: m.prescribedBy ?? '',
});

export const MedicationsPage: React.FC = () => {
  const { userId } = useAuth();
  const [family, setFamily] = useState<FamilyView | null>(null);
  const [elderId, setElderId] = useState<string>('');
  const [medications, setMedications] = useState<IMedicationView[]>([]);
  const [orders, setOrders] = useState<IPharmacyOrder[]>([]);
  const [canManage, setCanManage] = useState<boolean>(false);

  const [editing, setEditing] = useState<IMedicationView | 'new' | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [initialOnHand, setInitialOnHand] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  /** Medicine whose dose is being logged/undone, and the one just logged (offers Undo). */
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

  const load = async (id: string) => {
    if (!id) return;
    try {
      const [meds, pharmacyOrders] = await Promise.all([
        listMedications(id),
        listPharmacyOrders(id),
      ]);
      setMedications(meds.items);
      setCanManage(meds.canManage);
      setOrders(pharmacyOrders);
    } catch (err: any) {
      setError(err.message || 'Failed to load medicines');
    }
  };

  useEffect(() => {
    getMyFamily()
      .then(setFamily)
      .catch(() => setFamily(null));
  }, []);

  useEffect(() => {
    setEditing(null);
    setError(null);
    load(targetId);
  }, [targetId]);

  const startAdd = () => {
    setForm(emptyForm);
    setInitialOnHand(emptyForm.unitsOnHand);
    setEditing('new');
    setSuccess(null);
  };

  const startEdit = (m: IMedicationView) => {
    const state = formFromMedication(m);
    setForm(state);
    setInitialOnHand(state.unitsOnHand);
    setEditing(m);
    setSuccess(null);
  };

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const toggleSlot = (slot: DaySlot) =>
    set(
      'slots',
      form.slots.includes(slot) ? form.slots.filter((s) => s !== slot) : [...form.slots, slot],
    );

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!form.asNeeded && form.slots.length === 0) {
      setError('Pick when it is taken, or tick "Only when needed".');
      return;
    }

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
      } else if (editing) {
        await updateMedication(editing._id, {
          ...common,
          supply: {
            unitsPerPack: Number(form.unitsPerPack),
            refillThresholdDays: Number(form.refillAtDays),
            // Only reset the count when the person actually changed it.
            ...(form.unitsOnHand !== initialOnHand
              ? { unitsRemaining: Number(form.unitsOnHand) }
              : {}),
          },
        });
        setSuccess(`${common.name} was updated.`);
      }
      setEditing(null);
      await load(targetId);
    } catch (err: any) {
      setError(err.message || 'Could not save the medicine');
    } finally {
      setSaving(false);
    }
  };

  const handleStop = async (m: IMedicationView) => {
    if (!window.confirm(`Stop ${m.name}? It stays in the history but won't be reordered.`)) return;
    setError(null);
    try {
      await stopMedication(m._id);
      setSuccess(`${m.name} was stopped.`);
      await load(targetId);
    } catch (err: any) {
      setError(err.message || 'Could not stop the medicine');
    }
  };

  const replaceMedication = (updated: IMedicationView) =>
    setMedications((list) => list.map((x) => (x._id === updated._id ? updated : x)));

  const handleTake = async (m: IMedicationView) => {
    setError(null);
    setSuccess(null);
    setTaking(m._id);
    try {
      const { medication } = await logDose(m._id, { requestId: crypto.randomUUID() });
      replaceMedication(medication);
      setSuccess(
        `Marked ${m.name} as taken. ${medication.supplyStatus.unitsLeft} ${m.dose.unit} left.`,
      );
      setUndoable(m._id);
    } catch (err: any) {
      setError(err.message || 'Could not mark the dose as taken');
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
      setSuccess(
        `Undid the last ${m.name} dose. ${medication.supplyStatus.unitsLeft} ${m.dose.unit} left.`,
      );
      setUndoable(null);
    } catch (err: any) {
      setError(err.message || 'Could not undo the dose');
    } finally {
      setTaking(null);
    }
  };

  const supplyBadge = (m: IMedicationView) => {
    const { daysLeft, needsRefill, unitsLeft } = m.supplyStatus;
    if (unitsLeft <= 0) return 'None left';
    const count = `${unitsLeft} left`;
    if (daysLeft === null) return count;
    return `${count} (about ${daysLeft} day${daysLeft === 1 ? '' : 's'})${needsRefill ? ' — running low' : ''}`;
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Medicines</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Keep doses and schedules in one place. You can also just tell the assistant, for example
          &ldquo;order my sugar tablets&rdquo;.
        </p>
      </div>

      {people.length > 1 && (
        <div className="form-group" style={{ maxWidth: '22rem' }}>
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
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, display: 'flex', gap: '0.5rem' }}>
            <Pill size={20} style={{ color: 'var(--primary)' }} />
            <span>Current medicines ({medications.length})</span>
          </h2>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Link to="/assistant" className="btn btn-secondary">
              <MessageSquare size={16} /> Order with assistant
            </Link>
            {canManage && (
              <button type="button" className="btn btn-primary" onClick={startAdd}>
                <Plus size={16} /> Add medicine
              </button>
            )}
          </div>
        </div>

        {!canManage && medications.length > 0 && (
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            You can see these medicines but only family members with order permission can change
            them.
          </p>
        )}

        {medications.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', padding: '1rem 0' }}>
            No medicines saved yet.
            {canManage ? ' Add one to let the assistant help with refills.' : ''}
          </p>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {medications.map((m) => (
              <div
                key={m._id}
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
                    justifyContent: 'space-between',
                    gap: '1rem',
                    flexWrap: 'wrap',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '1.05rem' }}>
                      {m.name} {m.strength}
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                      {m.summary}
                    </div>
                    {(m.genericName || m.prescribedBy) && (
                      <div
                        style={{
                          color: 'var(--text-muted)',
                          fontSize: '0.8rem',
                          marginTop: '0.2rem',
                        }}
                      >
                        {[
                          m.genericName,
                          m.prescribedBy && `Dr. ${m.prescribedBy.replace(/^dr\.?\s*/i, '')}`,
                        ]
                          .filter(Boolean)
                          .join(' · ')}
                      </div>
                    )}
                  </div>
                  <div>
                    <span
                      className={`badge ${m.supplyStatus.needsRefill ? 'badge-warning' : 'badge-success'}`}
                    >
                      <Package size={12} /> {supplyBadge(m)}
                    </span>
                  </div>
                </div>

                {canManage && (
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                    <button
                      type="button"
                      className="btn btn-primary"
                      style={{ padding: '0.25rem 0.6rem', fontSize: '0.8rem' }}
                      disabled={taking === m._id || m.supplyStatus.unitsLeft < m.dose.amount}
                      onClick={() => handleTake(m)}
                    >
                      Mark taken
                    </button>
                    {undoable === m._id && (
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ padding: '0.25rem 0.6rem', fontSize: '0.8rem' }}
                        disabled={taking === m._id}
                        onClick={() => handleUndo(m)}
                      >
                        Undo
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ padding: '0.25rem 0.6rem', fontSize: '0.8rem' }}
                      onClick={() => startEdit(m)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger"
                      style={{ padding: '0.25rem 0.6rem', fontSize: '0.8rem' }}
                      onClick={() => handleStop(m)}
                    >
                      Stop
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {editing && (
        <div className="card">
          <h2 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '1rem' }}>
            {editing === 'new' ? 'Add a medicine' : `Edit ${editing.name}`}
          </h2>
          <form onSubmit={handleSave}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="med-name">
                  Name
                </label>
                <input
                  id="med-name"
                  className="input-field"
                  placeholder="e.g. Metformin or Glycomet"
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="med-strength">
                  Strength
                </label>
                <input
                  id="med-strength"
                  className="input-field"
                  placeholder="e.g. 500 mg"
                  value={form.strength}
                  onChange={(e) => set('strength', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="med-form">
                  Type
                </label>
                <select
                  id="med-form"
                  className="input-field"
                  value={form.form}
                  onChange={(e) => set('form', e.target.value as MedicationForm)}
                >
                  {MEDICATION_FORMS.map((f) => (
                    <option key={f} value={f}>
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="med-generic">
                  Generic name (optional)
                </label>
                <input
                  id="med-generic"
                  className="input-field"
                  value={form.genericName}
                  onChange={(e) => set('genericName', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="med-dose">
                  How much each time
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    id="med-dose"
                    type="number"
                    min="0.25"
                    step="0.25"
                    className="input-field"
                    style={{ width: '6rem' }}
                    value={form.doseAmount}
                    onChange={(e) => set('doseAmount', e.target.value)}
                    required
                  />
                  <input
                    className="input-field"
                    placeholder="tablet, ml…"
                    value={form.doseUnit}
                    onChange={(e) => set('doseUnit', e.target.value)}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="med-food">
                  With food?
                </label>
                <select
                  id="med-food"
                  className="input-field"
                  value={form.food}
                  onChange={(e) => set('food', e.target.value as FoodTiming)}
                >
                  {FOOD_TIMINGS.map((f) => (
                    <option key={f} value={f}>
                      {FOOD_LABELS[f]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">When is it taken?</label>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                {DAY_SLOTS.map((slot) => (
                  <label key={slot} style={{ display: 'flex', gap: '0.4rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={form.slots.includes(slot)}
                      disabled={form.asNeeded}
                      onChange={() => toggleSlot(slot)}
                    />
                    <span style={{ textTransform: 'capitalize' }}>{slot}</span>
                  </label>
                ))}
                <label style={{ display: 'flex', gap: '0.4rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={form.asNeeded}
                    onChange={(e) => set('asNeeded', e.target.checked)}
                  />
                  <span>Only when needed</span>
                </label>
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="med-pack">
                  Units in one pack
                </label>
                <input
                  id="med-pack"
                  type="number"
                  min="1"
                  className="input-field"
                  value={form.unitsPerPack}
                  onChange={(e) => set('unitsPerPack', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="med-onhand">
                  How many do you have now?
                </label>
                <input
                  id="med-onhand"
                  type="number"
                  min="0"
                  className="input-field"
                  value={form.unitsOnHand}
                  onChange={(e) => set('unitsOnHand', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="med-refill">
                  Remind to reorder when days left is
                </label>
                <input
                  id="med-refill"
                  type="number"
                  min="0"
                  max="60"
                  className="input-field"
                  value={form.refillAtDays}
                  onChange={(e) => set('refillAtDays', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="med-doctor">
                  Prescribed by (optional)
                </label>
                <input
                  id="med-doctor"
                  className="input-field"
                  value={form.prescribedBy}
                  onChange={(e) => set('prescribedBy', e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="med-notes">
                Notes (optional)
              </label>
              <input
                id="med-notes"
                className="input-field"
                placeholder="e.g. avoid grapefruit"
                value={form.instructions}
                onChange={(e) => set('instructions', e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving…' : 'Save medicine'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setEditing(null)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <h2 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '1rem' }}>
          Pharmacy orders
        </h2>
        {orders.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>
            No orders yet. Ask the assistant to order a medicine and it will show up here.
          </p>
        ) : (
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {orders.map((o) => (
              <div
                key={o._id}
                style={{
                  padding: '0.75rem 1rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  flexWrap: 'wrap',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600 }}>
                    {o.orderNumber} · ₹{o.total}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {o.items.map((i) => `${i.brand} ${i.strength} × ${i.packs}`).join(', ')}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Ordered by {o.orderedByName} on {new Date(o.createdAt).toLocaleDateString()} ·
                    Cash on delivery
                  </div>
                </div>
                <span
                  className={`badge ${o.status === 'delivered' ? 'badge-success' : 'badge-warning'}`}
                >
                  {STATUS_LABELS[o.status] ?? o.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
