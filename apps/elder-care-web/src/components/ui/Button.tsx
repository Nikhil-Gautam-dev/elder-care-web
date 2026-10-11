import React from 'react';

type Variant = 'primary' | 'secondary' | 'danger' | 'danger-solid';
type Size = 'normal' | 'large' | 'small';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  block?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = 'primary', size = 'normal', block, className = '', type = 'button', ...rest },
    ref,
  ) => (
    <button
      ref={ref}
      type={type}
      className={[
        'btn',
        `btn-${variant}`,
        size === 'large' ? 'btn-large' : size === 'small' ? 'btn-small' : '',
        block ? 'btn-block' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    />
  ),
);
Button.displayName = 'Button';
