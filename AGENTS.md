# stackmd Repository Governance & Architectural Guardrails

## 1. Package Manager Exclusivity

- Exclusively use `pnpm` for all package management and CLI task execution.
- NEVER execute `npm`, `npx`, or `yarn`. Use `pnpm dlx` for executing one-off binaries instead of `npx`.
- Maintain `pnpm-lock.yaml` integrity at all times.

## 2. TypeScript & Next.js Architecture Guardrails

- **TypeScript Strict Mode**: Zero tolerance for `any` or loose typings. Always define explicit interfaces, types, and type guards. Never use `@ts-ignore` or `@ts-nocheck` to bypass compiler checks.
- **Server Components by Default**: In Next.js App Router, all pages, layouts, and data fetching components must remain React Server Components (RSC).
- **Leaf-Node Client Components**: Push `'use client'` strictly to leaf components that require client-side browser APIs or interactivity (event handlers, React hooks).
- **Anti-Slop / Ban Placeholders**: Strictly ban placeholder comments (`// TODO`, `// implement later`, `// remaining code unchanged`) and stub implementations. Every generated or modified file must be complete, syntactically valid, and production-ready.

## 3. Post-Generation Verification Loop

- After completing any code changes, always run:
  ```bash
  pnpm tsc --noEmit && pnpm lint
  ```
- All TypeScript compiler errors and ESLint issues must be resolved cleanly before completing work.
