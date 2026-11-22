---
name: hallmark
description: Design skill for websites and new pages that look designed, not generated. Use when the user asks to build or design something new, or names Hallmark. Never use it on an existing design unless the user names Hallmark, as in `/hallmark redesign <path>`.
argument-hint: <prompt> | redesign <path> | audit <path>
version: 2.0.0
---

# Hallmark: Opinionated Anti-AI-Slop Web Design

Hallmark makes the UIs a coding assistant generates look intentionally designed, not generically generated. It establishes a hard floor against typical model biases, enforcing structural, typographic, and layout variety.

## The Floor (Strict Non-Negotiable Rules)
These rules bind every output without exception:
1. **Tokens at :root**: Every color and font must pass through a token declared at `:root` (or a declared theme block). No literal color or font-family past the token block.
2. **Animation Discipline**: Never `transition: all`. Never animate `width`, `height`, `top`, or `left`. Prefer `transform` and `opacity`.
3. **No Mixed Emphasis**: Never one italic word inside a roman heading.
4. **Horizontal Overflow Protection**: Use `overflow-x: clip` on both `html` and `body`. Never `overflow-x: hidden`, never `100vw`.
5. **Grid Track Wrapping**: Image-bearing grid tracks must use `minmax(0, 1fr)`; display headings must carry `overflow-wrap: break-word; min-width: 0`.
6. **Focus Accessibility**: Every interactive element must have a clear `:focus-visible` state that appears instantly.
7. **Reduced Motion Fallback**: Every animation must include a `@media (prefers-reduced-motion: reduce)` fallback.
8. **No Invented Proof**: Never invent fake metrics, dummy testimonials, fictional logo walls, or fabricated case-study numbers. Use authentic copy or ask for real content.
9. **No Eyebrows or Small-Caps Clutter**: Never use small-caps or tracked uppercase "eyebrows" above headings. Labels, tags, and nav items use standard sentence case in the theme face.
10. **Clean Metadata Formatting**: Never use middle-dot-joined metadata strings (`Item · Category · Date`), arrows glued to link text (`Read more ->`), or decorative pulsing status dots.

## Operational Modes

### 1. New Build (`/hallmark <prompt>`)
- Selects a purposeful layout and thematic material based on the specific job the visitor is trying to perform.
- Builds the hero section in isolation first to establish visual hierarchy, typography, and contrast.
- Renders the complete interface adhering strictly to "The Floor" guardrails.

### 2. Audit (`/hallmark audit <path>`)
- Analyzes an existing target against the anti-AI-slop checklist.
- Reports detected visual clichés, unearned metrics, and CSS rule violations.

### 3. Redesign (`/hallmark redesign <path>`)
- Reskins and elevates an existing layout.
- Strictly preserves existing interactive functionality, forms, links, and event handlers.
