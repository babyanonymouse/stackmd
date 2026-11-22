# External Design Pointer: Hallmark / PinUI

## 1. Setup Instructions (SETUP.md)
```bash
pnpm dlx @hallmark/cli init
```

## 2. Scoped Agent Rule (`components/AGENTS.md`)
Before generating, refactoring, or modifying any UI component:
1. Verify the existence of the design rules contract at `./.hallmark/RULES.md`.
2. If the file exists: Read and strictly follow the design tokens, component primitives, and styling constraints defined therein.
3. **Circuit-Breaker**: If `./.hallmark/RULES.md` does NOT exist:
   - **HALT GENERATION IMMEDIATELY**.
   - Do NOT guess, hallucinate, or generate arbitrary styles or placeholder components.
   - Prompt the user: "Hallmark design rules not found at `./.hallmark/RULES.md`. Please run the setup command first: `pnpm dlx @hallmark/cli init` (see SETUP.md for details)."
