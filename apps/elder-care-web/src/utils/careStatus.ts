import {
  intakesPerDay,
  type DaySlot,
  type IMedicationView,
  type PharmacyOrderStatus,
} from '@eldercare/shared';
import type { RideRecord } from '../services/api';
import type { Status } from '../components/ui';

export const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

/** Doses recorded today (not undone) out of those the schedule expects. Only recorded intakes count. */
export function doseProgress(
  med: IMedicationView,
  doses: { takenAt: Date | string; undoneAt?: Date | string }[],
  now = new Date(),
): { recorded: number; expected: number; asNeeded: boolean } {
  const recorded = doses.filter((d) => !d.undoneAt && isSameDay(new Date(d.takenAt), now)).length;
  return {
    recorded,
    expected: intakesPerDay(med.schedule),
    asNeeded: med.schedule.asNeeded,
  };
}

export const formatWhen = (iso: string | Date | null | undefined): string => {
  if (!iso) return 'As soon as possible';
  const d = new Date(iso);
  const time = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  if (isSameDay(d, new Date())) return `Today, ${time}`;
  return `${d.toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' })}, ${time}`;
};

/** Plain wording for the ride states ElderCare actually records. */
export const RIDE_LABEL: Record<RideRecord['status'], { text: string; status: Status }> = {
  requested: { text: 'Request sent, waiting for a driver', status: 'pending' },
  accepted: { text: 'Booking confirmed', status: 'success' },
  arriving: { text: 'Driver is on the way', status: 'success' },
  in_progress: { text: 'Ride in progress', status: 'info' },
  completed: { text: 'Ride completed', status: 'success' },
  rejected: { text: 'Not accepted', status: 'danger' },
  cancelled: { text: 'Cancelled', status: 'cancelled' },
};

export const ORDER_LABEL: Record<PharmacyOrderStatus, { text: string; status: Status }> = {
  placed: { text: 'Order sent, waiting for the pharmacy', status: 'pending' },
  accepted: { text: 'Pharmacy accepted the order', status: 'success' },
  packed: { text: 'Order packed', status: 'success' },
  out_for_delivery: { text: 'Out for delivery', status: 'info' },
  delivered: { text: 'Delivered', status: 'success' },
  rejected: { text: 'Pharmacy could not accept it', status: 'danger' },
  cancelled: { text: 'Cancelled', status: 'cancelled' },
};

// Rough start of each part of the day, used only to decide whether a dose is "due now".
const SLOT_START_HOUR: Record<DaySlot, number> = {
  morning: 6,
  afternoon: 12,
  evening: 17,
  night: 21,
};

export type DoseState =
  | { kind: 'unknown' }
  | { kind: 'asNeeded' }
  | { kind: 'taken'; recorded: number; expected: number }
  | { kind: 'due'; recorded: number; expected: number }
  | { kind: 'upcoming'; recorded: number; expected: number; next: string };

const timeLabel = (h: number, m: number) =>
  new Date(2000, 0, 1, h, m).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

/**
 * Where today's schedule stands, based only on doses that were recorded (`recorded`) and the
 * schedule. "Due now" means the scheduled time has passed with no matching record.
 */
export function doseState(
  med: Pick<IMedicationView, 'schedule'>,
  recorded: number | null,
  now = new Date(),
): DoseState {
  if (med.schedule.asNeeded) return { kind: 'asNeeded' };
  if (recorded === null) return { kind: 'unknown' };

  const planned: { minutes: number; label: string }[] = med.schedule.times.length
    ? med.schedule.times.map((t) => {
        const [h = 0, m = 0] = t.split(':').map(Number);
        return { minutes: h * 60 + m, label: timeLabel(h, m) };
      })
    : med.schedule.slots.map((s) => ({
        minutes: SLOT_START_HOUR[s] * 60,
        label: `this ${s}`,
      }));
  planned.sort((a, b) => a.minutes - b.minutes);

  const expected = planned.length;
  if (expected === 0) return { kind: 'unknown' };
  if (recorded >= expected) return { kind: 'taken', recorded, expected };

  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const duePassed = planned.filter((p) => p.minutes <= nowMinutes).length;
  if (duePassed > recorded) return { kind: 'due', recorded, expected };
  return { kind: 'upcoming', recorded, expected, next: planned[recorded]!.label };
}

const COUNTABLE_UNITS = /^(tablet|capsule|drop|puff|patch|unit|spoon|injection)$/i;

/** "12 tablets", "1 tablet", "5 ml": only everyday countable units get an "s". */
export const countWithUnit = (n: number, unit: string): string =>
  `${n} ${n !== 1 && COUNTABLE_UNITS.test(unit) ? `${unit}s` : unit}`;
