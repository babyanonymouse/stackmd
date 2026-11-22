/**
 * Verification script for stackmd compiler and registry manifest.
 * Tests all combinations, intersection logic, pointers, directory tree generation,
 * and zip packaging.
 */

import assert from 'node:assert';
import { compileStackBundle, createZipBundle } from '../src/lib/compiler.ts';
import {
  REGISTRY_CATEGORIES,
  REGISTRY_ITEMS,
  validateRegistrySelection,
} from '../src/lib/registry-manifest.ts';
import { CORE_GUARDRAILS } from '../src/registry/base.ts';
import { NEXTJS_PRISMA, NEXTJS_MONGOOSE } from '../src/registry/intersections.ts';
import { HALLMARK_PINUI_POINTER } from '../src/registry/pointers.ts';

console.log('--- STARTING STACKMD COMPILER VERIFICATION ---');

// Test 1: Registry Manifest Structure & Metadata
console.log('Test 1: Validating Registry Manifest...');
assert.strictEqual(REGISTRY_CATEGORIES.framework.selectionMode, 'single');
assert.strictEqual(REGISTRY_CATEGORIES.styling.selectionMode, 'single');
assert.strictEqual(REGISTRY_CATEGORIES.database.selectionMode, 'single');
assert.strictEqual(REGISTRY_CATEGORIES['design-pointer'].selectionMode, 'multi');
assert.strictEqual(REGISTRY_ITEMS.length, 5);

// Test 2: Category Mutual Exclusion Validation
console.log('Test 2: Validating Mutual Exclusion Rules...');
const invalidDatabaseSelection = validateRegistrySelection([
  'nextjs-app-router',
  'prisma-postgres',
  'mongoose-mongodb',
]);
assert.strictEqual(invalidDatabaseSelection.valid, false);
assert.ok(invalidDatabaseSelection.errors.length > 0);
assert.match(invalidDatabaseSelection.errors[0], /only allows a single selection/);

const validDatabaseSelection = validateRegistrySelection([
  'nextjs-app-router',
  'tailwind-v4-ui',
  'prisma-postgres',
  'hallmark-pinui',
]);
assert.strictEqual(validDatabaseSelection.valid, true);
assert.strictEqual(validDatabaseSelection.errors.length, 0);

// Test 3: Default Bundle Compilation (useSrcDir: true)
console.log('Test 3: Validating Default Bundle Compilation...');
const defaultBundle = compileStackBundle(['nextjs-app-router', 'tailwind-v4-ui'], {
  useSrcDir: true,
});

assert.ok(defaultBundle['AGENTS.md'], 'AGENTS.md must exist');
assert.ok(defaultBundle['CLAUDE.md'], 'CLAUDE.md shim must exist');
assert.ok(defaultBundle['.cursor/rules/base.mdc'], 'Cursor shim must exist');
assert.ok(defaultBundle['.github/copilot-instructions.md'], 'Copilot shim must exist');
assert.strictEqual(defaultBundle['SETUP.md'], undefined, 'SETUP.md should not exist without pointers');
assert.strictEqual(
  defaultBundle['src/components/AGENTS.md'],
  undefined,
  'components/AGENTS.md should not exist without pointers'
);

// Verify AGENTS.md contents
const defaultAgentsMd = defaultBundle['AGENTS.md'];
assert.ok(defaultAgentsMd.includes('Single Source of Truth'), 'Contains header banner');
assert.ok(defaultAgentsMd.includes('pnpm exclusively'), 'Enforces pnpm exclusively');
assert.ok(defaultAgentsMd.includes(CORE_GUARDRAILS), 'CORE_GUARDRAILS included in AGENTS.md');
assert.ok(defaultAgentsMd.includes('Next.js App Router'), 'Contains Next.js section');
assert.ok(defaultAgentsMd.includes('Tailwind CSS v4'), 'Contains Tailwind section');
assert.ok(!defaultAgentsMd.includes('HMR Singleton'), 'Must not contain Prisma intersection');
assert.ok(!defaultAgentsMd.includes('Cached Connection'), 'Must not contain Mongoose intersection');
assert.ok(defaultAgentsMd.includes('globals.css'), 'Directory tree reflects globals.css');
assert.ok(defaultAgentsMd.includes('src/'), 'Directory tree reflects src/ directory');

// Test 4: Intersection Resolver: Next.js + Prisma
console.log('Test 4: Validating Next.js + Prisma Intersection Resolver...');
const prismaBundle = compileStackBundle(
  ['nextjs-app-router', 'tailwind-v4-ui', 'prisma-postgres'],
  { useSrcDir: true }
);
const prismaAgentsMd = prismaBundle['AGENTS.md'];
assert.ok(prismaAgentsMd.includes(NEXTJS_PRISMA), 'Must include NEXTJS_PRISMA intersection');
assert.ok(!prismaAgentsMd.includes('Cached Connection'), 'Must not include Mongoose intersection');
assert.ok(prismaAgentsMd.includes('schema.prisma'), 'Tree includes schema.prisma');
assert.ok(prismaAgentsMd.includes('prisma.ts'), 'Tree includes lib/prisma.ts');

// Test 5: Intersection Resolver: Next.js + Mongoose
console.log('Test 5: Validating Next.js + Mongoose Intersection Resolver...');
const mongooseBundle = compileStackBundle(
  ['nextjs-app-router', 'tailwind-v4-ui', 'mongoose-mongodb'],
  { useSrcDir: true }
);
const mongooseAgentsMd = mongooseBundle['AGENTS.md'];
assert.ok(mongooseAgentsMd.includes(NEXTJS_MONGOOSE), 'Must include NEXTJS_MONGOOSE intersection');
assert.ok(!mongooseAgentsMd.includes('PrismaClient singleton'), 'Must not include Prisma intersection');
assert.ok(mongooseAgentsMd.includes('mongodb.ts'), 'Tree includes lib/mongodb.ts');

// Test 6: External Pointer Pattern: Hallmark / PinUI (useSrcDir: true)
console.log('Test 6: Validating External Pointer Pattern with useSrcDir: true...');
const pointerSrcBundle = compileStackBundle(
  ['nextjs-app-router', 'tailwind-v4-ui', 'hallmark-pinui'],
  { useSrcDir: true }
);
assert.strictEqual(
  pointerSrcBundle['SETUP.md'],
  HALLMARK_PINUI_POINTER.setupInstructions,
  'SETUP.md matches pointer setup instructions'
);
assert.ok(
  pointerSrcBundle['SETUP.md'].includes('pnpm dlx skills add nutlope/hallmark -g'),
  'SETUP.md contains actual skills CLI command'
);
assert.strictEqual(
  pointerSrcBundle['src/components/AGENTS.md'],
  HALLMARK_PINUI_POINTER.scopedAgentRule,
  'src/components/AGENTS.md matches pointer scoped rule'
);
assert.ok(
  pointerSrcBundle['src/components/AGENTS.md'].includes('`hallmark` skill'),
  'Scoped rule references hallmark skill'
);
assert.strictEqual(
  pointerSrcBundle['components/AGENTS.md'],
  undefined,
  'components/AGENTS.md should not exist when useSrcDir is true'
);
assert.ok(
  pointerSrcBundle['AGENTS.md'].includes('src/components/AGENTS.md'),
  'Master AGENTS.md links to scoped src/components/AGENTS.md'
);

// Test 7: External Pointer Pattern: Hallmark / PinUI (useSrcDir: false)
console.log('Test 7: Validating External Pointer Pattern with useSrcDir: false...');
const pointerNoSrcBundle = compileStackBundle(
  ['nextjs-app-router', 'tailwind-v4-ui', 'hallmark-pinui'],
  { useSrcDir: false }
);
assert.ok(pointerNoSrcBundle['SETUP.md'], 'SETUP.md must be generated');
assert.ok(pointerNoSrcBundle['components/AGENTS.md'], 'components/AGENTS.md must be generated at root');
assert.strictEqual(
  pointerNoSrcBundle['src/components/AGENTS.md'],
  undefined,
  'src/components/AGENTS.md should not exist when useSrcDir is false'
);
assert.ok(
  pointerNoSrcBundle['AGENTS.md'].includes('components/AGENTS.md'),
  'Master AGENTS.md links to scoped components/AGENTS.md'
);

// Test 8: Editor Shims Fidelity
console.log('Test 8: Validating Editor Shims Fidelity...');
assert.ok(defaultBundle['CLAUDE.md'].includes('AGENTS.md'), 'Claude shim references AGENTS.md');
assert.ok(
  defaultBundle['.cursor/rules/base.mdc'].includes('AGENTS.md'),
  'Cursor shim references AGENTS.md'
);
assert.ok(
  defaultBundle['.github/copilot-instructions.md'].includes('AGENTS.md'),
  'Copilot shim references AGENTS.md'
);

// Test 9: In-Memory ZIP Bundler
console.log('Test 9: Validating JSZip In-Memory Packaging...');
const blob = await createZipBundle(pointerSrcBundle);
assert.ok(blob, 'Zip blob must be generated');
assert.ok(blob.size > 0, 'Zip blob size must be greater than 0');

console.log(`Zip blob generated successfully (${blob.size} bytes, type: ${blob.type})`);
console.log('--- ALL VERIFICATION TESTS PASSED SUCCESSFULLY! ---');
