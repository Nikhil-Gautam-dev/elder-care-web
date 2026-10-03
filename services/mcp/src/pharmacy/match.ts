import { type MedicationDoc } from '../config/db.js';
import { searchCatalog, type CatalogItem } from './client.js';

export const money = (n: number) => `₹${Number.isInteger(n) ? n : n.toFixed(2)}`;
export const compact = (value: string) => value.toLowerCase().replace(/\s+/g, '');
export const label = (c: { brand: string; strength: string }) => `${c.brand} ${c.strength}`;
export const candidate = (c: CatalogItem) => ({
  medicine: label(c),
  generic: c.generic,
  pack: `${c.packSize} ${c.packUnit}`,
  price: money(c.pricePerPack),
  inStock: c.stockPacks > 0,
});

export type CatalogMatch = { item: CatalogItem } | { problem: Record<string, unknown> };

/** Finds the pharmacy product for a saved medication: same strength and form, preferring the saved brand. */
export async function matchForMedication(med: MedicationDoc): Promise<CatalogMatch> {
  const terms = [...new Set([med.genericName, med.name].filter((t): t is string => Boolean(t)))];
  const found = new Map<string, CatalogItem>();
  for (const term of terms) {
    for (const item of await searchCatalog(term, 20)) found.set(item.id, item);
  }

  const all = [...found.values()];
  const sameStrength = all.filter(
    (c) => compact(c.strength) === compact(med.strength) && c.form === med.form,
  );
  const pool = sameStrength.length ? sameStrength : [];

  if (pool.length === 1) return { item: pool[0]! };
  if (pool.length > 1) {
    const branded = pool.filter((c) => c.brand.toLowerCase() === med.name.toLowerCase());
    if (branded.length === 1) return { item: branded[0]! };
    return {
      problem: {
        error: 'More than one product fits. Ask which one.',
        options: pool.map(candidate),
      },
    };
  }
  return {
    problem: {
      error: `The pharmacy doesn't have ${med.name} ${med.strength} ${med.form}.`,
      similar: all.slice(0, 5).map(candidate),
    },
  };
}

/** Finds the pharmacy product for something the user typed, e.g. "Metformin 500". */
export async function matchForText(text: string): Promise<CatalogMatch> {
  const name = text.replace(/\d.*$/, '').trim() || text.trim();
  const strength = /(\d+(?:\.\d+)?)\s*(mg|mcg|g|ml|%)/i.exec(text);
  const results = await searchCatalog(name, 20);

  const narrowed = strength
    ? results.filter((c) => compact(c.strength).startsWith(compact(`${strength[1]}${strength[2]}`)))
    : results;
  const pool = narrowed.length ? narrowed : results;

  if (results.length === 0)
    return { problem: { error: `The pharmacy doesn't have anything like '${text}'.` } };
  if (pool.length === 1) return { item: pool[0]! };
  return {
    problem: {
      error: `Several products match '${text}'. Ask which one.`,
      options: pool.slice(0, 6).map(candidate),
    },
  };
}
