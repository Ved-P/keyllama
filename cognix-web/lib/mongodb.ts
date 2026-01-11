import { MongoClient, Db } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your MongoDB URI to .env.local');
}

const uri: string = process.env.MONGODB_URI;
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable to preserve the MongoClient
  // across hot reloads to avoid connection issues
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, create a new client for each request
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

/**
 * Get MongoDB client instance
 */
export async function getMongoClient(): Promise<MongoClient> {
  return clientPromise;
}

/**
 * Get MongoDB database instance
 * @param dbName - Optional database name, defaults to MONGODB_DB_NAME from env
 */
export async function getDatabase(dbName?: string): Promise<Db> {
  const client = await getMongoClient();
  const database = dbName || process.env.MONGODB_DB_NAME || 'cognix';
  return client.db(database);
}

export default clientPromise;
