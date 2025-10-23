import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  console.log("mongodb string found : ", MONGODB_URI);
  console.log(typeof MONGODB_URI);
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env"
  );
}

// Define a global caching type for Mongoose connection
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Add a global variable for reuse between hot reloads (Next.js feature)
let globalWithMongoose = global as typeof globalThis & {
  mongoose?: MongooseCache;
};

// Initialize the cache
let cached: MongooseCache = globalWithMongoose.mongoose || {
  conn: null,
  promise: null,
};

// Save cache globally
globalWithMongoose.mongoose = cached;

// Connection function
export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI)
      .then((mongooseInstance) => mongooseInstance);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
