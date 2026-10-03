import React, { useCallback, useEffect, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import {
  ApiError,
  createCatalogItem,
  searchCatalog,
  updateCatalogItem,
  type CatalogItem,
} from '../api';

const emptyItem = {
  brand: '',
  generic: '',
  strength: '',
  form: 'tablet',
  packSize: '10',
  packUnit: 'tablets',
  pricePerPack: '',
  stockPacks: '0',
};

export const CatalogPage: React.FC<{ onUnauthorized: () => void }> = ({ onUnauthorized }) => {
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, { price: string; stock: string }>>({});
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState(emptyItem);

  const handleError = useCallback(
    (err: unknown) => {
      if (err instanceof ApiError && err.status === 401) onUnauthorized();
      else setError(err instanceof Error ? err.message : 'Something went wrong');
    },
    [onUnauthorized],
  );

  const load = useCallback(async () => {
    try {
      const { items: found } = await searchCatalog(query);
      setItems(found);
      setError(null);
    } catch (err) {
      handleError(err);
    }
  }, [query, handleError]);

  useEffect(() => {
    const timer = setTimeout(load, 250);
    return () => clearTimeout(timer);
  }, [load]);

  const draftFor = (item: CatalogItem) =>
    drafts[item.id] ?? { price: String(item.pricePerPack), stock: String(item.stockPacks) };

  const setDraft = (item: CatalogItem, patch: Partial<{ price: string; stock: string }>) =>
    setDrafts((d) => ({ ...d, [item.id]: { ...draftFor(item), ...patch } }));

  const save = async (item: CatalogItem) => {
    const draft = draftFor(item);
    try {
      await updateCatalogItem(item.id, {
        pricePerPack: Number(draft.price),
        stockPacks: Number(draft.stock),
      });
      setDrafts(({ [item.id]: _removed, ...rest }) => rest);
      await load();
    } catch (err) {
      handleError(err);
    }
  };

  const toggleActive = async (item: CatalogItem) => {
    try {
      await updateCatalogItem(item.id, { active: !item.active });
      await load();
    } catch (err) {
      handleError(err);
    }
  };

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
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
      setForm(emptyItem);
      setAdding(false);
      await load();
    } catch (err) {
      handleError(err);
    }
  };

  const setField = (key: keyof typeof emptyItem, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  return (
    <div>
      <div className="order-head" style={{ marginBottom: '1rem', alignItems: 'center' }}>
        <h1 style={{ fontSize: '1.4rem' }}>Catalog &amp; stock</h1>
        <button type="button" className="btn btn-primary" onClick={() => setAdding((v) => !v)}>
          <Plus size={16} /> Add medicine
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {adding && (
        <form className="card grid-2" onSubmit={add}>
          {(
            [
              ['brand', 'Brand'],
              ['generic', 'Generic name'],
              ['strength', 'Strength (e.g. 500 mg)'],
              ['form', 'Form (tablet, syrup…)'],
              ['packSize', 'Units per pack'],
              ['packUnit', 'Unit name (tablets, ml…)'],
              ['pricePerPack', 'Price per pack (₹)'],
              ['stockPacks', 'Packs in stock'],
            ] as const
          ).map(([key, label]) => (
            <div key={key}>
              <label className="label" htmlFor={`new-${key}`}>
                {label}
              </label>
              <input
                id={`new-${key}`}
                className="input"
                value={form[key]}
                onChange={(e) => setField(key, e.target.value)}
                required
              />
            </div>
          ))}
          <div style={{ alignSelf: 'end' }}>
            <button type="submit" className="btn btn-primary">
              Save
            </button>
          </div>
        </form>
      )}

      <div className="card">
        <div style={{ position: 'relative', marginBottom: '1rem', maxWidth: '22rem' }}>
          <Search
            size={16}
            style={{ position: 'absolute', left: 10, top: 11, color: 'var(--muted)' }}
          />
          <input
            className="input"
            style={{ paddingLeft: '2rem' }}
            placeholder="Search brand or generic name"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Medicine</th>
                <th>Pack</th>
                <th>Price / pack (₹)</th>
                <th>Packs in stock</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const draft = draftFor(item);
                const changed =
                  draft.price !== String(item.pricePerPack) ||
                  draft.stock !== String(item.stockPacks);
                return (
                  <tr key={item.id} className={item.active ? '' : 'inactive'}>
                    <td>
                      <strong>
                        {item.brand} {item.strength}
                      </strong>
                      <div className="muted">
                        {item.generic} · {item.form}
                      </div>
                    </td>
                    <td>
                      {item.packSize} {item.packUnit}
                    </td>
                    <td>
                      <input
                        className="input"
                        style={{ width: '6rem' }}
                        type="number"
                        min="1"
                        value={draft.price}
                        onChange={(e) => setDraft(item, { price: e.target.value })}
                      />
                    </td>
                    <td>
                      <input
                        className="input"
                        style={{ width: '6rem' }}
                        type="number"
                        min="0"
                        value={draft.stock}
                        onChange={(e) => setDraft(item, { stock: e.target.value })}
                      />
                      {item.stockPacks <= 5 && item.active && (
                        <span className="badge warn" style={{ marginLeft: '0.5rem' }}>
                          low
                        </span>
                      )}
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        disabled={!changed}
                        onClick={() => save(item)}
                      >
                        Save
                      </button>{' '}
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => toggleActive(item)}
                      >
                        {item.active ? 'Hide' : 'Show'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {items.length === 0 && <div className="muted">Nothing found.</div>}
        </div>
      </div>
    </div>
  );
};
