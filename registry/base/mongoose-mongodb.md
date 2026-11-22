# Mongoose & MongoDB Guidelines

## 1. Mandatory .lean() on Read Queries
- **Performance by Default**: All read queries (`find`, `findOne`, `findById`) that do not require Mongoose document instance methods (`save()`, virtual setters) MUST chain `.lean()`:
  ```typescript
  // CORRECT: Returns plain lightweight JavaScript object
  const users = await UserModel.find({ status: 'active' }).lean();

  // INCORRECT: Incurs heavy Mongoose document hydration overhead
  const users = await UserModel.find({ status: 'active' });
  ```
- Use `.lean()` across all Server Components, Route Handlers, and Server Actions reading data.

## 2. Decoupled TypeScript Interfaces
- **Clean Domain Models**: Do NOT extend `mongoose.Document` in domain data interfaces. Define pure domain interfaces:
  ```typescript
  // Pure domain interface
  export interface User {
    id: string;
    email: string;
    name: string;
    createdAt: Date;
  }
  ```
- Use `HydratedDocument<User>` or `InferSchemaType<typeof UserSchema>` when you need Mongoose document types in mutation methods.
- Keep application logic and API responses typed against the pure domain interface.

## 3. Explicit Schema Indexes
- Explicitly declare indexes directly on the schema:
  ```typescript
  const UserSchema = new Schema<User>({
    email: { type: String, required: true, unique: true, index: true },
    tenantId: { type: String, required: true, index: true },
    createdAt: { type: Date, default: Date.now },
  });

  // Compound indexes for common filter + sort queries
  UserSchema.index({ tenantId: 1, createdAt: -1 });
  ```
- Never rely on implicit unindexed queries in MongoDB collections. Always verify compound index order matches your sort and range queries.
