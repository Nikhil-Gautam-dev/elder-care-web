import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Mic, Pill, Car, Users, Package, AlertTriangle } from 'lucide-react';
import type { IMedicationView, IPharmacyOrder } from '@eldercare/shared';
import { useAuth } from '../context/AuthContext';
import {
  listDoses,
  listMedications,
  listPharmacyOrders,
  listRides,
  type RideRecord,
} from '../services/api';
import { EmptyState, ErrorState, StatusBadge } from '../components/ui';
import { doseProgress, formatWhen, ORDER_LABEL, RIDE_LABEL } from '../utils/careStatus';

interface MedRow {
  med: IMedicationView;
  recorded: number;
  expected: number;
  asNeeded: boolean;
}

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
};

const firstName = (name?: string) => name?.trim().split(/\s+/)[0] || 'there';

type Section<T> = { loading: boolean; error: string | null; data: T };

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [meds, setMeds] = useState<Section<MedRow[]>>({ loading: true, error: null, data: [] });
  const [rides, setRides] = useState<Section<RideRecord[]>>({
    loading: true,
    error: null,
    data: [],
  });
  const [orders, setOrders] = useState<Section<IPharmacyOrder[]>>({
    loading: true,
    error: null,
    data: [],
  });

  const loadMeds = useCallback(async () => {
    setMeds((s) => ({ ...s, loading: true, error: null }));
    try {
      const { items } = await listMedications();
      const rows = await Promise.all(
        items.map(async (med) => {
          // A failed dose lookup must not claim "nothing recorded"; show the schedule only.
          const doses = await listDoses(med._id, 10).catch(() => null);
          return { med, doses };
        }),
      );
      setMeds({
        loading: false,
        error: null,
        data: rows.map(({ med, doses }) => ({
          med,
          ...(doses
            ? doseProgress(med, doses)
            : { recorded: -1, expected: 0, asNeeded: med.schedule.asNeeded }),
        })),
      });
    } catch (e) {
      setMeds({ loading: false, error: (e as Error).message, data: [] });
    }
  }, []);

  const loadRides = useCallback(() => {
    setRides((s) => ({ ...s, loading: true, error: null }));
    listRides()
      .then((data) => setRides({ loading: false, error: null, data }))
      .catch((e: Error) => setRides({ loading: false, error: e.message, data: [] }));
  }, []);

  const loadOrders = useCallback(() => {
    setOrders((s) => ({ ...s, loading: true, error: null }));
    listPharmacyOrders()
      .then((data) => setOrders({ loading: false, error: null, data }))
      .catch((e: Error) => setOrders({ loading: false, error: e.message, data: [] }));
  }, []);

  useEffect(() => {
    void loadMeds();
    loadRides();
    loadOrders();
  }, [loadMeds, loadRides, loadOrders]);

  const refillAlerts = meds.data.filter((r) => r.med.supplyStatus.needsRefill);
  const ride = rides.data[0];
  const order = orders.data[0];

  return (
    <div>
      <section className="card hero" aria-labelledby="home-title">
        <h1 id="home-title">
          {greeting()}, {firstName(user?.name)}.
        </h1>
        <p>I&apos;m here to help. What would you like to do today?</p>
        <Link to="/assistant" className="mic-cta">
          <span className="mic-disc" aria-hidden="true">
            <Mic size={40} />
          </span>
          Talk to ElderCare
          <small>Speak or type, whichever you prefer</small>
        </Link>
      </section>

      <h2 className="section-title">Your day at a glance</h2>
      <section className="card" aria-label="Your day at a glance">
        <ul className="glance-list">
          {refillAlerts.length > 0 && (
            <li className="glance-row" style={{ background: 'var(--warning-light)' }}>
              <span className="glance-icon" style={{ color: 'var(--warning)' }}>
                <AlertTriangle size={22} aria-hidden="true" />
              </span>
              <div className="glance-body">
                <div className="glance-title">Running low</div>
                <div className="glance-sub">
                  {refillAlerts.map((r) => r.med.name).join(', ')}.{' '}
                  <Link to="/medications" style={{ color: 'var(--primary)', fontWeight: 600 }}>
                    Review medicines
                  </Link>
                </div>
              </div>
            </li>
          )}

          <li className="glance-row">
            <span className="glance-icon">
              <Pill size={22} aria-hidden="true" />
            </span>
            <div className="glance-body">
              <div className="glance-title">Medicines today</div>
              {meds.loading ? (
                <div className="glance-sub">Checking your medicines…</div>
              ) : meds.error ? (
                <ErrorState message="We couldn't load your medicines." onRetry={loadMeds} />
              ) : meds.data.length === 0 ? (
                <EmptyState
                  title="No medicines added yet"
                  action={
                    <Link to="/medications" className="btn btn-primary">
                      Add a medicine
                    </Link>
                  }
                />
              ) : (
                <ul style={{ listStyle: 'none', marginTop: 'var(--space-2)' }}>
                  {meds.data.map(({ med, recorded, expected, asNeeded }) => (
                    <li
                      key={med._id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: 'var(--space-3)',
                        flexWrap: 'wrap',
                        padding: 'var(--space-1) 0',
                      }}
                    >
                      <span>
                        {med.name} {med.strength}
                      </span>
                      {asNeeded ? (
                        <StatusBadge status="neutral">Only when needed</StatusBadge>
                      ) : recorded < 0 ? (
                        <StatusBadge status="neutral">{expected || med.summary}</StatusBadge>
                      ) : recorded >= expected ? (
                        <StatusBadge status="success">Recorded as taken today</StatusBadge>
                      ) : (
                        <StatusBadge status="pending">
                          {recorded} of {expected} recorded today
                        </StatusBadge>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </li>

          <li className="glance-row">
            <span className="glance-icon">
              <Car size={22} aria-hidden="true" />
            </span>
            <div className="glance-body">
              <div className="glance-title">Latest ride</div>
              {rides.loading ? (
                <div className="glance-sub">Checking your rides…</div>
              ) : rides.error ? (
                <ErrorState message="We couldn't load your rides." onRetry={loadRides} />
              ) : !ride ? (
                <EmptyState
                  title="No rides booked yet"
                  action={
                    <Link to="/assistant?ask=Book a ride" className="btn btn-primary">
                      Book a ride
                    </Link>
                  }
                />
              ) : (
                <>
                  <div className="glance-sub">
                    {formatWhen(ride.scheduledAt ?? ride.createdAt)} · to {ride.drop}
                  </div>
                  <div style={{ marginTop: 'var(--space-2)' }}>
                    <StatusBadge status={RIDE_LABEL[ride.status].status}>
                      {RIDE_LABEL[ride.status].text}
                    </StatusBadge>
                  </div>
                  <div className="glance-sub" style={{ marginTop: 'var(--space-1)' }}>
                    Last known status. Ask ElderCare to check for an update.
                  </div>
                </>
              )}
            </div>
          </li>

          <li className="glance-row">
            <span className="glance-icon">
              <Package size={22} aria-hidden="true" />
            </span>
            <div className="glance-body">
              <div className="glance-title">Latest medicine order</div>
              {orders.loading ? (
                <div className="glance-sub">Checking your orders…</div>
              ) : orders.error ? (
                <ErrorState message="We couldn't load your orders." onRetry={loadOrders} />
              ) : !order ? (
                <div className="glance-sub">No medicine orders yet.</div>
              ) : (
                <>
                  <div className="glance-sub">
                    Order {order.orderNumber} · {order.items.map((i) => i.brand).join(', ')}
                  </div>
                  <div style={{ marginTop: 'var(--space-2)' }}>
                    <StatusBadge status={ORDER_LABEL[order.status].status}>
                      {ORDER_LABEL[order.status].text}
                    </StatusBadge>
                  </div>
                </>
              )}
            </div>
          </li>
        </ul>
      </section>

      <h2 className="section-title">Quick actions</h2>
      <nav className="shortcut-grid" aria-label="Quick actions">
        <Link to="/medications" className="shortcut">
          <Pill size={26} color="var(--primary)" aria-hidden="true" />
          Medicines
        </Link>
        <Link to="/assistant?ask=Book a ride" className="shortcut">
          <Car size={26} color="var(--primary)" aria-hidden="true" />
          Book a ride
        </Link>
        <Link to="/family" className="shortcut">
          <Users size={26} color="var(--primary)" aria-hidden="true" />
          My family
        </Link>
      </nav>
    </div>
  );
};
