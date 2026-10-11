import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, XCircle, Info, Ban } from 'lucide-react';

export type Status =
  'success' | 'pending' | 'warning' | 'danger' | 'info' | 'cancelled' | 'neutral';

const STYLE: Record<Status, { cls: string; Icon: React.ElementType | null }> = {
  success: { cls: 'badge-success', Icon: CheckCircle2 },
  pending: { cls: 'badge-info', Icon: Clock },
  warning: { cls: 'badge-warning', Icon: AlertTriangle },
  danger: { cls: 'badge-danger', Icon: XCircle },
  info: { cls: 'badge-info', Icon: Info },
  cancelled: { cls: 'badge-neutral', Icon: Ban },
  neutral: { cls: 'badge-neutral', Icon: null },
};

/** Status is always shown as an icon plus text, never colour alone. */
export const StatusBadge: React.FC<{ status: Status; children: React.ReactNode }> = ({
  status,
  children,
}) => {
  const { cls, Icon } = STYLE[status];
  return (
    <span className={`badge ${cls}`}>
      {Icon && <Icon size={14} aria-hidden="true" />}
      {children}
    </span>
  );
};
