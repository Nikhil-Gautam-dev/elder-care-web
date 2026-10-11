import React, { useId } from 'react';

interface FormFieldProps {
  label: string;
  optional?: boolean;
  hint?: string;
  error?: string | null;
  /** Receives the props that tie the control to its label, hint and error. */
  children: (a11y: {
    id: string;
    'aria-describedby'?: string;
    'aria-invalid'?: boolean;
  }) => React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({ label, optional, hint, error, children }) => {
  const id = useId();
  const hintId = `${id}-hint`;
  const errId = `${id}-err`;
  const describedBy = [hint && hintId, error && errId].filter(Boolean).join(' ') || undefined;
  return (
    <div className="form-group">
      <label className="form-label" htmlFor={id}>
        {label}
        {optional && <span className="form-optional"> (optional)</span>}
      </label>
      {children({ id, 'aria-describedby': describedBy, 'aria-invalid': error ? true : undefined })}
      {hint && (
        <p className="form-hint" id={hintId}>
          {hint}
        </p>
      )}
      {error && (
        <p className="form-error" id={errId} role="alert">
          {error}
        </p>
      )}
    </div>
  );
};
