/**
 * Intersection rule modules for stackmd.
 * Automatically resolved when combining complementary tools (e.g., Next.js + Prisma or Next.js + Mongoose).
 */

export const NEXTJS_PRISMA = `## Next.js + Prisma Connection Management (HMR Singleton)

### The Problem
During development, Next.js Hot Module Replacement (HMR) reloads modules on every code edit. If \`new PrismaClient()\` is called at module scope without a global cache, each module reload instantiates a new database connection pool. This quickly exhausts PostgreSQL connection limits (\`FATAL: remaining connection slots are reserved for non-replication superuser connections\`).

### Mandatory Pattern: globalThis Singleton
Create a dedicated singleton file (e.g., \`src/lib/prisma.ts\` or \`lib/prisma.ts\`):

\`\`\`typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
\`\`\`

### Agent Instructions
1. Always import \`prisma\` from \`@/lib/prisma\` (or relative path to this singleton).
2. Never call \`new PrismaClient()\` directly inside route handlers, server actions, or components.`;

export const NEXTJS_MONGOOSE = `## Next.js + Mongoose Connection Management (Cached Connection)

### The Problem
Next.js API routes and Server Actions run in serverless / ephemeral environments and during local development undergo rapid HMR reloads. Calling \`mongoose.connect()\` naively inside each request or module causes MongoDB connection thrashing and pool exhaustion (\`MongoServerError: connection pool exhausted\`).

### Mandatory Pattern: Cached Global Connection
Create a reusable connection helper in \`src/lib/mongodb.ts\` (or \`lib/mongodb.ts\`):

\`\`\`typescript
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
\`\`\`

### Agent Instructions
1. Always call \`await connectToDatabase()\` at the start of any Server Action, Route Handler, or data access function before invoking Mongoose models.
2. Never instantiate uncontrolled \`mongoose.createConnection()\` or raw \`mongoose.connect()\` inside route handlers.`;
