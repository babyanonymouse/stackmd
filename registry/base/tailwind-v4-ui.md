# Tailwind CSS v4 UI Styling Guidelines

## 1. Mobile-First Responsive Rules
- Always build layout and styles mobile-first.
- Write default utility classes for the base mobile viewport, layering breakpoint prefixes progressively:
  - Base: Mobile (< 640px)
  - `sm:`: Small tablets & landscape phones (>= 640px)
  - `md:`: Tablets (>= 768px)
  - `lg:`: Desktops / Laptops (>= 1024px)
  - `xl:`: Large screens (>= 1280px)
  - `2xl:`: Ultra-wide screens (>= 1536px)
- Never override desktop styles down to mobile using inverse logic.

## 2. Semantic CSS Tokens & Theming
- Always use semantic design tokens and CSS variable-backed classes for color, background, and borders:
  - `bg-background`, `bg-card`, `bg-popover`, `bg-primary`, `bg-secondary`, `bg-muted`
  - `text-foreground`, `text-primary-foreground`, `text-muted-foreground`
  - `border-border`, `border-input`, `ring-ring`
- Never hardcode raw hex codes or arbitrary palette colors (`bg-[#1a1a1a]`, `text-blue-500`) when a theme token exists.

## 3. Zero Arbitrary Magic Pixel Values
- Strictly avoid arbitrary one-off pixel values:
  - BANNED: `w-[347px]`, `h-[43px]`, `p-[13px]`, `top-[7px]`, `text-[15px]`.
- Use the standard Tailwind spacing scale (`p-2`, `p-4`, `gap-3`, `h-10`, `w-full`, `max-w-md`).
- If an exact dimension is structurally required by an external embed, define a reusable named design token in your theme CSS instead of littering arbitrary brackets.

## 4. Clean Primitive Composition
- Use the `cn()` utility (`clsx` + `tailwind-merge`) to safely merge conditional classes and component prop overrides:
  ```typescript
  import { clsx, type ClassValue } from 'clsx';
  import { twMerge } from 'tailwind-merge';

  export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
  }
  ```
- Keep component markup readable and cleanly split complex conditional styles.
