<!-- SCOPED UI GUARDRAILS: Hallmark Design Skill -->
# UI Component Design System Rules & Circuit-Breaker

## Critical Pre-Condition for AI Agents
Before generating, refactoring, or modifying any UI component in this directory:
1. Verify the availability of the `hallmark` skill in this repository (`.agents/skills/hallmark/SKILL.md` or global agent skills).
2. **If the `hallmark` skill IS AVAILABLE**:
   - Invoke and strictly obey the installed `hallmark` skill rules.
   - Adhere strictly to "The Floor":
     - Every color and font must pass through tokens declared at `:root` (or a declared theme block).
     - Never use `transition: all` or animate layout metrics (`width`, `height`, `top`, `left`).
     - `overflow-x: clip` on `html` and `body`. Never `hidden`, never `100vw`.
     - Zero AI clichés (no fake metrics, unearned testimonials, small-caps/tracked uppercase eyebrows).
     - Proper accessibility: instant `:focus-visible` states and `prefers-reduced-motion` fallbacks.
3. **CIRCUIT-BREAKER (If the `hallmark` skill IS NOT AVAILABLE)**:
   - **HALT GENERATION IMMEDIATELY**.
   - Do NOT guess, hallucinate, or generate arbitrary styles or placeholder components.
   - Prompt the user:
     > "Hallmark design skill not found. Please install the skill first: `pnpm dlx skills add nutlope/hallmark -g` (or locally: `pnpm dlx skills add nutlope/hallmark`). See SETUP.md for details."
