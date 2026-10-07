import 'dotenv/config';
import { ObjectId } from 'mongodb';

import { closeDb, connectDb } from './config/db.js';
import { hashPassword } from './lib/password.js';
import { ensureIndexes, getDrivers, getStaff } from './models/rides.model.js';

const SEED_DRIVERS = [
  { name: 'Ramesh Kumar', phone: '+919810000001', vehicle: 'Maruti WagonR', plate: 'DL1CA1001' },
  { name: 'Suresh Yadav', phone: '+919810000002', vehicle: 'Hyundai Xcent', plate: 'DL1CA1002' },
  { name: 'Anita Sharma', phone: '+919810000003', vehicle: 'Tata Tiago', plate: 'DL1CA1003' },
  {
    name: 'Mohan Singh',
    phone: '+919810000004',
    vehicle: 'Maruti Eeco (wheelchair friendly)',
    plate: 'DL1CA1004',
  },
  { name: 'Farida Khan', phone: '+919810000005', vehicle: 'Honda Amaze', plate: 'DL1CA1005' },
];

/** Idempotent: drivers are matched by plate and never overwritten. */
async function seed(): Promise<void> {
  await connectDb();
  await ensureIndexes();

  const now = new Date();
  let added = 0;
  for (const driver of SEED_DRIVERS) {
    const result = await getDrivers().updateOne(
      { plate: driver.plate },
      {
        $setOnInsert: {
          _id: new ObjectId(),
          ...driver,
          active: true,
          createdAt: now,
          updatedAt: now,
        },
      },
      { upsert: true },
    );
    if (result.upsertedCount) added++;
  }
  console.info(`[seed] Drivers: ${added} added, ${SEED_DRIVERS.length - added} already present`);

  const username = (process.env.RIDES_SEED_USERNAME ?? 'dispatcher').trim().toLowerCase();
  const password = process.env.RIDES_SEED_PASSWORD;
  if (!password) {
    console.warn('[seed] RIDES_SEED_PASSWORD not set — skipping staff account');
  } else {
    const result = await getStaff().updateOne(
      { username },
      {
        $set: { passwordHash: hashPassword(password) },
        $setOnInsert: {
          _id: new ObjectId(),
          username,
          name: 'ElderCare Dispatcher',
          createdAt: now,
        },
      },
      { upsert: true },
    );
    console.info(
      `[seed] Staff '${username}' ${result.upsertedCount ? 'created' : 'password refreshed'}`,
    );
  }

  await closeDb();
}

seed().catch((err) => {
  console.error('[seed] Failed:', err);
  process.exit(1);
});
