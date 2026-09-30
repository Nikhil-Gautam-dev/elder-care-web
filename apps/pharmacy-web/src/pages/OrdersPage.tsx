import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Bell, RefreshCw } from 'lucide-react';
import { ApiError, listOrders, setOrderStatus, type Order, type OrderStatus } from '../api';

const POLL_MS = 5000;

const FILTERS: { key: string; label: string; status?: string }[] = [
  { key: 'active', label: 'Active', status: 'placed,accepted,packed,out_for_delivery' },
  { key: 'new', label: 'New', status: 'placed' },
  { key: 'delivered', label: 'Delivered', status: 'delivered' },
  { key: 'closed', label: 'Rejected / cancelled', status: 'rejected,cancelled' },
  { key: 'all', label: 'All' },
];

const STATUS_LABEL: Record<OrderStatus, string> = {
  placed: 'New order',
  accepted: 'Accepted',
  packed: 'Packed',
  out_for_delivery: 'Out for delivery',
  delivered: 'Delivered',
  rejected: 'Rejected',
  cancelled: 'Cancelled by customer',
};

const STATUS_CLASS: Record<OrderStatus, string> = {
  placed: 'warn',
  accepted: '',
  packed: '',
  out_for_delivery: '',
  delivered: 'ok',
  rejected: 'bad',
  cancelled: 'bad',
};

/** The one action that moves an order forward from each status. */
const NEXT: Partial<Record<OrderStatus, { status: OrderStatus; label: string }>> = {
  placed: { status: 'accepted', label: 'Accept order' },
  accepted: { status: 'packed', label: 'Mark as packed' },
  packed: { status: 'out_for_delivery', label: 'Out for delivery' },
  out_for_delivery: { status: 'delivered', label: 'Mark delivered (cash collected)' },
};

const formatAddress = (a: Order['customer']['address']) =>
  [a.line1, a.line2, a.city, a.state, a.postalCode].filter(Boolean).join(', ');

export const OrdersPage: React.FC<{ onUnauthorized: () => void }> = ({ onUnauthorized }) => {
  const [filter, setFilter] = useState('active');
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
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
      const { items } = await listOrders(FILTERS.find((f) => f.key === filter)?.status);
      setOrders(items);
      setUpdatedAt(new Date());
      setError(null);

      // Highlight orders that arrived since the last refresh (not on first load).
      const ids = new Set(items.map((o) => o.id));
      if (seen.current) {
        const arrived = items.filter((o) => !seen.current!.has(o.id)).map((o) => o.id);
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

  const move = async (order: Order, status: OrderStatus) => {
    let reason: string | undefined;
    if (status === 'rejected') {
      reason = window.prompt('Reason for rejecting this order (the customer will see it):')?.trim();
      if (!reason) return;
    }
    setBusy(order.id);
    try {
      await setOrderStatus(order.id, status, reason);
      await load();
    } catch (err) {
      handleError(err);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div>
      <div className="order-head" style={{ marginBottom: '1rem', alignItems: 'center' }}>
        <h1 style={{ fontSize: '1.4rem' }}>Orders</h1>
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

      {orders.length === 0 && !error && (
        <div className="card muted">No orders here right now. New orders appear automatically.</div>
      )}

      <div className="grid">
        {orders.map((o) => {
          const next = NEXT[o.status];
          const canReject = o.status === 'placed' || o.status === 'accepted';
          return (
            <div key={o.id} className={`card ${o.status === 'placed' ? 'order-new' : ''}`}>
              <div className="order-head">
                <div>
                  <div
                    style={{ fontWeight: 700, fontSize: '1.05rem', display: 'flex', gap: '0.5rem' }}
                  >
                    {o.orderNumber}
                    {fresh.has(o.id) && (
                      <span className="badge warn">
                        <Bell size={12} /> just arrived
                      </span>
                    )}
                  </div>
                  <div className="muted">{new Date(o.createdAt).toLocaleString()}</div>
                </div>
                <span className={`badge ${STATUS_CLASS[o.status]}`}>{STATUS_LABEL[o.status]}</span>
              </div>

              <div className="grid-2" style={{ marginTop: '0.75rem' }}>
                <div>
                  <div className="label">Customer</div>
                  <div style={{ fontWeight: 600 }}>{o.customer.name}</div>
                  <div>{o.customer.phone.replace(/^\+91(\d{5})(\d{5})$/, '+91 $1 $2')}</div>
                  <div className="muted">{formatAddress(o.customer.address)}</div>
                </div>
                <div>
                  <div className="label">Items</div>
                  {o.items.map((i) => (
                    <div
                      key={i.catalogId}
                      style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}
                    >
                      <span>
                        {i.brand} {i.strength} <span className="muted">({i.generic})</span>
                        <br />
                        <span className="muted">
                          {i.packs} × {i.packSize} {i.packUnit}
                        </span>
                      </span>
                      <span>₹{i.lineTotal}</span>
                    </div>
                  ))}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      borderTop: '1px solid var(--border)',
                      marginTop: '0.4rem',
                      paddingTop: '0.4rem',
                      fontWeight: 700,
                    }}
                  >
                    <span>Collect on delivery</span>
                    <span>₹{o.total}</span>
                  </div>
                </div>
              </div>

              {o.rejectionReason && (
                <div className="muted" style={{ marginTop: '0.5rem' }}>
                  Reason: {o.rejectionReason}
                </div>
              )}

              {(next || canReject) && (
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.9rem' }}>
                  {next && (
                    <button
                      type="button"
                      className="btn btn-primary"
                      disabled={busy === o.id}
                      onClick={() => move(o, next.status)}
                    >
                      {next.label}
                    </button>
                  )}
                  {canReject && (
                    <button
                      type="button"
                      className="btn btn-danger"
                      disabled={busy === o.id}
                      onClick={() => move(o, 'rejected')}
                    >
                      Reject
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
