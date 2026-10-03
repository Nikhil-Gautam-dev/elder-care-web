import React from 'react';
import { Phone } from 'lucide-react';
import { COUNTRY_CODE, PHONE_DIGITS, nationalDigits } from '@eldercare/shared';

interface PhoneInputProps {
  id: string;
  /** The 10 national digits only (no +91). */
  value: string;
  onChange: (digits: string) => void;
  required?: boolean;
  autoFocus?: boolean;
}

/** Indian mobile number field: fixed +91 prefix, digits only, never more than 10. */
export const PhoneInput: React.FC<PhoneInputProps> = ({
  id,
  value,
  onChange,
  required,
  autoFocus,
}) => (
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
    <span
      style={{
        position: 'absolute',
        left: '2.5rem',
        top: '50%',
        transform: 'translateY(-50%)',
        fontWeight: 600,
        color: 'var(--text-secondary)',
        pointerEvents: 'none',
      }}
    >
      {COUNTRY_CODE}
    </span>
    <input
      id={id}
      type="tel"
      inputMode="numeric"
      autoComplete="tel-national"
      autoFocus={autoFocus}
      className="input-field"
      style={{ paddingLeft: '4.5rem', letterSpacing: '1px' }}
      placeholder="98765 43210"
      maxLength={PHONE_DIGITS + 2}
      pattern={`[0-9]{${PHONE_DIGITS}}`}
      title={`Enter a ${PHONE_DIGITS}-digit mobile number`}
      value={value}
      onChange={(e) => onChange(nationalDigits(e.target.value))}
      required={required}
    />
  </div>
);
