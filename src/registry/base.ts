/**
 * Base atomic rule modules for stackmd.
 * Stored as pure exported template strings for 100% client-side compilation without fs or server roundtrips.
 */

export const CORE_GUARDRAILS = `## Core Architectural Guardrails & Quality Standards

### 1. Anti-Slop & Zero Placeholder Rule
- **No Incomplete Implementations**: Never emit placeholder comments such as \`// TODO\`, \`// implement later\`, \`// remaining code unchanged\`, or stub methods that throw "Not implemented".
- **Full Operational Code**: Every file generated or edited must be completely implemented, syntactically valid, and ready to execute immediately.
- **Defensive Engineering**: Implement explicit error handling, validating edge cases, boundary conditions, and null/undefined values.

### 2. Package Manager Mandate (pnpm Exclusively)
- Exclusively use \`pnpm\` for package installation, script execution, and dependency management.
- NEVER run \`npm\` or \`yarn\`.
- Use \`pnpm dlx\` for one-off CLI execution instead of \`npx\`.
- Preserve \`pnpm-lock.yaml\` integrity on every package modification.

### 3. Strict TypeScript Discipline
- **Strict Mode Enforced**: Strict typing enabled (\`noImplicitAny: true\`, \`strictNullChecks: true\`).
- **No \`any\`**: Ban the use of \`any\` and arbitrary type casting (\`as any\`). Prefer \`unknown\` with type narrowing, discriminating unions, and explicit type guards.
- **Explicit Signatures**: Provide explicit return types and parameter types for all exported functions and API boundaries.

### 4. Post-Generation Verification Loop
- After writing or modifying code, immediately execute the verification suite:
  \`\`\`bash
  pnpm tsc --noEmit && pnpm lint
  \`\`\`
- You must resolve all compiler errors, type mismatches, and ESLint warnings before marking any task as complete.`;

export const NEXTJS_APP_ROUTER = `## Next.js App Router Architectural Rules

### 1. Server vs. Client Component Boundaries
- **Server Components by Default**: All components in \`app/\` (layouts, pages, data containers) must be React Server Components (RSC) unless interactivity is required.
- **Leaf-Node Client Components**: Push the \`'use client'\` directive down strictly to the leaves of the component tree.
- **Interactivity Boundary Isolation**: Only mark components with \`'use client'\` if they require browser APIs, DOM event listeners (\`onClick\`, \`onChange\`), or React state/lifecycle hooks (\`useState\`, \`useEffect\`, \`useTransition\`).
- **Data Flow**: Fetch data inside Server Components and pass serializable data down to Client Components as props. Never fetch data client-side when it can be fetched on the server.

### 2. Server Actions & Mutations
- **Dedicated Actions Module**: Place Server Actions in dedicated action files marked with \`'use server'\` at the file header (e.g., \`actions/items.ts\`).
- **Zod Input Validation**: Every Server Action MUST parse its arguments with a strict Zod schema before performing any database or external operation:
  \`\`\`typescript
  'use server';

  import { z } from 'zod';

  const ActionInputSchema = z.object({
    id: z.string().cuid(),
    title: z.string().min(1).max(100),
  });

  export async function updateItemAction(rawInput: unknown) {
    const result = ActionInputSchema.safeParse(rawInput);
    if (!result.success) {
      return { success: false, error: result.error.flatten() };
    }
    // Perform authorized mutation...
    return { success: true, data: result.data };
  }
  \`\`\`
- **Typed Result Return**: Always return typed outcome objects (\`{ success: true, data }\` or \`{ success: false, error }\`) instead of throwing unhandled exceptions across the network boundary.
- **Cache Revalidation**: Call \`revalidatePath\` or \`revalidateTag\` explicitly after successful data mutations to refresh stale cached views.

### 3. File System Routing Conventions
- Follow standard App Router filenames: \`layout.tsx\`, \`page.tsx\`, \`loading.tsx\`, \`error.tsx\`, \`not-found.tsx\`, and \`route.ts\`.
- Keep route handlers (\`route.ts\`) focused purely on REST/webhook integrations; use Server Actions for UI data mutations.`;

export const TAILWIND_V4_UI = `## Tailwind CSS v4 UI Styling Guidelines

### 1. Mobile-First Responsive Rules
- Always build layout and styles mobile-first.
- Write default utility classes for the base mobile viewport, layering breakpoint prefixes progressively:
  - Base: Mobile (< 640px)
  - \`sm:\`: Small tablets & landscape phones (>= 640px)
  - \`md:\`: Tablets (>= 768px)
  - \`lg:\`: Desktops / Laptops (>= 1024px)
  - \`xl:\`: Large screens (>= 1280px)
  - \`2xl:\`: Ultra-wide screens (>= 1536px)
- Never override desktop styles down to mobile using inverse logic.

### 2. Semantic CSS Tokens & Theming
- Always use semantic design tokens and CSS variable-backed classes for color, background, and borders:
  - \`bg-background\`, \`bg-card\`, \`bg-popover\`, \`bg-primary\`, \`bg-secondary\`, \`bg-muted\`
  - \`text-foreground\`, \`text-primary-foreground\`, \`text-muted-foreground\`
  - \`border-border\`, \`border-input\`, \`ring-ring\`
- Never hardcode raw hex codes or arbitrary palette colors (\`bg-[#1a1a1a]\`, \`text-blue-500\`) when a theme token exists.

### 3. Zero Arbitrary Magic Pixel Values
- Strictly avoid arbitrary one-off pixel values:
  - BANNED: \`w-[347px]\`, \`h-[43px]\`, \`p-[13px]\`, \`top-[7px]\`, \`text-[15px]\`.
- Use the standard Tailwind spacing scale (\`p-2\`, \`p-4\`, \`gap-3\`, \`h-10\`, \`w-full\`, \`max-w-md\`).
- If an exact dimension is structurally required by an external embed, define a reusable named design token in your theme CSS instead of littering arbitrary brackets.

### 4. Clean Primitive Composition
- Use the \`cn()\` utility (\`clsx\` + \`tailwind-merge\`) to safely merge conditional classes and component prop overrides:
  \`\`\`typescript
  import { clsx, type ClassValue } from 'clsx';
  import { twMerge } from 'tailwind-merge';

  export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
  }
  \`\`\`
- Keep component markup readable and cleanly split complex conditional styles.`;

export const PRISMA_POSTGRES = `## Prisma & PostgreSQL Discipline

### 1. Schema Naming Discipline
- **Models**: PascalCase for model declarations (e.g., \`model UserProfile { ... }\`).
- **Database Tables**: Explicitly map models to snake_case table names using \`@@map("user_profiles")\`.
- **Fields**: camelCase for model field names, mapped to snake_case database columns using \`@map("created_at")\`.
- **Primary Keys**: Use consistent, collision-resistant string IDs such as CUID or UUID:
  \`\`\`prisma
  id String @id @default(cuid())
  \`\`\`
- **Timestamps**: Explicit \`createdAt\` and \`updatedAt\` timestamps on all mutable entities:
  \`\`\`prisma
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  \`\`\`
- **Explicit Indexes**: Declare explicit composite indexes and unique constraints (\`@@index\`, \`@@unique\`) for frequently queried foreign keys and search filters.

### 2. Transactional Writes
- All multi-step mutations, dependent operations, or balance/counter updates MUST execute within a Prisma transaction to guarantee ACID integrity:
  \`\`\`typescript
  await prisma.$transaction(async (tx) => {
    const account = await tx.account.update({
      where: { id: senderId },
      data: { balance: { decrement: amount } },
    });
    await tx.ledgerEntry.create({
      data: { accountId: account.id, amount: -amount },
    });
  });
  \`\`\`
- Avoid performing side effects (emails, external API requests) inside an interactive transaction block.

### 3. Query Discipline & Preventing N+1 Waterfalls
- **Explicit Projections**: Always use \`select\` to retrieve only the fields needed by the caller. Never perform open \`prisma.model.findMany()\` without field projection on tables containing wide text or binary columns.
- **Explicit Relation Loading**: Use \`include\` or \`select\` to load related models in batch queries. Never query relations inside a loop over parent results (\`for (const item of items) await prisma...\`).`;

export const MONGOOSE_MONGODB = `## Mongoose & MongoDB Guidelines

### 1. Mandatory .lean() on Read Queries
- **Performance by Default**: All read queries (\`find\`, \`findOne\`, \`findById\`) that do not require Mongoose document instance methods (\`save()\`, virtual setters) MUST chain \`.lean()\`:
  \`\`\`typescript
  // CORRECT: Returns plain lightweight JavaScript object
  const users = await UserModel.find({ status: 'active' }).lean();

  // INCORRECT: Incurs heavy Mongoose document hydration overhead
  const users = await UserModel.find({ status: 'active' });
  \`\`\`
- Use \`.lean()\` across all Server Components, Route Handlers, and Server Actions reading data.

### 2. Decoupled TypeScript Interfaces
- **Clean Domain Models**: Do NOT extend \`mongoose.Document\` in domain data interfaces. Define pure domain interfaces:
  \`\`\`typescript
  // Pure domain interface
  export interface User {
    id: string;
    email: string;
    name: string;
    createdAt: Date;
  }
  \`\`\`
- Use \`HydratedDocument<User>\` or \`InferSchemaType<typeof UserSchema>\` when you need Mongoose document types in mutation methods.
- Keep application logic and API responses typed against the pure domain interface.

### 3. Explicit Schema Indexes
- Explicitly declare indexes directly on the schema:
  \`\`\`typescript
  const UserSchema = new Schema<User>({
    email: { type: String, required: true, unique: true, index: true },
    tenantId: { type: String, required: true, index: true },
    createdAt: { type: Date, default: Date.now },
  });

  // Compound indexes for common filter + sort queries
  UserSchema.index({ tenantId: 1, createdAt: -1 });
  \`\`\`
- Never rely on implicit unindexed queries in MongoDB collections. Always verify compound index order matches your sort and range queries.`;
