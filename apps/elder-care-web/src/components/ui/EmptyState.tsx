import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from './Button';

export const EmptyState: React.FC<{
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}> = ({ title, description, icon, action }) => (
  <div className="state-box">
    {icon}
    <h3>{title}</h3>
    {description && <p>{description}</p>}
    {action}
  </div>
);

export const ErrorState: React.FC<{
  title?: string;
  message: string;
  onRetry?: () => void;
}> = ({ title = 'Something went wrong', message, onRetry }) => (
  <div className="state-box error" role="alert">
    <AlertCircle size={28} color="var(--danger)" aria-hidden="true" />
    <h3>{title}</h3>
    <p>{message}</p>
    {onRetry && (
      <Button variant="secondary" onClick={onRetry}>
        Try again
      </Button>
    )}
  </div>
);
