import { MongoClient, type Db } from 'mongodb';

let client: MongoClient;
let db: Db;

export async function connectDb(): Promise<void> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI environment variable is not set');
  const dbName = process.env.PHARMACY_DB_NAME ?? 'eldercare_pharmacy';

  client = new MongoClient(uri);
  await client.connect();
  db = client.db(dbName);
  console.info(`[pharmacy-db] Connected to MongoDB database: ${db.databaseName}`);
}

export function getDb(): Db {
  if (!db) throw new Error('Database not initialised — call connectDb() first');
  return db;
}

export async function closeDb(): Promise<void> {
  await client?.close();
}
