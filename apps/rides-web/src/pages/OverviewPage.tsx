import React, { useMemo } from 'react';
import { ArrowRight, Banknote, CarFront, CheckCircle2, Hourglass, Users } from 'lucide-react';
import type { Driver, Ride, RideStatus } from '../api';
import { Avatar, Badge, BarChart, Button, Donut, EmptyState, KpiCard } from '../components/ui';
import { ACTIVE, ON_TRIP, STATUS_COLOR, STATUS_LABEL, whenLabel } from '../rideMeta';
import { inr, isSameDay, lastDays, timeAgo } from '../utils';

interface Props {
  rides: Ride[] | null;
  drivers: Driver[];
  onOpenRide: (id: string) => void;
  onNavigate: (key: string) => void;
}

const STATUSES: RideStatus[] = [
  'requested',
  'accepted',
  'arriving',
  'in_progress',
  'completed',
  'rejected',
  'cancelled',
];

export const OverviewPage: React.FC<Props> = ({ rides, drivers, onOpenRide, onNavigate }) => {
  const list = useMemo(() => rides ?? [], [rides]);

  const stats = useMemo(() => {
    const today = new Date();
    const countBy = (s: RideStatus) => list.filter((r) => r.status === s).length;
    const doneToday = list.filter(
      (r) => r.status === 'completed' && isSameDay(new Date(r.updatedAt), today),
    );
    const week = lastDays(7).map((d, i, arr) => ({
      label: d.label,
      value: list.filter((r) => isSameDay(new Date(r.createdAt), d.date)).length,
      highlight: i === arr.length - 1,
    }));
    return {
      countBy,
      active: list.filter((r) => ACTIVE.includes(r.status)).length,
      doneToday: doneToday.length,
      fare: doneToday.reduce((sum, r) => sum + r.fareEstimate, 0),
      week,
    };
  }, [list]);

  const onTrip = new Map(
    list.filter((r) => ON_TRIP.includes(r.status) && r.driver).map((r) => [r.driver!.id, r]),
  );
  const active = drivers.filter((d) => d.active);
  const free = active.filter((d) => !onTrip.has(d.id));
  const queue = list.filter((r) => r.status === 'requested');

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Overview</h1>
          <p>
            Today at a glance,{' '}
            {new Date().toLocaleDateString('en-IN', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
            .
          </p>
        </div>
        <Button onClick={() => onNavigate('rides')}>
          View all rides <ArrowRight size={16} />
        </Button>
      </div>

      <div className="kpi-grid">
        <KpiCard
          label="Active rides"
          value={stats.active}
          icon={<CarFront size={17} />}
          foot={`${stats.countBy('in_progress')} on the road now`}
        />
        <KpiCard
          label="Awaiting dispatch"
          value={queue.length}
          tone="warning"
          icon={<Hourglass size={17} />}
          foot={queue.length ? 'Needs a driver' : 'All caught up'}
        />
        <KpiCard
          label="Completed today"
          value={stats.doneToday}
          tone="info"
          icon={<CheckCircle2 size={17} />}
          foot={`${inr(stats.fare)} in fares`}
        />
        <KpiCard
          label="Drivers available"
          value={`${free.length} / ${active.length}`}
          icon={<Users size={17} />}
          foot={`${onTrip.size} currently on a ride`}
        />
      </div>

      <div className="dash-grid">
        <div className="card">
          <div className="card-head">
            <h2>Rides, last 7 days</h2>
          </div>
          <div className="card-body">
            <BarChart data={stats.week} />
          </div>
        </div>
        <div className="card">
          <div className="card-head">
            <h2>Rides by status</h2>
          </div>
          <div className="card-body">
            <Donut
              centerLabel="rides"
              segments={STATUSES.map((s) => ({
                label: STATUS_LABEL[s],
                value: stats.countBy(s),
                color: STATUS_COLOR[s],
              }))}
            />
          </div>
        </div>
      </div>

      <div className="dash-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="card">
          <div className="card-head">
            <h2>Dispatch queue</h2>
            <Badge tone={queue.length ? 'warning' : 'success'}>{queue.length} new</Badge>
          </div>
          <div className="card-body">
            {queue.length === 0 ? (
              <EmptyState
                icon={<Banknote size={20} />}
                title="No pending requests"
                text="You're all caught up."
              />
            ) : (
              <div className="stack" style={{ gap: 4 }}>
                {queue.slice(0, 5).map((r) => (
                  <div
                    key={r.id}
                    className="row-between"
                    style={{ padding: '8px 0', borderBottom: '1px solid var(--n-50)' }}
                  >
                    <div className="grow">
                      <div className="strong">
                        {r.rideNumber} <span className="muted">· {r.rider.name}</span>
                      </div>
                      <div className="muted truncate">
                        {r.drop.address} · {whenLabel(r)} · {timeAgo(r.createdAt)}
                      </div>
                    </div>
                    <Button size="sm" variant="secondary" onClick={() => onOpenRide(r.id)}>
                      Assign
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <h2>Driver availability</h2>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('drivers')}>
              Manage <ArrowRight size={14} />
            </Button>
          </div>
          <div className="card-body">
            {active.length === 0 ? (
              <EmptyState
                icon={<Users size={20} />}
                title="No active drivers"
                text="Add a driver to accept rides."
              />
            ) : (
              <div className="stack" style={{ gap: 4 }}>
                {active.slice(0, 6).map((d) => (
                  <div
                    key={d.id}
                    className="row-between"
                    style={{ padding: '8px 0', borderBottom: '1px solid var(--n-50)' }}
                  >
                    <div className="row">
                      <Avatar name={d.name} size="sm" />
                      <div>
                        <div className="strong">{d.name}</div>
                        <div className="muted">
                          {d.vehicle} · {d.plate}
                        </div>
                      </div>
                    </div>
                    {onTrip.has(d.id) ? (
                      <Badge tone="info">On {onTrip.get(d.id)!.rideNumber}</Badge>
                    ) : (
                      <Badge tone="success">Available</Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
