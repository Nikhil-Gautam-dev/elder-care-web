import 'express-async-errors';
import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import { connectDb, closeDb } from './config/db.js';
import { ensureIndexes } from './models/user.model.js';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import familyRoutes from './routes/familyInvite.routes.js';
import { medicationRoutes, pharmacyOrderRoutes } from './routes/medication.routes.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: '@eldercare/api', timestamp: new Date().toISOString() });
});

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/family', familyRoutes);
app.use('/medications', medicationRoutes);
app.use('/pharmacy-orders', pharmacyOrderRoutes);

app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

app.use(errorHandler);

const PORT = Number(process.env.PORT ?? 3001);

async function start(): Promise<void> {
  await connectDb();
  await ensureIndexes();

  app.listen(PORT, () => {
    console.info(`[api] Server running on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error('[api] Failed to start:', err);
  process.exit(1);
});

process.on('SIGINT', async () => {
  await closeDb();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closeDb();
  process.exit(0);
});
