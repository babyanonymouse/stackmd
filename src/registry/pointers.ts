/**
 * External pointer rules for stackmd.
 * Injects setup commands and scoped circuit-breaker rules for third-party tooling.
 */

const setupInstructions = `# Hallmark Design Skill Setup

This project uses Hallmark (from nutlope/hallmark) for opinionated, anti-AI-slop UI design contracts, typography, and styling constraints.

## Global Installation (Recommended)

Install the Hallmark agent skill globally:

\`\`\`bash
pnpm dlx skills add nutlope/hallmark -g
\`\`\`

*Alternative with npm:*
\`\`\`bash
npx skills add nutlope/hallmark -g
\`\`\`

## Local Project Installation

Alternatively, you can install the skill locally inside this repository:

\`\`\`bash
pnpm dlx skills add nutlope/hallmark
\`\`\`

## Verification

After installation, the skill file will reside at:
- Global: \`~/.agents/skills/hallmark/SKILL.md\` (or \`~/.claude/skills/hallmark/SKILL.md\`)
- Local: \`.agents/skills/hallmark/SKILL.md\`

AI coding agents will detect and invoke this skill before generating or modifying any UI components.
`;

const scopedAgentRule = `<!-- SCOPED UI GUARDRAILS: Hallmark Design Skill -->
# UI Component Design System Rules & Circuit-Breaker

## Critical Pre-Condition for AI Agents
Before generating, refactoring, or modifying any UI component in this directory:
1. Verify the availability of the \`hallmark\` skill in this repository (\`.agents/skills/hallmark/SKILL.md\` or global agent skills).
2. **If the \`hallmark\` skill IS AVAILABLE**:
   - Invoke and strictly obey the installed \`hallmark\` skill rules.
   - Adhere strictly to "The Floor":
     - Every color and font must pass through tokens declared at \`:root\` (or a declared theme block).
     - Never use \`transition: all\` or animate layout metrics (\`width\`, \`height\`, \`top\`, \`left\`).
     - \`overflow-x: clip\` on \`html\` and \`body\`. Never \`hidden\`, never \`100vw\`.
     - Zero AI clichés (no fake metrics, unearned testimonials, small-caps/tracked uppercase eyebrows).
     - Proper accessibility: instant \`:focus-visible\` states and \`prefers-reduced-motion\` fallbacks.
3. **CIRCUIT-BREAKER (If the \`hallmark\` skill IS NOT AVAILABLE)**:
   - **HALT GENERATION IMMEDIATELY**.
   - Do NOT guess, hallucinate, or generate arbitrary styles or placeholder components.
   - Prompt the user:
     > "Hallmark design skill not found. Please install the skill first: \`pnpm dlx skills add nutlope/hallmark -g\` (or locally: \`pnpm dlx skills add nutlope/hallmark\`). See SETUP.md for details."
`;

export const HALLMARK_PINUI_POINTER = {
  setupInstructions,
  scopedAgentRule,
};

export { setupInstructions, scopedAgentRule };
