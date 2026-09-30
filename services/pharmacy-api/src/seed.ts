import 'dotenv/config';
import { ObjectId } from 'mongodb';

import { closeDb, connectDb } from './config/db.js';
import { hashPassword } from './lib/password.js';
import { ensureIndexes, getCatalog, getPharmacists } from './models/pharmacy.model.js';
import { SEED_MEDICINES } from './data/medicines.js';

/** Idempotent: existing medicines keep their current stock/price, only missing ones are added. */
async function seed(): Promise<void> {
  await connectDb();
  await ensureIndexes();

  const now = new Date();
  let added = 0;
  for (const medicine of SEED_MEDICINES) {
    const result = await getCatalog().updateOne(
      { brand: medicine.brand, strength: medicine.strength },
      {
        $setOnInsert: {
          _id: new ObjectId(),
          ...medicine,
          active: true,
          createdAt: now,
          updatedAt: now,
        },
      },
      { upsert: true },
    );
    if (result.upsertedCount) added++;
  }
  console.info(`[seed] Catalog: ${added} added, ${SEED_MEDICINES.length - added} already present`);

  const username = (process.env.PHARMACY_SEED_USERNAME ?? 'pharmacist').trim().toLowerCase();
  const password = process.env.PHARMACY_SEED_PASSWORD;
  if (!password) {
    console.warn('[seed] PHARMACY_SEED_PASSWORD not set — skipping pharmacist account');
  } else {
    const result = await getPharmacists().updateOne(
      { username },
      {
        $set: { passwordHash: hashPassword(password) },
        $setOnInsert: {
          _id: new ObjectId(),
          username,
          name: 'ElderCare Pharmacist',
          createdAt: now,
        },
      },
      { upsert: true },
    );
    console.info(
      `[seed] Pharmacist '${username}' ${result.upsertedCount ? 'created' : 'password refreshed'}`,
    );
  }

  await closeDb();
}

seed().catch((err) => {
  console.error('[seed] Failed:', err);
  process.exit(1);
});
