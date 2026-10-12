import React, { useMemo } from 'react';
import { AlertTriangle, ArrowRight, Banknote, ClipboardList, Hourglass, Truck } from 'lucide-react';
import { searchCatalog, type Order, type OrderStatus } from '../api';
import { Badge, BarChart, Button, Donut, EmptyState, KpiCard } from '../components/ui';
import { useLiveData } from '../hooks/useLiveData';
import { STATUS_COLOR, STATUS_LABEL } from '../orderMeta';
import { inr, isSameDay, lastDays, timeAgo } from '../utils';
import { LOW_STOCK } from './CatalogPage';

interface Props {
  orders: Order[] | null;
  onOpenOrder: (id: string) => void;
  onNavigate: (key: string) => void;
  onUnauthorized: () => void;
}

export const OverviewPage: React.FC<Props> = ({
  orders,
  onOpenOrder,
  onNavigate,
  onUnauthorized,
}) => {
  const catalog = useLiveData(() => searchCatalog(''), { intervalMs: 15000, onUnauthorized });

  const stats = useMemo(() => {
    const list = orders ?? [];
    const today = new Date();
    const todays = list.filter((o) => isSameDay(new Date(o.createdAt), today));
    const countBy = (s: OrderStatus) => list.filter((o) => o.status === s).length;
    const collected = list
      .filter((o) => o.status === 'delivered' && isSameDay(new Date(o.updatedAt), today))
      .reduce((sum, o) => sum + o.total, 0);
    const week = lastDays(7).map((d, i, arr) => ({
      label: d.label,
      value: list.filter((o) => isSameDay(new Date(o.createdAt), d.date)).length,
      highlight: i === arr.length - 1,
    }));
    return { list, todays: todays.length, countBy, collected, week };
  }, [orders]);

  const lowStock = (catalog.data?.items ?? [])
    .filter((i) => i.active && i.stockPacks <= LOW_STOCK)
    .sort((a, b) => a.stockPacks - b.stockPacks);
  const waiting = stats.list.filter((o) => o.status === 'placed');

  const statuses: OrderStatus[] = [
    'placed',
    'accepted',
    'packed',
    'out_for_delivery',
    'delivered',
    'rejected',
    'cancelled',
  ];

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
        <Button onClick={() => onNavigate('orders')}>
          View all orders <ArrowRight size={16} />
        </Button>
      </div>

      <div className="kpi-grid">
        <KpiCard
          label="Orders today"
          value={stats.todays}
          icon={<ClipboardList size={17} />}
          foot={`${stats.list.length} total on record`}
        />
        <KpiCard
          label="Awaiting acceptance"
          value={stats.countBy('placed')}
          tone="warning"
          icon={<Hourglass size={17} />}
          foot={stats.countBy('placed') ? 'Needs your action' : 'All caught up'}
        />
        <KpiCard
          label="Out for delivery"
          value={stats.countBy('out_for_delivery')}
          tone="info"
          icon={<Truck size={17} />}
          foot={`${stats.countBy('accepted') + stats.countBy('packed')} being prepared`}
        />
        <KpiCard
          label="Cash collected today"
          value={inr(stats.collected)}
          icon={<Banknote size={17} />}
          foot="From delivered orders (COD)"
        />
      </div>

      <div className="dash-grid">
        <div className="card">
          <div className="card-head">
            <h2>Orders, last 7 days</h2>
          </div>
          <div className="card-body">
            <BarChart data={stats.week} />
          </div>
        </div>
        <div className="card">
          <div className="card-head">
            <h2>Orders by status</h2>
          </div>
          <div className="card-body">
            <Donut
              centerLabel="orders"
              segments={statuses.map((s) => ({
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
            <h2>Needs action</h2>
            <Badge tone={waiting.length ? 'warning' : 'success'}>{waiting.length} new</Badge>
          </div>
          <div className="card-body">
            {waiting.length === 0 ? (
              <EmptyState
                icon={<ClipboardList size={20} />}
                title="No new orders"
                text="You're all caught up."
              />
            ) : (
              <div className="stack" style={{ gap: 4 }}>
                {waiting.slice(0, 5).map((o) => (
                  <div
                    key={o.id}
                    className="row-between"
                    style={{ padding: '8px 0', borderBottom: '1px solid var(--n-50)' }}
                  >
                    <div>
                      <div className="strong">{o.orderNumber}</div>
                      <div className="muted">
                        {o.customer.name} · {timeAgo(o.createdAt)}
                      </div>
                    </div>
                    <div className="row">
                      <span className="strong">{inr(o.total)}</span>
                      <Button size="sm" variant="secondary" onClick={() => onOpenOrder(o.id)}>
                        Review
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <h2>Stock alerts</h2>
            <Badge tone={lowStock.length ? 'danger' : 'success'}>{lowStock.length} items</Badge>
          </div>
          <div className="card-body">
            {lowStock.length === 0 ? (
              <EmptyState
                icon={<AlertTriangle size={20} />}
                title="Stock levels look good"
                text="Nothing is running low."
              />
            ) : (
              <div className="stack" style={{ gap: 4 }}>
                {lowStock.slice(0, 5).map((i) => (
                  <div
                    key={i.id}
                    className="row-between"
                    style={{ padding: '8px 0', borderBottom: '1px solid var(--n-50)' }}
                  >
                    <div>
                      <div className="strong">
                        {i.brand} {i.strength}
                      </div>
                      <div className="muted">{i.generic}</div>
                    </div>
                    <Badge tone={i.stockPacks === 0 ? 'danger' : 'warning'}>
                      {i.stockPacks === 0 ? 'Out of stock' : `${i.stockPacks} packs left`}
                    </Badge>
                  </div>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onNavigate('catalog')}
                  style={{ alignSelf: 'flex-start' }}
                >
                  Manage stock <ArrowRight size={14} />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
