import type { Ride, RideStatus } from './api';
import type { Tone } from './components/ui';

export const STATUS_LABEL: Record<RideStatus, string> = {
  requested: 'New request',
  accepted: 'Accepted',
  arriving: 'Driver arriving',
  in_progress: 'In progress',
  completed: 'Completed',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
};

export const STATUS_TONE: Record<RideStatus, Tone> = {
  requested: 'warning',
  accepted: 'info',
  arriving: 'info',
  in_progress: 'accent',
  completed: 'success',
  rejected: 'danger',
  cancelled: 'danger',
};

export const STATUS_COLOR: Record<RideStatus, string> = {
  requested: '#f79009',
  accepted: '#2e90fa',
  arriving: '#7a5af8',
  in_progress: '#6366f1',
  completed: '#12b76a',
  rejected: '#f04438',
  cancelled: '#98a2b3',
};

export const FLOW: RideStatus[] = ['requested', 'accepted', 'arriving', 'in_progress', 'completed'];
export const ACTIVE: RideStatus[] = ['requested', 'accepted', 'arriving', 'in_progress'];
export const ON_TRIP: RideStatus[] = ['accepted', 'arriving', 'in_progress'];

export interface Action {
  status: RideStatus;
  label: string;
  kind: 'primary' | 'danger';
}

/** Only the valid next actions for each status (mirrors the API's transitions). */
export const ACTIONS: Record<RideStatus, Action[]> = {
  requested: [
    { status: 'accepted', label: 'Accept ride', kind: 'primary' },
    { status: 'rejected', label: 'Reject', kind: 'danger' },
  ],
  accepted: [
    { status: 'arriving', label: 'Mark arriving', kind: 'primary' },
    { status: 'cancelled', label: 'Cancel ride', kind: 'danger' },
  ],
  arriving: [
    { status: 'in_progress', label: 'Start ride', kind: 'primary' },
    { status: 'cancelled', label: 'Cancel ride', kind: 'danger' },
  ],
  in_progress: [{ status: 'completed', label: 'Complete ride', kind: 'primary' }],
  completed: [],
  rejected: [],
  cancelled: [],
};

export const whenLabel = (r: Ride) =>
  r.scheduledAt
    ? new Date(r.scheduledAt).toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        hour: 'numeric',
        minute: '2-digit',
      })
    : 'ASAP';
