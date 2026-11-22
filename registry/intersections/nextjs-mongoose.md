# Next.js + Mongoose Connection Management (Cached Connection)

## The Problem
Next.js API routes and Server Actions run in serverless / ephemeral environments and during local development undergo rapid HMR reloads. Calling `mongoose.connect()` naively inside each request or module causes MongoDB connection thrashing and pool exhaustion (`MongoServerError: connection pool exhausted`).

## Mandatory Pattern: Cached Global Connection
Create a reusable connection helper in `src/lib/mongodb.ts` (or `lib/mongodb.ts`):

```typescript
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache | undefined;
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };
    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((m) => m);
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}
```

## Agent Instructions
1. Always call `await connectToDatabase()` at the start of any Server Action, Route Handler, or data access function before invoking Mongoose models.
2. Never instantiate uncontrolled `mongoose.createConnection()` or raw `mongoose.connect()` inside route handlers.
