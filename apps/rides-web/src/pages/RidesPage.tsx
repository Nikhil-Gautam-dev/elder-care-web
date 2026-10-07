import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Bell, RefreshCw } from 'lucide-react';
import {
  ApiError,
  cancelRide,
  listDrivers,
  listRides,
  setRideStatus,
  type Driver,
  type Ride,
  type RideStatus,
} from '../api';

const POLL_MS = 5000;

const FILTERS: { key: string; label: string; status?: string }[] = [
  { key: 'active', label: 'Active', status: 'requested,accepted,arriving,in_progress' },
  { key: 'new', label: 'New', status: 'requested' },
  { key: 'completed', label: 'Completed', status: 'completed' },
  { key: 'closed', label: 'Rejected / cancelled', status: 'rejected,cancelled' },
  { key: 'all', label: 'All' },
];

const STATUS_LABEL: Record<RideStatus, string> = {
  requested: 'New request',
  accepted: 'Accepted',
  arriving: 'Driver arriving',
  in_progress: 'Ride in progress',
  completed: 'Completed',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
};

const STATUS_CLASS: Record<RideStatus, string> = {
  requested: 'warn',
  accepted: '',
  arriving: '',
  in_progress: '',
  completed: 'ok',
  rejected: 'bad',
  cancelled: 'bad',
};

type Action = { status: RideStatus; label: string; kind: 'primary' | 'danger' };

/** Only the valid next actions for each status (mirrors the API's transitions). */
const ACTIONS: Record<RideStatus, Action[]> = {
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

const formatPhone = (phone: string) => phone.replace(/^\+91(\d{5})(\d{5})$/, '+91 $1 $2');

export const RidesPage: React.FC<{ onUnauthorized: () => void }> = ({ onUnauthorized }) => {
  const [filter, setFilter] = useState('active');
  const [rides, setRides] = useState<Ride[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [choosing, setChoosing] = useState<string | null>(null);
  const [driverId, setDriverId] = useState('');
  const [open, setOpen] = useState<Set<string>>(new Set());
  const seen = useRef<Set<string> | null>(null);
  const [fresh, setFresh] = useState<Set<string>>(new Set());

  const handleError = useCallback(
    (err: unknown) => {
      if (err instanceof ApiError && err.status === 401) onUnauthorized();
      else setError(err instanceof Error ? err.message : 'Something went wrong');
    },
    [onUnauthorized],
  );

  const load = useCallback(async () => {
    try {
      const [{ items }, driverList] = await Promise.all([
        listRides(FILTERS.find((f) => f.key === filter)?.status),
        listDrivers(),
      ]);
      setRides(items);
      setDrivers(driverList.items.filter((d) => d.active));
      setUpdatedAt(new Date());
      setError(null);

      // Highlight rides that arrived since the last refresh (not on first load).
      const ids = new Set(items.map((r) => r.id));
      if (seen.current) {
        const arrived = items.filter((r) => !seen.current!.has(r.id)).map((r) => r.id);
        if (arrived.length) setFresh((prev) => new Set([...prev, ...arrived]));
      }
      seen.current = ids;
    } catch (err) {
      handleError(err);
    }
  }, [filter, handleError]);

  useEffect(() => {
    seen.current = null;
    setFresh(new Set());
    load();
    const timer = setInterval(load, POLL_MS);
    return () => clearInterval(timer);
  }, [load]);

  const run = async (ride: Ride, task: () => Promise<unknown>) => {
    setBusy(ride.id);
    try {
      await task();
      setChoosing(null);
      await load();
    } catch (err) {
      handleError(err);
    } finally {
      setBusy(null);
    }
  };

  const act = async (ride: Ride, action: Action) => {
    if (action.status === 'accepted') {
      setDriverId(drivers[0]?.id ?? '');
      setChoosing(ride.id);
      return;
    }
    if (action.status === 'rejected') {
      const reason = window
        .prompt('Reason for rejecting this ride (the rider will see it):')
        ?.trim();
      if (!reason) return;
      await run(ride, () => setRideStatus(ride.id, 'rejected', { reason }));
      return;
    }
    if (action.status === 'cancelled') {
      if (!window.confirm(`Cancel ride ${ride.rideNumber}?`)) return;
      await run(ride, () => cancelRide(ride.id));
      return;
    }
    await run(ride, () => setRideStatus(ride.id, action.status));
  };

  const toggle = (id: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div>
      <div className="order-head" style={{ marginBottom: '1rem', alignItems: 'center' }}>
        <h1 style={{ fontSize: '1.4rem' }}>Rides</h1>
        <span className="muted" style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
          <RefreshCw size={14} />
          {updatedAt ? `Live — updated ${updatedAt.toLocaleTimeString()}` : 'Loading…'}
        </span>
      </div>

      <div className="chips">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            className={`chip ${filter === f.key ? 'active' : ''}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && <div className="error">{error}</div>}

      {rides.length === 0 && !error && (
        <div className="card muted">
          No rides here right now. New requests appear automatically.
        </div>
      )}

      <div className="grid">
        {rides.map((r) => (
          <div key={r.id} className={`card ${r.status === 'requested' ? 'order-new' : ''}`}>
            <div className="order-head">
              <div>
                <div
                  style={{ fontWeight: 700, fontSize: '1.1rem', display: 'flex', gap: '0.5rem' }}
                >
                  {r.rideNumber}
                  {fresh.has(r.id) && (
                    <span className="badge warn">
                      <Bell size={12} /> just arrived
                    </span>
                  )}
                </div>
                <div className="muted">Requested {new Date(r.createdAt).toLocaleString()}</div>
              </div>
              <span className={`badge ${STATUS_CLASS[r.status]}`}>{STATUS_LABEL[r.status]}</span>
            </div>

            <div className="grid-2" style={{ marginTop: '0.75rem' }}>
              <div className="route">
                <div>
                  <div className="label">Pickup</div>
                  <div style={{ fontWeight: 600 }}>{r.pickup.address}</div>
                </div>
                <div>
                  <div className="label">Drop</div>
                  <div style={{ fontWeight: 600 }}>{r.drop.address}</div>
                </div>
              </div>
              <div>
                <div className="label">Rider</div>
                <div style={{ fontWeight: 600 }}>{r.rider.name}</div>
                <div>
                  <a href={`tel:${r.rider.phone}`}>{formatPhone(r.rider.phone)}</a>
                </div>
                <div className="muted">
                  {r.scheduledAt
                    ? `Scheduled ${new Date(r.scheduledAt).toLocaleString()}`
                    : 'As soon as possible'}
                </div>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '0.75rem',
                gap: '1rem',
              }}
            >
              <span style={{ fontWeight: 700 }}>Estimated fare ₹{r.fareEstimate}</span>
              {r.driver && (
                <span>
                  {r.driver.name} · {r.driver.vehicle} · {r.driver.plate}
                </span>
              )}
            </div>

            {r.notes && (
              <div style={{ marginTop: '0.5rem' }}>
                <span className="label" style={{ display: 'inline' }}>
                  Notes:{' '}
                </span>
                {r.notes}
              </div>
            )}
            {r.rejectionReason && (
              <div className="muted" style={{ marginTop: '0.5rem' }}>
                Reason: {r.rejectionReason}
              </div>
            )}

            {choosing === r.id ? (
              <div className="ride-actions" style={{ alignItems: 'end' }}>
                <div style={{ flex: '1 1 14rem' }}>
                  <label className="label" htmlFor={`driver-${r.id}`}>
                    Assign driver
                  </label>
                  <select
                    id={`driver-${r.id}`}
                    className="input"
                    value={driverId}
                    onChange={(e) => setDriverId(e.target.value)}
                  >
                    {drivers.length === 0 && <option value="">No active drivers</option>}
                    {drivers.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} — {d.vehicle} ({d.plate})
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={!driverId || busy === r.id}
                  onClick={() => run(r, () => setRideStatus(r.id, 'accepted', { driverId }))}
                >
                  Confirm
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => setChoosing(null)}>
                  Back
                </button>
              </div>
            ) : (
              <div className="ride-actions">
                {ACTIONS[r.status].map((a) => (
                  <button
                    key={a.status}
                    type="button"
                    className={`btn btn-${a.kind}`}
                    disabled={busy === r.id}
                    onClick={() => act(r, a)}
                  >
                    {a.label}
                  </button>
                ))}
                <button type="button" className="btn btn-ghost" onClick={() => toggle(r.id)}>
                  {open.has(r.id) ? 'Hide history' : 'Status history'}
                </button>
              </div>
            )}

            {open.has(r.id) && (
              <div className="history">
                {r.statusHistory.map((h, i) => (
                  <div key={i}>
                    <strong>{STATUS_LABEL[h.status]}</strong>{' '}
                    <span className="muted">
                      {new Date(h.at).toLocaleString()}
                      {h.note ? ` — ${h.note}` : ''}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
