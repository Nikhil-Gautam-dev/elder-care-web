import React, { useEffect, useRef } from 'react';
import {
  DAY_SLOTS,
  FOOD_TIMINGS,
  MEDICATION_FORMS,
  type DaySlot,
  type FoodTiming,
  type IMedicationView,
  type MedicationForm,
} from '@eldercare/shared';
import { Button, FormField, Notice } from '../ui';

export interface FormState {
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

export const emptyForm: FormState = {
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

export const formFromMedication = (m: IMedicationView): FormState => ({
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

const FOOD_LABELS: Record<FoodTiming, string> = {
  any: 'Any time',
  before: 'Before food',
  after: 'After food',
  with: 'With food',
};

interface Props {
  title: string;
  form: FormState;
  isNew: boolean;
  saving: boolean;
  error: string | null;
  slotError: string | null;
  onChange: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export const MedicineForm: React.FC<Props> = ({
  title,
  form,
  isNew,
  saving,
  error,
  slotError,
  onChange,
  onSubmit,
  onCancel,
}) => {
  const ref = useRef<HTMLElement>(null);
  const firstRef = useRef<HTMLInputElement>(null);

  // Bring the form into view once when it opens so it isn't hidden below the list.
  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    firstRef.current?.focus({ preventScroll: true });
  }, []);

  const toggleSlot = (slot: DaySlot) =>
    onChange(
      'slots',
      form.slots.includes(slot) ? form.slots.filter((s) => s !== slot) : [...form.slots, slot],
    );

  return (
    <section className="card" ref={ref} aria-labelledby="med-form-title">
      <h2 id="med-form-title" className="section-title">
        {title}
      </h2>
      <form onSubmit={onSubmit}>
        <h3 className="form-section">About the medicine</h3>
        <div className="grid-2">
          <FormField label="Name" hint="As written on the box, e.g. Metformin or Glycomet">
            {(a) => (
              <input
                {...a}
                ref={firstRef}
                className="input-field"
                value={form.name}
                onChange={(e) => onChange('name', e.target.value)}
                required
              />
            )}
          </FormField>
          <FormField label="Strength" hint="e.g. 500 mg">
            {(a) => (
              <input
                {...a}
                className="input-field"
                value={form.strength}
                onChange={(e) => onChange('strength', e.target.value)}
                required
              />
            )}
          </FormField>
          <FormField label="Type">
            {(a) => (
              <select
                {...a}
                className="input-field"
                value={form.form}
                onChange={(e) => onChange('form', e.target.value as MedicationForm)}
              >
                {MEDICATION_FORMS.map((f) => (
                  <option key={f} value={f}>
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </option>
                ))}
              </select>
            )}
          </FormField>
          <FormField label="Generic name" optional>
            {(a) => (
              <input
                {...a}
                className="input-field"
                value={form.genericName}
                onChange={(e) => onChange('genericName', e.target.value)}
              />
            )}
          </FormField>
        </div>

        <h3 className="form-section">How it is taken</h3>
        <div className="grid-2">
          <FormField label="How much each time">
            {(a) => (
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <input
                  {...a}
                  type="number"
                  min="0.25"
                  step="0.25"
                  className="input-field"
                  style={{ width: '7rem' }}
                  value={form.doseAmount}
                  onChange={(e) => onChange('doseAmount', e.target.value)}
                  required
                />
                <input
                  aria-label="Unit, for example tablet or ml"
                  className="input-field"
                  placeholder="tablet, ml…"
                  value={form.doseUnit}
                  onChange={(e) => onChange('doseUnit', e.target.value)}
                />
              </div>
            )}
          </FormField>
          <FormField label="With food?">
            {(a) => (
              <select
                {...a}
                className="input-field"
                value={form.food}
                onChange={(e) => onChange('food', e.target.value as FoodTiming)}
              >
                {FOOD_TIMINGS.map((f) => (
                  <option key={f} value={f}>
                    {FOOD_LABELS[f]}
                  </option>
                ))}
              </select>
            )}
          </FormField>
        </div>

        <fieldset className="form-group" style={{ border: 0 }}>
          <legend className="form-label">When is it taken?</legend>
          <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
            {DAY_SLOTS.map((slot) => (
              <label key={slot} className="checkbox-row">
                <input
                  type="checkbox"
                  checked={form.slots.includes(slot)}
                  disabled={form.asNeeded}
                  onChange={() => toggleSlot(slot)}
                />
                <span style={{ textTransform: 'capitalize' }}>{slot}</span>
              </label>
            ))}
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={form.asNeeded}
                onChange={(e) => onChange('asNeeded', e.target.checked)}
              />
              <span>Only when needed</span>
            </label>
          </div>
          {slotError && (
            <p className="form-error" role="alert">
              {slotError}
            </p>
          )}
        </fieldset>

        <h3 className="form-section">Supply</h3>
        <div className="grid-2">
          <FormField label="Units in one pack">
            {(a) => (
              <input
                {...a}
                type="number"
                min="1"
                className="input-field"
                value={form.unitsPerPack}
                onChange={(e) => onChange('unitsPerPack', e.target.value)}
                required
              />
            )}
          </FormField>
          <FormField label="How many do you have now?">
            {(a) => (
              <input
                {...a}
                type="number"
                min="0"
                className="input-field"
                value={form.unitsOnHand}
                onChange={(e) => onChange('unitsOnHand', e.target.value)}
                required
              />
            )}
          </FormField>
          <FormField
            label="Remind me to reorder when this many days are left"
            hint="This is an estimate from the schedule."
          >
            {(a) => (
              <input
                {...a}
                type="number"
                min="0"
                max="60"
                className="input-field"
                value={form.refillAtDays}
                onChange={(e) => onChange('refillAtDays', e.target.value)}
              />
            )}
          </FormField>
          <FormField label="Prescribed by" optional>
            {(a) => (
              <input
                {...a}
                className="input-field"
                value={form.prescribedBy}
                onChange={(e) => onChange('prescribedBy', e.target.value)}
              />
            )}
          </FormField>
        </div>

        <FormField label="Notes" optional hint="e.g. avoid grapefruit">
          {(a) => (
            <input
              {...a}
              className="input-field"
              value={form.instructions}
              onChange={(e) => onChange('instructions', e.target.value)}
            />
          )}
        </FormField>

        {error && <Notice kind="error">{error}</Notice>}

        <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving…' : isNew ? 'Save medicine' : 'Save changes'}
          </Button>
          <Button variant="secondary" onClick={onCancel} disabled={saving}>
            Cancel
          </Button>
        </div>
      </form>
    </section>
  );
};
