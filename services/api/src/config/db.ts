import { MongoClient, type Db } from 'mongodb';

let client: MongoClient;
let db: Db;

export async function connectDb(): Promise<void> {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.DB_NAME;
  if (!uri) throw new Error('MONGODB_URI environment variable is not set');
  if (!dbName) throw new Error('DB_NAME environment variable is not set');

  client = new MongoClient(uri);
  await client.connect();
  db = client.db(dbName);
  console.info(`[db] Connected to MongoDB: ${client.options.dbName ?? 'default'}`);
}

export function getDb(): Db {
  if (!db) throw new Error('Database not initialised — call connectDb() first');
  return db;
}

export async function closeDb(): Promise<void> {
  await client?.close();
}
