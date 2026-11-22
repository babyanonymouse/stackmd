# Next.js App Router Architectural Rules

## 1. Server vs. Client Component Boundaries
- **Server Components by Default**: All components in `app/` (layouts, pages, data containers) must be React Server Components (RSC) unless interactivity is required.
- **Leaf-Node Client Components**: Push the `'use client'` directive down strictly to the leaves of the component tree.
- **Interactivity Boundary Isolation**: Only mark components with `'use client'` if they require browser APIs, DOM event listeners (`onClick`, `onChange`), or React state/lifecycle hooks (`useState`, `useEffect`, `useTransition`).
- **Data Flow**: Fetch data inside Server Components and pass serializable data down to Client Components as props. Never fetch data client-side when it can be fetched on the server.

## 2. Server Actions & Mutations
- **Dedicated Actions Module**: Place Server Actions in dedicated action files marked with `'use server'` at the file header (e.g., `actions/items.ts`).
- **Zod Input Validation**: Every Server Action MUST parse its arguments with a strict Zod schema before performing any database or external operation:
  ```typescript
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
  ```
- **Typed Result Return**: Always return typed outcome objects (`{ success: true, data }` or `{ success: false, error }`) instead of throwing unhandled exceptions across the network boundary.
- **Cache Revalidation**: Call `revalidatePath` or `revalidateTag` explicitly after successful data mutations to refresh stale cached views.

## 3. File System Routing Conventions
- Follow standard App Router filenames: `layout.tsx`, `page.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`, and `route.ts`.
- Keep route handlers (`route.ts`) focused purely on REST/webhook integrations; use Server Actions for UI data mutations.
