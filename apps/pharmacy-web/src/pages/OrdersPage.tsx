import React, { useMemo, useState } from 'react';
import { Bell, ClipboardList, MapPin, Phone } from 'lucide-react';
import { setOrderStatus, type Order, type OrderStatus } from '../api';
import {
  Avatar,
  Badge,
  Button,
  DataTable,
  Drawer,
  EmptyState,
  ReasonModal,
  SearchInput,
  Steps,
  Tabs,
  useToast,
  type Column,
  type StepItem,
} from '../components/ui';
import { ACTIVE, FLOW, NEXT, STATUS_LABEL, STATUS_TONE, formatAddress } from '../orderMeta';
import { formatDateTime, formatPhone, inr, timeAgo } from '../utils';

const TABS: { key: string; label: string; match: (o: Order) => boolean }[] = [
  { key: 'active', label: 'Active', match: (o) => ACTIVE.includes(o.status) },
  { key: 'new', label: 'New', match: (o) => o.status === 'placed' },
  { key: 'delivered', label: 'Delivered', match: (o) => o.status === 'delivered' },
  {
    key: 'closed',
    label: 'Rejected / cancelled',
    match: (o) => o.status === 'rejected' || o.status === 'cancelled',
  },
  { key: 'all', label: 'All', match: () => true },
];

interface Props {
  orders: Order[] | null;
  loading: boolean;
  fresh: Set<string>;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onChanged: () => Promise<void>;
  onError: (err: unknown) => void;
}

export const OrdersPage: React.FC<Props> = ({
  orders,
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
  const [rejecting, setRejecting] = useState<Order | null>(null);

  const all = orders ?? [];
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const match = TABS.find((t) => t.key === tab)!.match;
    return all.filter(
      (o) =>
        match(o) &&
        (!q ||
          o.orderNumber.toLowerCase().includes(q) ||
          o.customer.name.toLowerCase().includes(q) ||
          o.customer.phone.includes(q) ||
          o.items.some((i) => `${i.brand} ${i.generic}`.toLowerCase().includes(q))),
    );
  }, [all, tab, query]);

  const selected = all.find((o) => o.id === selectedId) ?? null;

  const move = async (order: Order, status: OrderStatus, reason?: string) => {
    setBusy(true);
    try {
      await setOrderStatus(order.id, status, reason);
      await onChanged();
      toast.show('success', `${order.orderNumber} ${STATUS_LABEL[status].toLowerCase()}`);
    } catch (err) {
      onError(err);
    } finally {
      setBusy(false);
      setRejecting(null);
    }
  };

  const columns: Column<Order>[] = [
    {
      key: 'order',
      header: 'Order',
      render: (o) => (
        <div>
          <div className="strong row" style={{ gap: 8 }}>
            {o.orderNumber}
            {fresh.has(o.id) && (
              <Badge tone="warning" noDot>
                <Bell size={11} /> New
              </Badge>
            )}
          </div>
          <div className="muted">{timeAgo(o.createdAt)}</div>
        </div>
      ),
    },
    {
      key: 'customer',
      header: 'Customer',
      render: (o) => (
        <div className="row">
          <Avatar name={o.customer.name} size="sm" />
          <div>
            <div className="strong">{o.customer.name}</div>
            <div className="muted">{formatPhone(o.customer.phone)}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'items',
      header: 'Items',
      render: (o) => (
        <div>
          <div className="truncate" style={{ maxWidth: 240 }}>
            {o.items.map((i) => i.brand).join(', ')}
          </div>
          <div className="muted">
            {o.items.length} item{o.items.length === 1 ? '' : 's'}
          </div>
        </div>
      ),
    },
    {
      key: 'total',
      header: 'Total (COD)',
      align: 'right',
      render: (o) => <span className="strong">{inr(o.total)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (o) => <Badge tone={STATUS_TONE[o.status]}>{STATUS_LABEL[o.status]}</Badge>,
    },
  ];

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Orders</h1>
          <p>Incoming prescriptions and deliveries. New orders appear automatically.</p>
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
            placeholder="Search order, customer, medicine"
          />
        </div>
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(o) => o.id}
          loading={loading}
          selectedKey={selectedId}
          onRowClick={(o) => onSelect(o.id)}
          rowClass={(o) => (fresh.has(o.id) ? 'flash' : '')}
          empty={
            <EmptyState
              icon={<ClipboardList size={22} />}
              title={query ? 'No matching orders' : 'No orders here right now'}
              text={
                query
                  ? 'Try a different search.'
                  : 'New orders will show up as soon as they are placed.'
              }
            />
          }
        />
      </div>

      {selected && (
        <OrderDrawer
          order={selected}
          busy={busy}
          onClose={() => onSelect(null)}
          onMove={(s) => move(selected, s)}
          onReject={() => setRejecting(selected)}
        />
      )}
      {rejecting && (
        <ReasonModal
          title={`Reject ${rejecting.orderNumber}?`}
          description="The customer will see this reason. Reserved stock is released."
          confirmLabel="Reject order"
          onClose={() => setRejecting(null)}
          onConfirm={(reason) => move(rejecting, 'rejected', reason)}
        />
      )}
    </>
  );
};

const OrderDrawer: React.FC<{
  order: Order;
  busy: boolean;
  onClose: () => void;
  onMove: (s: OrderStatus) => void;
  onReject: () => void;
}> = ({ order: o, busy, onClose, onMove, onReject }) => {
  const next = NEXT[o.status];
  const canReject = o.status === 'placed' || o.status === 'accepted';
  const failed = o.status === 'rejected' || o.status === 'cancelled';

  const steps: StepItem[] = failed
    ? [
        { label: 'Order placed', at: formatDateTime(o.createdAt) },
        { label: STATUS_LABEL[o.status], at: formatDateTime(o.updatedAt), note: o.rejectionReason },
      ]
    : FLOW.map((s) => ({
        label: STATUS_LABEL[s].replace('New order', 'Order placed'),
        at:
          s === 'placed'
            ? formatDateTime(o.createdAt)
            : s === o.status
              ? formatDateTime(o.updatedAt)
              : undefined,
      }));
  const current = failed ? 1 : FLOW.indexOf(o.status);

  return (
    <Drawer
      title={o.orderNumber}
      subtitle={`Placed ${formatDateTime(o.createdAt)}`}
      onClose={onClose}
      footer={
        (next || canReject) && (
          <>
            {canReject && (
              <Button variant="danger" disabled={busy} onClick={onReject}>
                Reject
              </Button>
            )}
            {next && (
              <Button disabled={busy} onClick={() => onMove(next.status)}>
                {next.label}
              </Button>
            )}
          </>
        )
      }
    >
      <div className="row-between">
        <Badge tone={STATUS_TONE[o.status]}>{STATUS_LABEL[o.status]}</Badge>
        <Badge tone="neutral" noDot>
          Cash on delivery
        </Badge>
      </div>

      <section>
        <div className="section-title">Progress</div>
        <Steps steps={steps} current={current} failed={failed} />
      </section>

      <section>
        <div className="section-title">Customer</div>
        <div className="panel stack" style={{ gap: 10 }}>
          <div className="row">
            <Avatar name={o.customer.name} />
            <div className="strong">{o.customer.name}</div>
          </div>
          <div className="row muted">
            <Phone size={15} />
            <a href={`tel:${o.customer.phone}`}>{formatPhone(o.customer.phone)}</a>
          </div>
          <div className="row muted" style={{ alignItems: 'flex-start' }}>
            <MapPin size={15} style={{ marginTop: 3, flex: 'none' }} />
            <span>{formatAddress(o.customer.address)}</span>
          </div>
        </div>
      </section>

      <section>
        <div className="section-title">Items</div>
        <div className="panel stack" style={{ gap: 10 }}>
          {o.items.map((i) => (
            <div key={i.catalogId} className="row-between" style={{ alignItems: 'flex-start' }}>
              <div>
                <div className="strong">
                  {i.brand} {i.strength}
                </div>
                <div className="muted">
                  {i.generic} · {i.packs} × {i.packSize} {i.packUnit} @ {inr(i.pricePerPack)}
                </div>
              </div>
              <div className="strong">{inr(i.lineTotal)}</div>
            </div>
          ))}
          <div
            className="row-between"
            style={{ borderTop: '1px solid var(--n-100)', paddingTop: 10 }}
          >
            <span className="strong">Collect on delivery</span>
            <span className="strong" style={{ fontSize: '1.2rem' }}>
              {inr(o.total)}
            </span>
          </div>
        </div>
      </section>
    </Drawer>
  );
};
