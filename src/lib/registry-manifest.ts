/**
 * Registry manifest for stackmd.
 * Defines typed categories, mutual exclusion / selection modes, and metadata.
 */

export type RegistryCategory = 'framework' | 'styling' | 'database' | 'design-pointer';

export type SelectionMode = 'single' | 'multi';

export interface CategoryMetadata {
  id: RegistryCategory;
  label: string;
  description: string;
  selectionMode: SelectionMode;
}

export interface RegistryItem {
  id: string;
  label: string;
  description: string;
  category: RegistryCategory;
  defaultSelected?: boolean;
}

export const REGISTRY_CATEGORIES: Record<RegistryCategory, CategoryMetadata> = {
  framework: {
    id: 'framework',
    label: 'Framework',
    description: 'Core application runtime and routing framework',
    selectionMode: 'single',
  },
  styling: {
    id: 'styling',
    label: 'Styling',
    description: 'Design system, utility classes, and styling engine',
    selectionMode: 'single',
  },
  database: {
    id: 'database',
    label: 'Database / ORM',
    description: 'Data persistence layer and object mapper (mutually exclusive)',
    selectionMode: 'single',
  },
  'design-pointer': {
    id: 'design-pointer',
    label: 'Design Pointers',
    description: 'External tool pointers, setup instructions, and scoped rules',
    selectionMode: 'multi',
  },
};

export const REGISTRY_ITEMS: RegistryItem[] = [
  {
    id: 'nextjs-app-router',
    label: 'Next.js App Router',
    description: 'Enforces App Router, Server Components by default, leaf-node "use client", Zod-validated Server Actions, and pnpm.',
    category: 'framework',
    defaultSelected: true,
  },
  {
    id: 'tailwind-v4-ui',
    label: 'Tailwind CSS v4',
    description: 'Mobile-first breakpoints, semantic CSS tokens, zero arbitrary magic pixel values, and primitive composition.',
    category: 'styling',
    defaultSelected: true,
  },
  {
    id: 'prisma-postgres',
    label: 'Prisma + PostgreSQL',
    description: 'Relational ORM: schema naming discipline, transactional writes, explicit select/include to prevent N+1 queries.',
    category: 'database',
    defaultSelected: false,
  },
  {
    id: 'mongoose-mongodb',
    label: 'Mongoose + MongoDB',
    description: 'Document ODM: mandatory .lean() on read queries, decoupled TypeScript interfaces, explicit schema indexing.',
    category: 'database',
    defaultSelected: false,
  },
  {
    id: 'hallmark-pinui',
    label: 'Hallmark / PinUI Pointer',
    description: 'External design pointer: generates SETUP.md bootstrap instructions and scoped component circuit-breaker rule.',
    category: 'design-pointer',
    defaultSelected: false,
  },
];

/**
 * Look up a registry item by ID.
 */
export function getRegistryItem(id: string): RegistryItem | undefined {
  return REGISTRY_ITEMS.find((item) => item.id === id);
}

/**
 * Get all registry items belonging to a given category.
 */
export function getItemsByCategory(category: RegistryCategory): RegistryItem[] {
  return REGISTRY_ITEMS.filter((item) => item.category === category);
}

/**
 * Validate that a set of selected item IDs adheres to category selection modes
 * (e.g., verifying that database has at most 1 item selected).
 */
export function validateRegistrySelection(selectedIds: string[]): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const selectedItems = selectedIds
    .map((id) => getRegistryItem(id))
    .filter((item): item is RegistryItem => Boolean(item));

  const itemsByCategory: Record<RegistryCategory, RegistryItem[]> = {
    framework: [],
    styling: [],
    database: [],
    'design-pointer': [],
  };

  for (const item of selectedItems) {
    itemsByCategory[item.category].push(item);
  }

  for (const [catKey, meta] of Object.entries(REGISTRY_CATEGORIES)) {
    const category = catKey as RegistryCategory;
    const categoryItems = itemsByCategory[category];
    if (meta.selectionMode === 'single' && categoryItems.length > 1) {
      const names = categoryItems.map((i) => `"${i.label}"`).join(', ');
      errors.push(
        `Category "${meta.label}" only allows a single selection, but multiple items were selected: ${names}.`
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
