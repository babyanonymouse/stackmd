# Next.js + Prisma Connection Management (HMR Singleton)

## The Problem
During development, Next.js Hot Module Replacement (HMR) reloads modules on every code edit. If `new PrismaClient()` is called at module scope without a global cache, each module reload instantiates a new database connection pool. This quickly exhausts PostgreSQL connection limits (`FATAL: remaining connection slots are reserved for non-replication superuser connections`).

## Mandatory Pattern: globalThis Singleton
Create a dedicated singleton file (e.g., `src/lib/prisma.ts` or `lib/prisma.ts`):

```typescript
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
```

## Agent Instructions
1. Always import `prisma` from `@/lib/prisma` (or relative path to this singleton).
2. Never call `new PrismaClient()` directly inside route handlers, server actions, or components.
