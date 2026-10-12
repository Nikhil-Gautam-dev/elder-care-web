import React, { useMemo, useState } from 'react';
import { ArrowRight, Bell, Car, MapPin, Phone, StickyNote } from 'lucide-react';
import { cancelRide, setRideStatus, type Driver, type Ride, type RideStatus } from '../api';
import {
  Avatar,
  Badge,
  Button,
  ConfirmModal,
  DataTable,
  Drawer,
  EmptyState,
  Field,
  ReasonModal,
  SearchInput,
  Steps,
  Tabs,
  useToast,
  type Column,
  type StepItem,
} from '../components/ui';
import {
  ACTIONS,
  ACTIVE,
  FLOW,
  ON_TRIP,
  STATUS_LABEL,
  STATUS_TONE,
  whenLabel,
  type Action,
} from '../rideMeta';
import { formatDateTime, formatPhone, inr, timeAgo } from '../utils';

const TABS: { key: string; label: string; match: (r: Ride) => boolean }[] = [
  { key: 'active', label: 'Active', match: (r) => ACTIVE.includes(r.status) },
  { key: 'new', label: 'New', match: (r) => r.status === 'requested' },
  { key: 'completed', label: 'Completed', match: (r) => r.status === 'completed' },
  {
    key: 'closed',
    label: 'Rejected / cancelled',
    match: (r) => r.status === 'rejected' || r.status === 'cancelled',
  },
  { key: 'all', label: 'All', match: () => true },
];

interface Props {
  rides: Ride[] | null;
  drivers: Driver[];
  loading: boolean;
  fresh: Set<string>;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onChanged: () => Promise<void>;
  onError: (err: unknown) => void;
}

export const RidesPage: React.FC<Props> = ({
  rides,
  drivers,
  loading,
  fresh,
  selectedId,
  onSelect,
  onChanged,
  onError,
}) => {
  const toast = useToast();
  const [tab, setTab] = useState('active');
  const [query, setQuery] = useState('');
  const [busy, setBusy] = useState(false);
  const [rejecting, setRejecting] = useState<Ride | null>(null);
  const [cancelling, setCancelling] = useState<Ride | null>(null);

  const all = rides ?? [];
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const match = TABS.find((t) => t.key === tab)!.match;
    return all.filter(
      (r) =>
        match(r) &&
        (!q ||
          r.rideNumber.toLowerCase().includes(q) ||
          r.rider.name.toLowerCase().includes(q) ||
          r.rider.phone.includes(q) ||
          r.pickup.address.toLowerCase().includes(q) ||
          r.drop.address.toLowerCase().includes(q) ||
          (r.driver?.name.toLowerCase().includes(q) ?? false)),
    );
  }, [all, tab, query]);

  const selected = all.find((r) => r.id === selectedId) ?? null;

  const run = async (ride: Ride, task: () => Promise<unknown>, message: string) => {
    setBusy(true);
    try {
      await task();
      await onChanged();
      toast.show('success', `${ride.rideNumber} ${message}`);
    } catch (err) {
      onError(err);
    } finally {
      setBusy(false);
      setRejecting(null);
      setCancelling(null);
    }
  };

  const act = (ride: Ride, action: Action, driverId: string) => {
    if (action.status === 'rejected') return setRejecting(ride);
    if (action.status === 'cancelled') return setCancelling(ride);
    const extra = action.status === 'accepted' ? { driverId } : {};
    return run(
      ride,
      () => setRideStatus(ride.id, action.status, extra),
      STATUS_LABEL[action.status].toLowerCase(),
    );
  };

  const columns: Column<Ride>[] = [
    {
      key: 'ride',
      header: 'Ride',
      render: (r) => (
        <div>
          <div className="strong row" style={{ gap: 8 }}>
            {r.rideNumber}
            {fresh.has(r.id) && (
              <Badge tone="warning" noDot>
                <Bell size={11} /> New
              </Badge>
            )}
          </div>
          <div className="muted">{timeAgo(r.createdAt)}</div>
        </div>
      ),
    },
    {
      key: 'rider',
      header: 'Rider',
      render: (r) => (
        <div className="row">
          <Avatar name={r.rider.name} size="sm" />
          <div>
            <div className="strong">{r.rider.name}</div>
            <div className="muted">{formatPhone(r.rider.phone)}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'route',
      header: 'Route',
      render: (r) => (
        <div className="row" style={{ gap: 6 }}>
          <span className="truncate" style={{ maxWidth: 120 }} title={r.pickup.address}>
            {r.pickup.address}
          </span>
          <ArrowRight size={14} style={{ flex: 'none', color: 'var(--n-400)' }} />
          <span className="truncate" style={{ maxWidth: 120 }} title={r.drop.address}>
            {r.drop.address}
          </span>
        </div>
      ),
    },
    { key: 'when', header: 'Pickup', render: (r) => whenLabel(r) },
    {
      key: 'fare',
      header: 'Fare',
      align: 'right',
      render: (r) => <span className="strong">{inr(r.fareEstimate)}</span>,
    },
    {
      key: 'driver',
      header: 'Driver',
      render: (r) =>
        r.driver ? (
          <div className="row">
            <Avatar name={r.driver.name} size="sm" />
            <span>{r.driver.name}</span>
          </div>
        ) : (
          <span className="muted">Unassigned</span>
        ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) => <Badge tone={STATUS_TONE[r.status]}>{STATUS_LABEL[r.status]}</Badge>,
    },
  ];

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Rides</h1>
          <p>Ride requests from families. New requests appear automatically.</p>
        </div>
      </div>

      <div className="card">
        <div className="toolbar">
          <Tabs
            active={tab}
            onChange={setTab}
            items={TABS.map((t) => ({
              key: t.key,
              label: t.label,
              count: all.filter(t.match).length,
            }))}
          />
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search ride, rider, place, driver"
          />
        </div>
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(r) => r.id}
          loading={loading}
          selectedKey={selectedId}
          onRowClick={(r) => onSelect(r.id)}
          rowClass={(r) => (fresh.has(r.id) ? 'flash' : '')}
          empty={
            <EmptyState
              icon={<Car size={22} />}
              title={query ? 'No matching rides' : 'No rides here right now'}
              text={
                query
                  ? 'Try a different search.'
                  : 'New requests will show up as soon as they are booked.'
              }
            />
          }
        />
      </div>

      {selected && (
        <RideDrawer
          key={selected.id}
          ride={selected}
          rides={all}
          drivers={drivers}
          busy={busy}
          onClose={() => onSelect(null)}
          onAct={act}
        />
      )}
      {rejecting && (
        <ReasonModal
          title={`Reject ${rejecting.rideNumber}?`}
          description="The rider will see this reason."
          confirmLabel="Reject ride"
          onClose={() => setRejecting(null)}
          onConfirm={(reason) =>
            run(rejecting, () => setRideStatus(rejecting.id, 'rejected', { reason }), 'rejected')
          }
        />
      )}
      {cancelling && (
        <ConfirmModal
          title={`Cancel ${cancelling.rideNumber}?`}
          description="The rider and their family will be notified that this ride was cancelled."
          confirmLabel="Cancel ride"
          onClose={() => setCancelling(null)}
          onConfirm={() => run(cancelling, () => cancelRide(cancelling.id), 'cancelled')}
        />
      )}
    </>
  );
};

const RideDrawer: React.FC<{
  ride: Ride;
  rides: Ride[];
  drivers: Driver[];
  busy: boolean;
  onClose: () => void;
  onAct: (ride: Ride, action: Action, driverId: string) => void;
}> = ({ ride: r, rides, drivers, busy, onClose, onAct }) => {
  const busyDrivers = new Set(
    rides.filter((x) => ON_TRIP.includes(x.status) && x.driver).map((x) => x.driver!.id),
  );
  const [driverId, setDriverId] = useState(
    (drivers.find((d) => !busyDrivers.has(d.id)) ?? drivers[0])?.id ?? '',
  );
  const actions = ACTIONS[r.status];
  const failed = r.status === 'rejected' || r.status === 'cancelled';

  const stamp = (status: RideStatus) => {
    const h = [...r.statusHistory].reverse().find((e) => e.status === status);
    return h ? { at: formatDateTime(h.at), note: h.note } : {};
  };
  const steps: StepItem[] = failed
    ? r.statusHistory.map((h) => ({
        label: STATUS_LABEL[h.status],
        at: formatDateTime(h.at),
        note: h.note ?? (h.status === r.status ? r.rejectionReason : undefined),
      }))
    : FLOW.map((s) => ({
        label: s === 'requested' ? 'Ride requested' : STATUS_LABEL[s],
        ...stamp(s),
      }));
  const current = failed ? Math.max(steps.length - 1, 0) : FLOW.indexOf(r.status);
  const accepting = r.status === 'requested';

  return (
    <Drawer
      title={r.rideNumber}
      subtitle={`Requested ${formatDateTime(r.createdAt)}`}
      onClose={onClose}
      footer={
        actions.length > 0 && (
          <>
            {actions
              .filter((a) => a.kind === 'danger')
              .map((a) => (
                <Button
                  key={a.status}
                  variant="danger"
                  disabled={busy}
                  onClick={() => onAct(r, a, driverId)}
                >
                  {a.label}
                </Button>
              ))}
            {actions
              .filter((a) => a.kind === 'primary')
              .map((a) => (
                <Button
                  key={a.status}
                  disabled={busy || (a.status === 'accepted' && !driverId)}
                  onClick={() => onAct(r, a, driverId)}
                >
                  {a.label}
                </Button>
              ))}
          </>
        )
      }
    >
      <div className="row-between">
        <Badge tone={STATUS_TONE[r.status]}>{STATUS_LABEL[r.status]}</Badge>
        <span className="strong" style={{ fontSize: '1.2rem' }}>
          {inr(r.fareEstimate)}{' '}
          <span className="muted" style={{ fontSize: '0.86rem', fontWeight: 400 }}>
            est. fare
          </span>
        </span>
      </div>

      {accepting && (
        <section className="panel">
          <Field
            label="Assign driver"
            htmlFor="driver"
            hint={
              drivers.length === 0 ? 'Add an active driver on the Drivers page first.' : undefined
            }
          >
            <select
              id="driver"
              className="select"
              value={driverId}
              onChange={(e) => setDriverId(e.target.value)}
            >
              {drivers.length === 0 && <option value="">No active drivers</option>}
              {drivers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} · {d.vehicle} ({d.plate}){busyDrivers.has(d.id) ? ' · on a ride' : ''}
                </option>
              ))}
            </select>
          </Field>
        </section>
      )}

      <section>
        <div className="section-title">Route</div>
        <div className="panel stack" style={{ gap: 14 }}>
          <div className="row" style={{ alignItems: 'flex-start' }}>
            <MapPin size={16} style={{ marginTop: 3, color: 'var(--accent-600)', flex: 'none' }} />
            <div>
              <div className="muted">Pickup · {whenLabel(r)}</div>
              <div className="strong">{r.pickup.address}</div>
            </div>
          </div>
          <div className="row" style={{ alignItems: 'flex-start' }}>
            <MapPin size={16} style={{ marginTop: 3, color: 'var(--danger-dot)', flex: 'none' }} />
            <div>
              <div className="muted">Drop</div>
              <div className="strong">{r.drop.address}</div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="section-title">Progress</div>
        <Steps steps={steps} current={current} failed={failed} />
      </section>

      <section>
        <div className="section-title">Rider</div>
        <div className="panel stack" style={{ gap: 10 }}>
          <div className="row">
            <Avatar name={r.rider.name} />
            <div className="strong">{r.rider.name}</div>
          </div>
          <div className="row muted">
            <Phone size={15} />
            <a href={`tel:${r.rider.phone}`}>{formatPhone(r.rider.phone)}</a>
          </div>
          {r.notes && (
            <div className="row muted" style={{ alignItems: 'flex-start' }}>
              <StickyNote size={15} style={{ marginTop: 3, flex: 'none' }} />
              <span>{r.notes}</span>
            </div>
          )}
        </div>
      </section>

      {r.driver && (
        <section>
          <div className="section-title">Driver</div>
          <div className="panel row">
            <Avatar name={r.driver.name} />
            <div>
              <div className="strong">{r.driver.name}</div>
              <div className="muted">
                {r.driver.vehicle} · <span className="mono">{r.driver.plate}</span>
              </div>
            </div>
          </div>
        </section>
      )}
    </Drawer>
  );
};
