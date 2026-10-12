import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { PackageSearch, Plus } from 'lucide-react';
import {
  ApiError,
  createCatalogItem,
  searchCatalog,
  updateCatalogItem,
  type CatalogItem,
} from '../api';
import {
  Badge,
  Button,
  DataTable,
  Drawer,
  EmptyState,
  Field,
  SearchInput,
  Tabs,
  Toggle,
  useToast,
  type Column,
} from '../components/ui';
import { inr } from '../utils';

export const LOW_STOCK = 5;

const emptyForm = {
  brand: '',
  generic: '',
  strength: '',
  form: 'tablet',
  packSize: '10',
  packUnit: 'tablets',
  pricePerPack: '',
  stockPacks: '0',
};
type Form = typeof emptyForm;

const FIELDS: { key: keyof Form; label: string; type?: string; span?: boolean }[] = [
  { key: 'brand', label: 'Brand' },
  { key: 'generic', label: 'Generic name' },
  { key: 'strength', label: 'Strength (e.g. 500 mg)' },
  { key: 'form', label: 'Form (tablet, syrup…)' },
  { key: 'packSize', label: 'Units per pack', type: 'number' },
  { key: 'packUnit', label: 'Unit name (tablets, ml…)' },
  { key: 'pricePerPack', label: 'Price per pack (₹)', type: 'number' },
  { key: 'stockPacks', label: 'Packs in stock', type: 'number' },
];

const stockBadge = (item: CatalogItem) => {
  if (!item.active) return <Badge>Hidden</Badge>;
  if (item.stockPacks === 0) return <Badge tone="danger">Out of stock</Badge>;
  if (item.stockPacks <= LOW_STOCK) return <Badge tone="warning">Low stock</Badge>;
  return <Badge tone="success">In stock</Badge>;
};

type DrawerState = { mode: 'add' } | { mode: 'edit'; item: CatalogItem } | null;

export const CatalogPage: React.FC<{ onUnauthorized: () => void }> = ({ onUnauthorized }) => {
  const toast = useToast();
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState('all');
  const [items, setItems] = useState<CatalogItem[] | null>(null);
  const [drawer, setDrawer] = useState<DrawerState>(null);

  const handleError = useCallback(
    (err: unknown) => {
      if (err instanceof ApiError && err.status === 401) onUnauthorized();
      else toast.show('error', err instanceof Error ? err.message : 'Something went wrong');
    },
    [onUnauthorized, toast],
  );

  const load = useCallback(async () => {
    try {
      setItems((await searchCatalog(query)).items);
    } catch (err) {
      handleError(err);
    }
  }, [query, handleError]);

  useEffect(() => {
    const timer = setTimeout(load, 250);
    return () => clearTimeout(timer);
  }, [load]);

  const all = items ?? [];
  const tabs = [
    { key: 'all', label: 'All', match: () => true },
    {
      key: 'low',
      label: 'Low stock',
      match: (i: CatalogItem) => i.active && i.stockPacks > 0 && i.stockPacks <= LOW_STOCK,
    },
    {
      key: 'out',
      label: 'Out of stock',
      match: (i: CatalogItem) => i.active && i.stockPacks === 0,
    },
    { key: 'hidden', label: 'Hidden', match: (i: CatalogItem) => !i.active },
  ];
  const rows = useMemo(() => all.filter(tabs.find((t) => t.key === tab)!.match), [all, tab]);

  const columns: Column<CatalogItem>[] = [
    {
      key: 'medicine',
      header: 'Medicine',
      render: (i) => (
        <div>
          <div className="strong">
            {i.brand} {i.strength}
          </div>
          <div className="muted">
            {i.generic} · {i.form}
          </div>
        </div>
      ),
    },
    { key: 'pack', header: 'Pack', render: (i) => `${i.packSize} ${i.packUnit}` },
    {
      key: 'price',
      header: 'Price / pack',
      align: 'right',
      render: (i) => <span className="strong">{inr(i.pricePerPack)}</span>,
    },
    {
      key: 'stock',
      header: 'Packs in stock',
      align: 'right',
      render: (i) => <span className="strong">{i.stockPacks}</span>,
    },
    { key: 'status', header: 'Availability', render: stockBadge },
  ];

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Catalog &amp; stock</h1>
          <p>Prices and availability shown to ordering partners.</p>
        </div>
        <Button onClick={() => setDrawer({ mode: 'add' })}>
          <Plus size={16} /> Add medicine
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
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search brand or generic name"
          />
        </div>
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(i) => i.id}
          loading={items === null}
          onRowClick={(item) => setDrawer({ mode: 'edit', item })}
          rowClass={(i) => (i.active ? '' : 'dim')}
          selectedKey={drawer?.mode === 'edit' ? drawer.item.id : null}
          empty={
            <EmptyState
              icon={<PackageSearch size={22} />}
              title="Nothing found"
              text="Try another search, or add the medicine to your catalog."
            />
          }
        />
      </div>

      {drawer && (
        <ItemDrawer
          key={drawer.mode === 'edit' ? drawer.item.id : 'add'}
          state={drawer}
          onClose={() => setDrawer(null)}
          onSaved={async (message) => {
            toast.show('success', message);
            setDrawer(null);
            await load();
          }}
          onError={handleError}
        />
      )}
    </>
  );
};

const ItemDrawer: React.FC<{
  state: NonNullable<DrawerState>;
  onClose: () => void;
  onSaved: (message: string) => Promise<void>;
  onError: (err: unknown) => void;
}> = ({ state, onClose, onSaved, onError }) => {
  const editing = state.mode === 'edit' ? state.item : null;
  const [form, setForm] = useState<Form>(
    editing
      ? {
          brand: editing.brand,
          generic: editing.generic,
          strength: editing.strength,
          form: editing.form,
          packSize: String(editing.packSize),
          packUnit: editing.packUnit,
          pricePerPack: String(editing.pricePerPack),
          stockPacks: String(editing.stockPacks),
        }
      : emptyForm,
  );
  const [active, setActive] = useState(editing?.active ?? true);
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await updateCatalogItem(editing.id, {
          pricePerPack: Number(form.pricePerPack),
          stockPacks: Number(form.stockPacks),
          active,
        });
        await onSaved(`${editing.brand} updated`);
      } else {
        await createCatalogItem({
          brand: form.brand,
          generic: form.generic,
          strength: form.strength,
          form: form.form,
          packSize: Number(form.packSize),
          packUnit: form.packUnit,
          pricePerPack: Number(form.pricePerPack),
          stockPacks: Number(form.stockPacks),
        });
        await onSaved(`${form.brand} added to catalog`);
      }
    } catch (err) {
      onError(err);
    } finally {
      setSaving(false);
    }
  };

  // Product identity can't be edited through the API, only price, stock and visibility.
  const locked = (key: keyof Form) =>
    Boolean(editing) && !['pricePerPack', 'stockPacks'].includes(key);

  return (
    <Drawer
      title={editing ? `${editing.brand} ${editing.strength}` : 'Add medicine'}
      subtitle={editing ? editing.generic : 'New catalog entry'}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="item-form" disabled={saving}>
            {saving ? 'Saving…' : editing ? 'Save changes' : 'Add to catalog'}
          </Button>
        </>
      }
    >
      <form id="item-form" onSubmit={submit} className="form-grid">
        {FIELDS.map((f) => (
          <Field key={f.key} label={f.label} htmlFor={`f-${f.key}`}>
            <input
              id={`f-${f.key}`}
              className="input"
              type={f.type ?? 'text'}
              min={f.type === 'number' ? 0 : undefined}
              value={form[f.key]}
              disabled={locked(f.key)}
              onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
              required
            />
          </Field>
        ))}
        {editing && (
          <div className="span-2 panel row-between">
            <div>
              <div className="strong">Visible to ordering partners</div>
              <div className="muted">Hidden medicines can't be ordered.</div>
            </div>
            <Toggle on={active} onChange={setActive} label="Visible to ordering partners" />
          </div>
        )}
      </form>
    </Drawer>
  );
};
