import React from 'react';
import { Search } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'md' | 'sm';
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button',
  ...rest
}) => (
  <button
    type={type}
    className={`btn btn-${variant} ${size === 'sm' ? 'btn-sm' : ''} ${className}`}
    {...rest}
  />
);

export const Field: React.FC<{
  label: string;
  htmlFor: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}> = ({ label, htmlFor, hint, className = '', children }) => (
  <div className={`field ${className}`}>
    <label htmlFor={htmlFor}>{label}</label>
    {children}
    {hint && <div className="hint">{hint}</div>}
  </div>
);

export const SearchInput: React.FC<{
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}> = ({ value, onChange, placeholder }) => (
  <div className="search">
    <Search size={16} />
    <input
      className="input"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      aria-label={placeholder}
    />
  </div>
);

export const Toggle: React.FC<{
  on: boolean;
  onChange: (on: boolean) => void;
  label: string;
}> = ({ on, onChange, label }) => (
  <button
    type="button"
    role="switch"
    aria-checked={on}
    aria-label={label}
    className={`toggle ${on ? 'on' : ''}`}
    onClick={() => onChange(!on)}
  />
);
