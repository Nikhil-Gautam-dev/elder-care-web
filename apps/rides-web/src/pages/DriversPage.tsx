import React, { useCallback, useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import {
  ApiError,
  createDriver,
  listDrivers,
  updateDriver,
  type Driver,
  type DriverInput,
} from '../api';

const emptyForm = { name: '', phone: '', vehicle: '', plate: '' };
type Form = typeof emptyForm;

const FIELDS: [keyof Form, string, boolean][] = [
  ['name', 'Driver name', true],
  ['phone', 'Phone (optional)', false],
  ['vehicle', 'Vehicle (e.g. Maruti Eeco)', true],
  ['plate', 'Number plate', true],
];

export const DriversPage: React.FC<{ onUnauthorized: () => void }> = ({ onUnauthorized }) => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<Form>(emptyForm);
  const [editing, setEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleError = useCallback(
    (err: unknown) => {
      if (err instanceof ApiError && err.status === 401) onUnauthorized();
      else setError(err instanceof Error ? err.message : 'Something went wrong');
    },
    [onUnauthorized],
  );

  const load = useCallback(async () => {
    try {
      const { items } = await listDrivers();
      setDrivers(items);
      setError(null);
    } catch (err) {
      handleError(err);
    }
  }, [handleError]);

  useEffect(() => {
    load();
  }, [load]);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (d: Driver) => {
    setEditing(d.id);
    setForm({ name: d.name, phone: d.phone ?? '', vehicle: d.vehicle, plate: d.plate });
    setShowForm(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const body: DriverInput = { ...form };
    try {
      if (editing) await updateDriver(editing, body);
      else await createDriver(body);
      setShowForm(false);
      setEditing(null);
      setForm(emptyForm);
      await load();
    } catch (err) {
      handleError(err);
    }
  };

  const toggleActive = async (d: Driver) => {
    try {
      await updateDriver(d.id, { active: !d.active });
      await load();
    } catch (err) {
      handleError(err);
    }
  };

  return (
    <div>
      <div className="order-head" style={{ marginBottom: '1rem', alignItems: 'center' }}>
        <h1 style={{ fontSize: '1.4rem' }}>Drivers &amp; vehicles</h1>
        <button type="button" className="btn btn-primary" onClick={openAdd}>
          <Plus size={16} /> Add driver
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {showForm && (
        <form className="card grid-2" onSubmit={submit}>
          {FIELDS.map(([key, label, required]) => (
            <div key={key}>
              <label className="label" htmlFor={`driver-${key}`}>
                {label}
              </label>
              <input
                id={`driver-${key}`}
                className="input"
                value={form[key]}
                required={required}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
              />
            </div>
          ))}
          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'end' }}>
            <button type="submit" className="btn btn-primary">
              {editing ? 'Save changes' : 'Add driver'}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="card">
        {drivers.length === 0 && <div className="muted">No drivers yet. Add the first one.</div>}
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Driver</th>
                <th>Vehicle</th>
                <th>Plate</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {drivers.map((d) => (
                <tr key={d.id} className={d.active ? '' : 'inactive'}>
                  <td>
                    <strong>{d.name}</strong>
                    {d.phone && <div className="muted">{d.phone}</div>}
                  </td>
                  <td>{d.vehicle}</td>
                  <td>{d.plate}</td>
                  <td style={{ whiteSpace: 'nowrap', textAlign: 'right' }}>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => openEdit(d)}
                    >
                      Edit
                    </button>{' '}
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => toggleActive(d)}
                    >
                      {d.active ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
