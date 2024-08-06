import { MongoClient, MongoClientOptions } from "mongodb";

const MONGO_URI = process.env.MONGO_URI as string;

if (!MONGO_URI) {
  throw new Error(
    "Please define the MONGO_URI environment variable inside .env.local"
  );
}

let cached: {
  client: MongoClient | null;
  promise: Promise<MongoClient> | null;
} = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { client: null, promise: null };
}

async function dbConnect() {
  if (cached.client) {
    return cached.client;
  }

  if (!cached.promise) {
    const opts: MongoClientOptions = {};

    cached.promise = MongoClient.connect(MONGO_URI, opts).then((client) => {
      return client;
    });
  }
  cached.client = await cached.promise;
  return cached.client;
}

export default dbConnect;
