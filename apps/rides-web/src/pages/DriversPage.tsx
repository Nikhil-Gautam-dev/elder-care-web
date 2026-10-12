import React, { useState } from 'react';
import { Plus, Users } from 'lucide-react';
import { createDriver, updateDriver, type Driver, type DriverInput, type Ride } from '../api';
import {
  Avatar,
  Badge,
  Button,
  DataTable,
  Drawer,
  EmptyState,
  Field,
  Tabs,
  Toggle,
  useToast,
  type Column,
} from '../components/ui';
import { ON_TRIP } from '../rideMeta';
import { formatPhone } from '../utils';

const emptyForm = { name: '', phone: '', vehicle: '', plate: '' };
type Form = typeof emptyForm;

const FIELDS: { key: keyof Form; label: string; required: boolean; span?: boolean }[] = [
  { key: 'name', label: 'Driver name', required: true, span: true },
  { key: 'phone', label: 'Phone (optional)', required: false, span: true },
  { key: 'vehicle', label: 'Vehicle (e.g. Maruti Eeco)', required: true },
  { key: 'plate', label: 'Number plate', required: true },
];

type DrawerState = { mode: 'add' } | { mode: 'edit'; driver: Driver } | null;

interface Props {
  drivers: Driver[] | null;
  rides: Ride[];
  onChanged: () => Promise<void>;
  onError: (err: unknown) => void;
}

export const DriversPage: React.FC<Props> = ({ drivers, rides, onChanged, onError }) => {
  const toast = useToast();
  const [tab, setTab] = useState('all');
  const [drawer, setDrawer] = useState<DrawerState>(null);

  const all = drivers ?? [];
  const onTrip = new Map(
    rides.filter((r) => ON_TRIP.includes(r.status) && r.driver).map((r) => [r.driver!.id, r]),
  );

  const tabs = [
    { key: 'all', label: 'All', match: () => true },
    { key: 'free', label: 'Available', match: (d: Driver) => d.active && !onTrip.has(d.id) },
    { key: 'busy', label: 'On a ride', match: (d: Driver) => d.active && onTrip.has(d.id) },
    { key: 'inactive', label: 'Inactive', match: (d: Driver) => !d.active },
  ];
  const rows = all.filter(tabs.find((t) => t.key === tab)!.match);

  const setActive = async (d: Driver, active: boolean) => {
    try {
      await updateDriver(d.id, { active });
      await onChanged();
      toast.show('success', `${d.name} ${active ? 'activated' : 'deactivated'}`);
    } catch (err) {
      onError(err);
    }
  };

  const columns: Column<Driver>[] = [
    {
      key: 'driver',
      header: 'Driver',
      render: (d) => (
        <div className="row">
          <Avatar name={d.name} />
          <div>
            <div className="strong">{d.name}</div>
            <div className="muted">{d.phone ? formatPhone(d.phone) : 'No phone'}</div>
          </div>
        </div>
      ),
    },
    { key: 'vehicle', header: 'Vehicle', render: (d) => d.vehicle },
    { key: 'plate', header: 'Plate', render: (d) => <span className="mono">{d.plate}</span> },
    {
      key: 'status',
      header: 'Availability',
      render: (d) =>
        !d.active ? (
          <Badge>Inactive</Badge>
        ) : onTrip.has(d.id) ? (
          <Badge tone="info">On {onTrip.get(d.id)!.rideNumber}</Badge>
        ) : (
          <Badge tone="success">Available</Badge>
        ),
    },
    {
      key: 'active',
      header: 'Active',
      align: 'right',
      render: (d) => (
        <span onClick={(e) => e.stopPropagation()}>
          <Toggle on={d.active} onChange={(on) => setActive(d, on)} label={`${d.name} active`} />
        </span>
      ),
    },
  ];

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Drivers</h1>
          <p>Your fleet. Only active drivers can be assigned to new rides.</p>
        </div>
        <Button onClick={() => setDrawer({ mode: 'add' })}>
          <Plus size={16} /> Add driver
        </Button>
      </div>

      <div className="card">
        <div className="toolbar">
          <Tabs
            active={tab}
            onChange={setTab}
            items={tabs.map((t) => ({
              key: t.key,
              label: t.label,
              count: all.filter(t.match).length,
            }))}
          />
        </div>
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(d) => d.id}
          loading={drivers === null}
          onRowClick={(driver) => setDrawer({ mode: 'edit', driver })}
          rowClass={(d) => (d.active ? '' : 'dim')}
          selectedKey={drawer?.mode === 'edit' ? drawer.driver.id : null}
          empty={
            <EmptyState
              icon={<Users size={22} />}
              title="No drivers here"
              text="Add your first driver to start accepting rides."
            />
          }
        />
      </div>

      {drawer && (
        <DriverDrawer
          key={drawer.mode === 'edit' ? drawer.driver.id : 'add'}
          state={drawer}
          onClose={() => setDrawer(null)}
          onSaved={async (message) => {
            toast.show('success', message);
            setDrawer(null);
            await onChanged();
          }}
          onError={onError}
        />
      )}
    </>
  );
};

const DriverDrawer: React.FC<{
  state: NonNullable<DrawerState>;
  onClose: () => void;
  onSaved: (message: string) => Promise<void>;
  onError: (err: unknown) => void;
}> = ({ state, onClose, onSaved, onError }) => {
  const editing = state.mode === 'edit' ? state.driver : null;
  const [form, setForm] = useState<Form>(
    editing
      ? {
          name: editing.name,
          phone: editing.phone ?? '',
          vehicle: editing.vehicle,
          plate: editing.plate,
        }
      : emptyForm,
  );
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const body: DriverInput = { ...form };
    try {
      if (editing) await updateDriver(editing.id, body);
      else await createDriver(body);
      await onSaved(editing ? `${form.name} updated` : `${form.name} added`);
    } catch (err) {
      onError(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Drawer
      title={editing ? editing.name : 'Add driver'}
      subtitle={editing ? `${editing.vehicle} · ${editing.plate}` : 'New driver'}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="driver-form" disabled={saving}>
            {saving ? 'Saving…' : editing ? 'Save changes' : 'Add driver'}
          </Button>
        </>
      }
    >
      <form id="driver-form" onSubmit={submit} className="form-grid">
        {FIELDS.map((f) => (
          <Field
            key={f.key}
            label={f.label}
            htmlFor={`d-${f.key}`}
            className={f.span ? 'span-2' : ''}
          >
            <input
              id={`d-${f.key}`}
              className="input"
              value={form[f.key]}
              required={f.required}
              onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
            />
          </Field>
        ))}
      </form>
    </Drawer>
  );
};
