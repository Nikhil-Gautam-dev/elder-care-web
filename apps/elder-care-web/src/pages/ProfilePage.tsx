import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  PIN_DIGITS,
  deliveryAddressGaps,
  formatIndianPhone,
  isValidPinCode,
  type FamilyView,
  type Gender,
  type NotificationChannel,
  type RidePreference,
} from '@eldercare/shared';
import { useAuth } from '../context/AuthContext';
import { getMyFamily, updateUserProfile } from '../services/api';
import { useUnsavedChangesWarning } from '../hooks/useUnsavedChangesWarning';
import { Button, ConfirmDialog, FormField, Notice, PageHeader } from '../components/ui';

const SPEECH_LANG_KEY = 'eldercare_speech_lang';

interface ProfileForm {
  name: string;
  age: string;
  gender: Gender | '';
  email: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  language: string;
  preferredRide: RidePreference;
  voiceEnabled: boolean;
  notificationChannel: NotificationChannel;
}

type Errors = Partial<Record<'name' | 'age' | 'email' | 'postalCode', string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const ProfilePage: React.FC = () => {
  const { user, userId, refreshUser, largeTextMode, toggleLargeTextMode } = useAuth();

  const initial = useMemo<ProfileForm>(
    () => ({
      name: user?.name ?? '',
      age: user?.age ? String(user.age) : '',
      gender: user?.gender ?? '',
      email: user?.email ?? '',
      line1: user?.address?.line1 ?? '',
      line2: user?.address?.line2 ?? '',
      city: user?.address?.city ?? '',
      state: user?.address?.state ?? '',
      postalCode: user?.address?.postalCode ?? '',
      language: user?.preferences?.language ?? 'en',
      preferredRide: user?.preferences?.preferredRide ?? 'accessible',
      voiceEnabled: user?.accessibility?.voiceEnabled ?? false,
      notificationChannel: user?.preferences?.notificationChannel ?? 'sms',
    }),
    // Re-baselined after a successful save (user refreshes), not on every keystroke.
    [user],
  );

  const [form, setForm] = useState<ProfileForm>(initial);
  const [errors, setErrors] = useState<Errors>({});
  const [submitCount, setSubmitCount] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);
  const [family, setFamily] = useState<FamilyView | null>(null);

  const dirty = (Object.keys(initial) as (keyof ProfileForm)[]).some((k) => form[k] !== initial[k]);
  const { leaving, leave, stay } = useUnsavedChangesWarning(dirty);

  useEffect(() => {
    getMyFamily()
      .then(setFamily)
      .catch(() => setFamily(null));
  }, []);

  // Move focus to the first field with a problem after a failed save attempt.
  useEffect(() => {
    if (submitCount === 0) return;
    document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [submitCount]);

  const set = <K extends keyof ProfileForm>(key: K, value: ProfileForm[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setJustSaved(false);
    if (key in errors) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const validate = (): Errors => {
    const e: Errors = {};
    if (!form.name.trim()) e.name = 'Please enter your name.';
    if (form.age.trim()) {
      const n = Number(form.age);
      if (!Number.isInteger(n) || n < 1 || n > 120)
        e.age = 'Please enter an age between 1 and 120.';
    }
    if (form.email.trim() && !EMAIL.test(form.email.trim()))
      e.email = 'This email address doesn’t look right. It should look like name@example.com.';
    if (form.postalCode.trim() && !isValidPinCode(form.postalCode))
      e.postalCode = `A PIN code has exactly ${PIN_DIGITS} digits.`;
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setSaveError(null);
    setJustSaved(false);

    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) {
      setSubmitCount((c) => c + 1);
      return;
    }

    setSaving(true);
    try {
      await updateUserProfile(userId, {
        name: form.name.trim(),
        age: form.age.trim() ? Number(form.age) : undefined,
        gender: form.gender || undefined,
        email: form.email.trim() || undefined,
        address: {
          ...user?.address,
          line1: form.line1.trim(),
          line2: form.line2.trim(),
          city: form.city.trim(),
          state: form.state.trim(),
          postalCode: form.postalCode.trim(),
        },
        preferences: {
          ...user?.preferences,
          language: form.language,
          notificationChannel: form.notificationChannel,
          preferredRide: form.preferredRide,
        },
        accessibility: { largeText: largeTextMode, voiceEnabled: form.voiceEnabled },
      });
      // A new profile language should also drive the assistant's microphone and voice.
      if (
        form.language !== initial.language &&
        (form.language === 'en' || form.language === 'hi')
      ) {
        try {
          localStorage.setItem(SPEECH_LANG_KEY, form.language);
        } catch {
          // Not critical: the assistant falls back to the profile language.
        }
      }
      await refreshUser();
      setJustSaved(true);
    } catch (err) {
      // Everything typed stays in place so it can be fixed and saved again.
      setSaveError((err as Error).message || 'We couldn’t save your changes.');
    } finally {
      setSaving(false);
    }
  };

  const discard = () => {
    setForm(initial);
    setErrors({});
    setSaveError(null);
  };

  const addressGaps = deliveryAddressGaps({ line1: form.line1, city: form.city });
  const others = family?.members.filter((m) => !m.isMe) ?? [];

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto' }}>
      <PageHeader
        title="My profile"
        subtitle="Your details, where medicine is delivered, and how ElderCare helps you."
      />

      <form onSubmit={handleSubmit} noValidate>
        <section className="card" aria-labelledby="personal-title">
          <h2 id="personal-title" className="section-title">
            Personal details
          </h2>

          <FormField
            label="Phone number"
            hint="This is how you log in, so it can’t be changed here."
          >
            {(a) => (
              <input
                {...a}
                type="text"
                className="input-field"
                value={formatIndianPhone(user?.phone)}
                readOnly
                style={{ background: 'var(--bg-color)' }}
              />
            )}
          </FormField>

          <div className="grid-2">
            <FormField label="Full name" error={errors.name}>
              {(a) => (
                <input
                  {...a}
                  type="text"
                  className="input-field"
                  autoComplete="name"
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                />
              )}
            </FormField>
            <FormField label="Age" optional error={errors.age}>
              {(a) => (
                <input
                  {...a}
                  type="number"
                  inputMode="numeric"
                  className="input-field"
                  value={form.age}
                  onChange={(e) => set('age', e.target.value)}
                />
              )}
            </FormField>
            <FormField label="Gender" optional>
              {(a) => (
                <select
                  {...a}
                  className="input-field"
                  value={form.gender}
                  onChange={(e) => set('gender', e.target.value as Gender | '')}
                >
                  <option value="">Prefer not to say</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              )}
            </FormField>
            <FormField label="Email address" optional error={errors.email}>
              {(a) => (
                <input
                  {...a}
                  type="email"
                  className="input-field"
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => set('email', e.target.value)}
                />
              )}
            </FormField>
          </div>
        </section>

        <section className="card" aria-labelledby="address-title">
          <h2 id="address-title" className="section-title">
            Delivery address
          </h2>
          <p className="section-intro">
            Medicine is delivered here, and rides start from here unless you say otherwise.
          </p>
          {addressGaps.length > 0 && (
            <p className="form-hint" style={{ marginBottom: 'var(--space-4)' }} role="status">
              To order medicine, we still need your {addressGaps.join(' and ')}.
            </p>
          )}

          <FormField label="House number and street">
            {(a) => (
              <input
                {...a}
                type="text"
                className="input-field"
                autoComplete="address-line1"
                placeholder="e.g. House 23, Ambika City"
                value={form.line1}
                onChange={(e) => set('line1', e.target.value)}
              />
            )}
          </FormField>
          <FormField label="Area or landmark" optional>
            {(a) => (
              <input
                {...a}
                type="text"
                className="input-field"
                autoComplete="address-line2"
                placeholder="e.g. Near the park"
                value={form.line2}
                onChange={(e) => set('line2', e.target.value)}
              />
            )}
          </FormField>
          <div className="grid-2">
            <FormField label="City">
              {(a) => (
                <input
                  {...a}
                  type="text"
                  className="input-field"
                  autoComplete="address-level2"
                  value={form.city}
                  onChange={(e) => set('city', e.target.value)}
                />
              )}
            </FormField>
            <FormField label="State" optional>
              {(a) => (
                <input
                  {...a}
                  type="text"
                  className="input-field"
                  autoComplete="address-level1"
                  value={form.state}
                  onChange={(e) => set('state', e.target.value)}
                />
              )}
            </FormField>
            <FormField label="PIN code" optional error={errors.postalCode}>
              {(a) => (
                <input
                  {...a}
                  type="text"
                  inputMode="numeric"
                  className="input-field"
                  autoComplete="postal-code"
                  maxLength={PIN_DIGITS}
                  value={form.postalCode}
                  onChange={(e) =>
                    set('postalCode', e.target.value.replace(/\D/g, '').slice(0, PIN_DIGITS))
                  }
                />
              )}
            </FormField>
          </div>
        </section>

        <section className="card" aria-labelledby="help-title">
          <h2 id="help-title" className="section-title">
            How ElderCare helps me
          </h2>

          <div className="setting-row">
            <div>
              <strong id="text-size-label">Larger text</strong>
              <p className="med-meta">Makes everything bigger. This changes right away.</p>
            </div>
            <Button
              variant={largeTextMode ? 'primary' : 'secondary'}
              aria-pressed={largeTextMode}
              aria-labelledby="text-size-label"
              onClick={() => void toggleLargeTextMode()}
            >
              {largeTextMode ? 'On' : 'Off'}
            </Button>
          </div>

          <div className="setting-row">
            <div>
              <strong id="voice-label">Spoken replies</strong>
              <p className="med-meta">ElderCare reads its answers out loud.</p>
            </div>
            <Button
              variant={form.voiceEnabled ? 'primary' : 'secondary'}
              aria-pressed={form.voiceEnabled}
              aria-labelledby="voice-label"
              onClick={() => set('voiceEnabled', !form.voiceEnabled)}
            >
              {form.voiceEnabled ? 'On' : 'Off'}
            </Button>
          </div>

          <div className="grid-2">
            <FormField label="Language" hint="Used for listening and speaking.">
              {(a) => (
                <select
                  {...a}
                  className="input-field"
                  value={form.language}
                  onChange={(e) => set('language', e.target.value)}
                >
                  <option value="en">English</option>
                  <option value="hi">हिन्दी (Hindi)</option>
                  {form.language === 'es' && <option value="es">Spanish (text only)</option>}
                </select>
              )}
            </FormField>
            <FormField label="Ride type" hint="Used when ElderCare books a ride for you.">
              {(a) => (
                <select
                  {...a}
                  className="input-field"
                  value={form.preferredRide}
                  onChange={(e) => set('preferredRide', e.target.value as RidePreference)}
                >
                  <option value="accessible">Accessible (wheelchair or extra help)</option>
                  <option value="standard">Standard</option>
                  <option value="premium">Premium comfort</option>
                </select>
              )}
            </FormField>
          </div>
        </section>

        <section className="card" aria-labelledby="family-title">
          <h2 id="family-title" className="section-title">
            Family and notifications
          </h2>

          <p>
            <strong>People you trust</strong>
          </p>
          {others.length > 0 ? (
            <ul className="contact-list">
              {others.map((m) => (
                <li key={m.userId} className="badge badge-neutral">
                  {m.name}
                  {m.relationship ? ` (${m.relationship})` : ''}
                </li>
              ))}
            </ul>
          ) : (
            <p className="med-meta" style={{ margin: 'var(--space-2) 0 var(--space-4)' }}>
              No one is connected yet.
            </p>
          )}
          <p style={{ marginBottom: 'var(--space-6)' }}>
            <Link to="/family" style={{ color: 'var(--primary-hover)', fontWeight: 600 }}>
              Manage family and who gets updates
            </Link>
          </p>

          <FormField
            label="How should we contact you?"
            hint="For now, family updates appear inside ElderCare. Your choice is saved for when other ways are added."
          >
            {(a) => (
              <select
                {...a}
                className="input-field"
                value={form.notificationChannel}
                onChange={(e) => set('notificationChannel', e.target.value as NotificationChannel)}
              >
                <option value="sms">Text message (SMS)</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="app">Inside ElderCare</option>
                <option value="email">Email</option>
              </select>
            )}
          </FormField>
        </section>

        {saveError && <Notice kind="error">{saveError}</Notice>}

        <div className={`save-bar ${dirty ? 'dirty' : ''}`}>
          <span role="status" style={{ fontWeight: 600 }}>
            {saving
              ? 'Saving…'
              : dirty
                ? 'You have changes that are not saved yet.'
                : justSaved
                  ? 'Changes saved.'
                  : 'Everything is up to date.'}
          </span>
          <div className="save-bar-actions">
            {dirty && (
              <Button variant="secondary" onClick={discard} disabled={saving}>
                Undo changes
              </Button>
            )}
            <Button type="submit" disabled={saving || !dirty}>
              {saving ? 'Saving…' : 'Save changes'}
            </Button>
          </div>
        </div>
      </form>

      <ConfirmDialog
        open={leaving}
        title="Leave without saving?"
        confirmLabel="Leave without saving"
        cancelLabel="Stay and keep editing"
        destructive
        onConfirm={leave}
        onCancel={stay}
      >
        You have changes that are not saved. If you leave now, they will be lost.
      </ConfirmDialog>
    </div>
  );
};
