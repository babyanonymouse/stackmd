# Core Architectural Guardrails & Quality Standards

## 1. Anti-Slop & Zero Placeholder Rule
- **No Incomplete Implementations**: Never emit placeholder comments such as `// TODO`, `// implement later`, `// remaining code unchanged`, or stub methods that throw "Not implemented".
- **Full Operational Code**: Every file generated or edited must be completely implemented, syntactically valid, and ready to execute immediately.
- **Defensive Engineering**: Implement explicit error handling, validating edge cases, boundary conditions, and null/undefined values.

## 2. Package Manager Mandate (pnpm Exclusively)
- Exclusively use `pnpm` for package installation, script execution, and dependency management.
- NEVER run `npm` or `yarn`.
- Use `pnpm dlx` for one-off CLI execution instead of `npx`.
- Preserve `pnpm-lock.yaml` integrity on every package modification.

## 3. Strict TypeScript Discipline
- **Strict Mode Enforced**: Strict typing enabled (`noImplicitAny: true`, `strictNullChecks: true`).
- **No `any`**: Ban the use of `any` and arbitrary type casting (`as any`). Prefer `unknown` with type narrowing, discriminating unions, and explicit type guards.
- **Explicit Signatures**: Provide explicit return types and parameter types for all exported functions and API boundaries.

## 4. Post-Generation Verification Loop
- After writing or modifying code, immediately execute the verification suite:
  ```bash
  pnpm tsc --noEmit && pnpm lint
  ```
- You must resolve all compiler errors, type mismatches, and ESLint warnings before marking any task as complete.
