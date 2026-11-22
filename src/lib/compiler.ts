/**
 * Pure TypeScript compiler engine for stackmd.
 * Assembles master AGENTS.md, thin editor shims, external tool pointers,
 * and scoped rules into a CompiledBundle.
 *
 * Runs 100% client-side with zero node:fs or server round-trips.
 */

import {
  CORE_GUARDRAILS,
  NEXTJS_APP_ROUTER,
  TAILWIND_V4_UI,
  PRISMA_POSTGRES,
  MONGOOSE_MONGODB,
} from '../registry/base';
import { NEXTJS_PRISMA, NEXTJS_MONGOOSE } from '../registry/intersections';
import { HALLMARK_PINUI_POINTER } from '../registry/pointers';
import { getRegistryItem } from './registry-manifest';
import JSZip from 'jszip';

export interface CompilerOptions {
  useSrcDir: boolean;
}

export type CompiledBundle = Record<string, string>;

/**
 * Generate a dynamic ASCII directory tree reflecting stack choices and directory structure.
 */
function generateAsciiDirectoryTree(selectedSet: Set<string>, useSrcDir: boolean): string {
  const hasNext = selectedSet.has('nextjs-app-router');
  const hasTailwind = selectedSet.has('tailwind-v4-ui');
  const hasPrisma = selectedSet.has('prisma-postgres');
  const hasMongoose = selectedSet.has('mongoose-mongodb');
  const hasPointer = selectedSet.has('hallmark-pinui');

  const lines: string[] = ['project-root/'];

  // Root level editor and config files
  lines.push('├── AGENTS.md                      # [MASTER] Single Source of Truth (loaded automatically)');
  lines.push('├── CLAUDE.md                      # [SHIM] "Read and strictly obey ./AGENTS.md"');
  lines.push('├── .cursor/');
  lines.push('│   └── rules/');
  lines.push('│       └── base.mdc               # [SHIM] Cursor-native rule pointing to ./AGENTS.md');
  lines.push('├── .github/');
  lines.push('│   └── copilot-instructions.md    # [SHIM] Copilot rule pointing to ./AGENTS.md');

  if (hasPointer) {
    lines.push('├── SETUP.md                       # [BOOTSTRAP] CLI commands for external tools');
  }

  if (useSrcDir) {
    if (hasPrisma) {
      lines.push('├── prisma/');
      lines.push('│   └── schema.prisma              # Prisma schema definitions');
    }
    lines.push('├── public/');
    lines.push('├── src/');

    const srcSubdirs: string[] = [];
    if (hasNext) srcSubdirs.push('app');
    if (hasPointer) srcSubdirs.push('components');
    if (hasPrisma || hasMongoose) srcSubdirs.push('lib');

    srcSubdirs.forEach((dir, dirIdx) => {
      const isLastDir = dirIdx === srcSubdirs.length - 1;
      const dirPrefix = isLastDir ? '└── ' : '├── ';
      const childPrefix = isLastDir ? '    ' : '│   ';

      lines.push(`│   ${dirPrefix}${dir}/`);

      if (dir === 'app') {
        if (hasTailwind) {
          lines.push(`│   ${childPrefix}├── globals.css            # Tailwind CSS styling tokens`);
        }
        lines.push(`│   ${childPrefix}├── layout.tsx             # Root layout (Server Component)`);
        lines.push(`│   ${childPrefix}└── page.tsx               # Root page (Server Component)`);
      } else if (dir === 'components') {
        lines.push(`│   ${childPrefix}└── AGENTS.md              # [SCOPED] UI component rules & circuit-breaker`);
      } else if (dir === 'lib') {
        const libFiles: { name: string; desc: string }[] = [];
        if (hasPrisma) libFiles.push({ name: 'prisma.ts', desc: 'Global Prisma Client singleton' });
        if (hasMongoose) libFiles.push({ name: 'mongodb.ts', desc: 'Cached global Mongoose connection' });

        libFiles.forEach((file, fileIdx) => {
          const isLastFile = fileIdx === libFiles.length - 1;
          const fileTree = isLastFile ? '└── ' : '├── ';
          lines.push(`│   ${childPrefix}${fileTree}${file.name.padEnd(23, ' ')}# ${file.desc}`);
        });
      }
    });
  } else {
    // Non-src directory layout
    if (hasNext) {
      lines.push('├── app/');
      if (hasTailwind) {
        lines.push('│   ├── globals.css                # Tailwind CSS styling tokens');
      }
      lines.push('│   ├── layout.tsx                 # Root layout (Server Component)');
      lines.push('│   └── page.tsx                   # Root page (Server Component)');
    }

    if (hasPointer) {
      lines.push('├── components/');
      lines.push('│   └── AGENTS.md                  # [SCOPED] UI component rules & circuit-breaker');
    }

    if (hasPrisma || hasMongoose) {
      lines.push('├── lib/');
      const libFiles: { name: string; desc: string }[] = [];
      if (hasPrisma) libFiles.push({ name: 'prisma.ts', desc: 'Global Prisma Client singleton' });
      if (hasMongoose) libFiles.push({ name: 'mongodb.ts', desc: 'Cached global Mongoose connection' });

      libFiles.forEach((file, fileIdx) => {
        const isLastFile = fileIdx === libFiles.length - 1;
        const fileTree = isLastFile ? '└── ' : '├── ';
        lines.push(`│   ${fileTree}${file.name.padEnd(27, ' ')}# ${file.desc}`);
      });
    }

    if (hasPrisma) {
      lines.push('├── prisma/');
      lines.push('│   └── schema.prisma              # Prisma schema definitions');
    }

    lines.push('├── public/');
  }

  lines.push('├── package.json');
  lines.push('└── tsconfig.json');

  return lines.join('\n');
}

/**
 * Compile selected registry stack items into a unified master AGENTS.md document.
 */
function assembleMasterAgentsMd(selectedIds: string[], options: CompilerOptions): string {
  const selectedSet = new Set(selectedIds);
  const sections: string[] = [];

  // Title Banner
  sections.push(`# AGENTS.md - Master Architecture & Agentic Guidelines

> Single Source of Truth for all AI coding agents (Claude, Cursor, Copilot, Antigravity) working in this repository.
> All agents must read and strictly obey this unified document.`);

  // Slot A: Role, Package Manager (pnpm), & Stack Matrix
  const stackRows = selectedIds
    .map((id) => {
      const item = getRegistryItem(id);
      return item ? `| \`${item.category}\` | **${item.label}** | ${item.description} |` : null;
    })
    .filter(Boolean)
    .join('\n');

  sections.push(`## 1. Project Role & Stack Matrix

### Mission & Operational Mandate
This repository enforces deterministic, production-grade engineering practices. All code modifications must be complete, syntactically valid, and strictly typed. Placeholders and stub implementations are strictly banned.

### Package Manager Exclusivity
- **pnpm exclusively**: Run all commands via \`pnpm\` (never \`npm\` or \`yarn\`).
- CLI tool execution: Use \`pnpm dlx <package>\` instead of \`npx\`.
- Maintain \`pnpm-lock.yaml\` consistency with zero drift.

### Active Stack Matrix
| Layer | Selection | Description |
|---|---|---|
${stackRows || '| *none* | *No optional modules selected* | Default baseline guardrails active |'}`);

  // Slot B: Dynamic Directory Tree
  const asciiTree = generateAsciiDirectoryTree(selectedSet, options.useSrcDir);
  sections.push(`## 2. Repository Architecture & Directory Tree

The repository adheres to the following structural convention (\`${options.useSrcDir ? 'src/' : 'root'}\` directory layout):

\`\`\`
${asciiTree}
\`\`\``);

  // Slot C: Post-Generation Verification Loop & Core Guardrails
  sections.push(CORE_GUARDRAILS);

  // Base Modules
  if (selectedSet.has('nextjs-app-router')) {
    sections.push(NEXTJS_APP_ROUTER);
  }

  if (selectedSet.has('tailwind-v4-ui')) {
    sections.push(TAILWIND_V4_UI);
  }

  if (selectedSet.has('prisma-postgres')) {
    sections.push(PRISMA_POSTGRES);
  }

  if (selectedSet.has('mongoose-mongodb')) {
    sections.push(MONGOOSE_MONGODB);
  }

  // Intersection Modules (Automatically Resolved)
  if (selectedSet.has('nextjs-app-router') && selectedSet.has('prisma-postgres')) {
    sections.push(NEXTJS_PRISMA);
  }

  if (selectedSet.has('nextjs-app-router') && selectedSet.has('mongoose-mongodb')) {
    sections.push(NEXTJS_MONGOOSE);
  }

  // Scoped Overrides & External Pointers Notice
  if (selectedSet.has('hallmark-pinui')) {
    const componentAgentsPath = `${options.useSrcDir ? 'src/' : ''}components/AGENTS.md`;
    sections.push(`## 3. Scoped UI Component Rules & External Tool Pointers

- **UI Component Scoped Rules**: Before modifying or creating components in \`${options.useSrcDir ? 'src/' : ''}components/\`, agents MUST obey the scoped rules in [\`${componentAgentsPath}\`](./${componentAgentsPath}).
- **Design Rules Contract**: Agents must verify that \`./.hallmark/RULES.md\` exists before generating UI code. If missing, follow the bootstrap instructions in [\`SETUP.md\`](./SETUP.md).`);
  }

  return sections.join('\n\n---\n\n') + '\n';
}

/**
 * Editor shim files pointing directly to AGENTS.md
 */
const CLAUDE_SHIM = `<!-- Claude Code Rules Shim -->
# Claude Code Rules

Read and strictly obey the unified repository rules and architectural guardrails defined in:
- [AGENTS.md](./AGENTS.md)

Do not deviate from the single source of truth established in \`./AGENTS.md\`.
`;

const CURSOR_SHIM = `---
description: Core project rules and architectural guidelines
globs: *
alwaysApply: true
---

# Cursor Rules - Base Architecture

Read and strictly obey the unified project rules defined in \`./AGENTS.md\`.
Refer to [AGENTS.md](../../AGENTS.md) as the single source of truth for code style, framework conventions, and verification steps.
`;

const COPILOT_SHIM = `# GitHub Copilot Instructions

Read and strictly obey all architectural rules, coding standards, and project constraints defined in:
- \`./AGENTS.md\`

Ensure all code generation strictly complies with \`./AGENTS.md\` as the master single source of truth.
`;

/**
 * Compiles a stack configuration into a bundle of file paths and string contents.
 * Pure function: runs in browser, node, edge, or web worker without disk I/O.
 */
export function compileStackBundle(
  selectedIds: string[],
  options: CompilerOptions = { useSrcDir: true }
): CompiledBundle {
  const selectedSet = new Set(selectedIds);
  const bundle: CompiledBundle = {};

  // 1. Master AGENTS.md
  bundle['AGENTS.md'] = assembleMasterAgentsMd(selectedIds, options);

  // 2. Thin Editor Shims
  bundle['CLAUDE.md'] = CLAUDE_SHIM;
  bundle['.cursor/rules/base.mdc'] = CURSOR_SHIM;
  bundle['.github/copilot-instructions.md'] = COPILOT_SHIM;

  // 3. External Tool Pointers & Scoped Component Rules
  if (selectedSet.has('hallmark-pinui')) {
    bundle['SETUP.md'] = HALLMARK_PINUI_POINTER.setupInstructions;

    const componentAgentsPath = options.useSrcDir
      ? 'src/components/AGENTS.md'
      : 'components/AGENTS.md';
    bundle[componentAgentsPath] = HALLMARK_PINUI_POINTER.scopedAgentRule;
  }

  return bundle;
}

/**
 * In-memory packager: creates a downloadable ZIP Blob from a compiled bundle.
 * Streams directly in the browser via JSZip without server round-trips.
 */
export async function createZipBundle(bundle: CompiledBundle): Promise<Blob> {
  const zip = new JSZip();

  for (const [filePath, content] of Object.entries(bundle)) {
    zip.file(filePath, content);
  }

  return zip.generateAsync({ type: 'blob' });
}
