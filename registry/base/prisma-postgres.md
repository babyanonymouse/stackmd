# Prisma & PostgreSQL Discipline

## 1. Schema Naming Discipline
- **Models**: PascalCase for model declarations (e.g., `model UserProfile { ... }`).
- **Database Tables**: Explicitly map models to snake_case table names using `@@map("user_profiles")`.
- **Fields**: camelCase for model field names, mapped to snake_case database columns using `@map("created_at")`.
- **Primary Keys**: Use consistent, collision-resistant string IDs such as CUID or UUID:
  ```prisma
  id String @id @default(cuid())
  ```
- **Timestamps**: Explicit `createdAt` and `updatedAt` timestamps on all mutable entities:
  ```prisma
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  ```
- **Explicit Indexes**: Declare explicit composite indexes and unique constraints (`@@index`, `@@unique`) for frequently queried foreign keys and search filters.

## 2. Transactional Writes
- All multi-step mutations, dependent operations, or balance/counter updates MUST execute within a Prisma transaction to guarantee ACID integrity:
  ```typescript
  await prisma.$transaction(async (tx) => {
    const account = await tx.account.update({
      where: { id: senderId },
      data: { balance: { decrement: amount } },
    });
    await tx.ledgerEntry.create({
      data: { accountId: account.id, amount: -amount },
    });
  });
  ```
- Avoid performing side effects (emails, external API requests) inside an interactive transaction block.

## 3. Query Discipline & Preventing N+1 Waterfalls
- **Explicit Projections**: Always use `select` to retrieve only the fields needed by the caller. Never perform open `prisma.model.findMany()` without field projection on tables containing wide text or binary columns.
- **Explicit Relation Loading**: Use `include` or `select` to load related models in batch queries. Never query relations inside a loop over parent results (`for (const item of items) await prisma...`).
