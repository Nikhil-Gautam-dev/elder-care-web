import 'express-async-errors';
import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import { connectDb, closeDb } from './config/db.js';
import { ensureIndexes } from './models/pharmacy.model.js';
import { errorHandler } from './middleware/errorHandler.js';
import routes from './routes/index.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: '@eldercare/pharmacy-api',
    timestamp: new Date().toISOString(),
  });
});

app.use(routes);

app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

app.use(errorHandler);

const PORT = Number(process.env.PORT ?? 3004);

async function start(): Promise<void> {
  for (const name of ['PHARMACY_JWT_SECRET', 'PHARMACY_API_KEY']) {
    if (!process.env[name]) throw new Error(`${name} environment variable is not set`);
  }

  await connectDb();
  await ensureIndexes();

  app.listen(PORT, () => {
    console.info(`[pharmacy-api] Server running on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error('[pharmacy-api] Failed to start:', err);
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
