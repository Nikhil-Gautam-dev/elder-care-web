import React from 'react';
import { Check, X } from 'lucide-react';

/* ---------- Badge / avatar ---------- */
export type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'accent';

export const Badge: React.FC<{ tone?: Tone; children: React.ReactNode; noDot?: boolean }> = ({
  tone = 'neutral',
  children,
  noDot,
}) => (
  <span className={`badge ${tone === 'neutral' ? '' : tone} ${noDot ? 'nodot' : ''}`}>
    {children}
  </span>
);

export const Avatar: React.FC<{ name: string; size?: 'sm' | 'md' | 'lg' }> = ({
  name,
  size = 'md',
}) => {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join('');
  return <span className={`avatar ${size === 'md' ? '' : size}`}>{initials || '?'}</span>;
};

/* ---------- Tabs ---------- */
export interface TabItem {
  key: string;
  label: string;
  count?: number;
}

export const Tabs: React.FC<{
  items: TabItem[];
  active: string;
  onChange: (key: string) => void;
}> = ({ items, active, onChange }) => (
  <div className="tabs" role="tablist">
    {items.map((t) => (
      <button
        key={t.key}
        type="button"
        role="tab"
        aria-selected={active === t.key}
        className={`tab ${active === t.key ? 'active' : ''}`}
        onClick={() => onChange(t.key)}
      >
        {t.label}
        {t.count !== undefined && <span className="n">{t.count}</span>}
      </button>
    ))}
  </div>
);

/* ---------- Data table ---------- */
export interface Column<T> {
  key: string;
  header: React.ReactNode;
  render: (row: T) => React.ReactNode;
  width?: string;
  align?: 'right';
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  loading?: boolean;
  empty: React.ReactNode;
  onRowClick?: (row: T) => void;
  selectedKey?: string | null;
  rowClass?: (row: T) => string;
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  loading,
  empty,
  onRowClick,
  selectedKey,
  rowClass,
}: DataTableProps<T>) {
  if (!loading && rows.length === 0) return <>{empty}</>;
  return (
    <div className="table-wrap">
      <table className="dt">
        <thead>
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                style={{ width: c.width }}
                className={c.align === 'right' ? 'right' : ''}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading
            ? Array.from({ length: 5 }, (_, i) => (
                <tr key={i}>
                  {columns.map((c) => (
                    <td key={c.key}>
                      <span className="skeleton" style={{ width: `${55 + ((i * 13) % 35)}%` }} />
                    </td>
                  ))}
                </tr>
              ))
            : rows.map((row) => {
                const key = rowKey(row);
                const cls = [
                  onRowClick ? 'clickable' : '',
                  selectedKey === key ? 'selected' : '',
                  rowClass?.(row) ?? '',
                ].join(' ');
                return (
                  <tr key={key} className={cls} onClick={onRowClick && (() => onRowClick(row))}>
                    {columns.map((c) => (
                      <td key={c.key} className={c.align === 'right' ? 'right' : ''}>
                        {c.render(row)}
                      </td>
                    ))}
                  </tr>
                );
              })}
        </tbody>
      </table>
    </div>
  );
}

export const EmptyState: React.FC<{
  icon: React.ReactNode;
  title: string;
  text: string;
}> = ({ icon, title, text }) => (
  <div className="empty">
    <div className="ico">{icon}</div>
    <h3>{title}</h3>
    <div>{text}</div>
  </div>
);

/* ---------- KPI + charts ---------- */
export const KpiCard: React.FC<{
  label: string;
  value: React.ReactNode;
  foot?: React.ReactNode;
  icon: React.ReactNode;
  tone?: 'accent' | 'warning' | 'danger' | 'info';
}> = ({ label, value, foot, icon, tone = 'accent' }) => (
  <div className="card kpi">
    <div className="kpi-top">
      <span>{label}</span>
      <span className={`kpi-icon ${tone === 'accent' ? '' : tone}`}>{icon}</span>
    </div>
    <div className="kpi-value">{value}</div>
    {foot && <div className="kpi-foot">{foot}</div>}
  </div>
);

export const BarChart: React.FC<{
  data: { label: string; value: number; highlight?: boolean }[];
  format?: (n: number) => string;
  height?: number;
}> = ({ data, format = String, height = 200 }) => {
  const w = 560;
  const padTop = 22;
  const padBottom = 26;
  const max = Math.max(1, ...data.map((d) => d.value));
  const slot = w / data.length;
  const barW = Math.min(44, slot * 0.56);
  const plotH = height - padTop - padBottom;
  return (
    <svg viewBox={`0 0 ${w} ${height}`} width="100%" role="img" aria-label="Bar chart">
      {[0.5, 1].map((f) => (
        <line
          key={f}
          x1={0}
          x2={w}
          y1={padTop + plotH * (1 - f)}
          y2={padTop + plotH * (1 - f)}
          stroke="var(--n-100)"
          strokeDasharray="3 4"
        />
      ))}
      <line x1={0} x2={w} y1={padTop + plotH} y2={padTop + plotH} stroke="var(--n-200)" />
      {data.map((d, i) => {
        const h = (d.value / max) * plotH;
        const x = i * slot + (slot - barW) / 2;
        const y = padTop + plotH - h;
        return (
          <g key={d.label}>
            <rect
              x={x}
              y={y}
              width={barW}
              height={Math.max(h, d.value ? 2 : 0)}
              rx={5}
              fill={d.highlight ? 'var(--accent-600)' : 'var(--accent-200)'}
            />
            {d.value > 0 && (
              <text
                x={x + barW / 2}
                y={y - 6}
                textAnchor="middle"
                fontSize="11"
                fill="var(--n-600)"
              >
                {format(d.value)}
              </text>
            )}
            <text
              x={x + barW / 2}
              y={height - 8}
              textAnchor="middle"
              fontSize="11"
              fill="var(--n-500)"
            >
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

export const Donut: React.FC<{
  segments: { label: string; value: number; color: string }[];
  centerLabel: string;
}> = ({ segments, centerLabel }) => {
  const total = segments.reduce((s, x) => s + x.value, 0);
  const r = 52;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className="row" style={{ gap: 24 }}>
      <svg viewBox="0 0 140 140" width="148" height="148" role="img" aria-label="Status split">
        <circle cx="70" cy="70" r={r} fill="none" stroke="var(--n-50)" strokeWidth="16" />
        {total > 0 &&
          segments
            .filter((s) => s.value > 0)
            .map((s) => {
              const len = (s.value / total) * c;
              const el = (
                <circle
                  key={s.label}
                  cx="70"
                  cy="70"
                  r={r}
                  fill="none"
                  stroke={s.color}
                  strokeWidth="16"
                  strokeDasharray={`${len} ${c - len}`}
                  strokeDashoffset={-offset}
                  transform="rotate(-90 70 70)"
                />
              );
              offset += len;
              return el;
            })}
        <text x="70" y="68" textAnchor="middle" fontSize="24" fontWeight="700" fill="var(--n-900)">
          {total}
        </text>
        <text x="70" y="86" textAnchor="middle" fontSize="10" fill="var(--n-500)">
          {centerLabel}
        </text>
      </svg>
      <div className="legend">
        {segments.map((s) => (
          <div key={s.label} className="legend-item">
            <span className="sw" style={{ background: s.color }} />
            <span>{s.label}</span>
            <span className="val">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ---------- Status stepper ---------- */
export interface StepItem {
  label: string;
  at?: string;
  note?: string;
}

export const Steps: React.FC<{ steps: StepItem[]; current: number; failed?: boolean }> = ({
  steps,
  current,
  failed,
}) => (
  <div className="steps">
    {steps.map((s, i) => {
      const state = i < current ? 'done' : i === current ? 'current' : 'todo';
      const bad = failed && i === current;
      return (
        <div key={`${s.label}-${i}`} className={`step ${bad ? 'bad' : state}`}>
          <span className="dot">
            {bad ? <X size={12} /> : state !== 'todo' ? <Check size={12} /> : null}
          </span>
          <div>
            <div className={state === 'current' ? 'strong' : ''}>{s.label}</div>
            {(s.at || s.note) && (
              <div className="when">
                {s.at}
                {s.note ? ` · ${s.note}` : ''}
              </div>
            )}
          </div>
        </div>
      );
    })}
  </div>
);
