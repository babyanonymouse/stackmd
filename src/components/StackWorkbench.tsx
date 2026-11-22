'use client';

import React, { useMemo, useState } from 'react';
import { compileStackBundle, createZipBundle } from '@/lib/compiler';
import {
  REGISTRY_CATEGORIES,
  REGISTRY_ITEMS,
  type RegistryCategory,
  type RegistryItem,
} from '@/lib/registry-manifest';
import {
  Copy,
  Check,
  Download,
  FileCode,
  FolderTree,
  Folder,
  Layers,
  Database,
  Sparkles,
  Paintbrush,
  Terminal,
} from 'lucide-react';

const CATEGORY_ICONS: Record<RegistryCategory, React.ElementType> = {
  framework: Layers,
  styling: Paintbrush,
  database: Database,
  'design-pointer': Sparkles,
};

const TAB_PRIORITY: Record<string, number> = {
  'AGENTS.md': 1,
  'SETUP.md': 2,
  'src/components/AGENTS.md': 3,
  'components/AGENTS.md': 3,
  'CLAUDE.md': 4,
  '.cursor/rules/base.mdc': 5,
  '.github/copilot-instructions.md': 6,
};

export function StackWorkbench() {
  const [selectedIds, setSelectedIds] = useState<string[]>([
    'nextjs-app-router',
    'tailwind-v4-ui',
  ]);
  const [useSrcDir, setUseSrcDir] = useState<boolean>(true);
  const [selectedTab, setSelectedTab] = useState<string>('AGENTS.md');
  const [copied, setCopied] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  // Compile bundle deterministically
  const bundle = useMemo(() => {
    return compileStackBundle(selectedIds, { useSrcDir });
  }, [selectedIds, useSrcDir]);

  // Order file tabs predictably
  const fileKeys = useMemo(() => {
    return Object.keys(bundle).sort((a, b) => {
      const priorityA = TAB_PRIORITY[a] ?? 99;
      const priorityB = TAB_PRIORITY[b] ?? 99;
      if (priorityA !== priorityB) return priorityA - priorityB;
      return a.localeCompare(b);
    });
  }, [bundle]);

  // Derive active tab cleanly without cascading effect renders
  const activeTab = bundle[selectedTab] ? selectedTab : fileKeys[0] || 'AGENTS.md';
  const activeContent = bundle[activeTab] || '';
  const lineCount = useMemo(() => activeContent.split('\n').length, [activeContent]);

  // Selection toggle handler
  const handleToggleItem = (item: RegistryItem) => {
    const isSelected = selectedIds.includes(item.id);

    if (item.category === 'database') {
      // Single-select radio behavior with deselection
      if (isSelected) {
        setSelectedIds((prev) => prev.filter((id) => id !== item.id));
      } else {
        const otherDbIds = REGISTRY_ITEMS.filter((i) => i.category === 'database').map((i) => i.id);
        setSelectedIds((prev) => [...prev.filter((id) => !otherDbIds.includes(id)), item.id]);
      }
    } else {
      // Multi-select toggle
      if (isSelected) {
        setSelectedIds((prev) => prev.filter((id) => id !== item.id));
      } else {
        setSelectedIds((prev) => [...prev, item.id]);
      }
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(activeContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy content:', err);
    }
  };

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      const blob = await createZipBundle(bundle);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'stackmd-config.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to create zip bundle:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const categories = Object.keys(REGISTRY_CATEGORIES) as RegistryCategory[];

  return (
    <div className="flex-1 flex flex-col lg:flex-row min-h-0 bg-background text-foreground">
      {/* Left Pane: Configuration Sidebar */}
      <aside className="w-full lg:w-[420px] lg:shrink-0 border-b lg:border-b-0 lg:border-r border-border bg-card/40 flex flex-col">
        {/* Workspace Options Section */}
        <div className="p-4 border-b border-border bg-card/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderTree className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs font-medium text-foreground">Project Structure</span>
            </div>
            <button
              type="button"
              onClick={() => setUseSrcDir(!useSrcDir)}
              className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-md border text-xs font-mono cursor-pointer ${
                useSrcDir
                  ? 'border-foreground/20 bg-foreground text-background font-medium'
                  : 'border-border bg-muted/60 text-muted-foreground hover:bg-muted'
              }`}
            >
              <Folder className="w-3.5 h-3.5" />
              <span>{useSrcDir ? 'src/ directory' : 'root directory'}</span>
            </button>
          </div>
          <p className="mt-1.5 text-[11px] text-muted-foreground leading-normal">
            Controls directory tree resolution for components, routes, and config shims.
          </p>
        </div>

        {/* Stack Selectors List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {categories.map((categoryKey) => {
            const meta = REGISTRY_CATEGORIES[categoryKey];
            const CategoryIcon = CATEGORY_ICONS[categoryKey] || Layers;
            const items = REGISTRY_ITEMS.filter((item) => item.category === categoryKey);

            return (
              <section key={categoryKey} className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-medium text-foreground">
                    <CategoryIcon className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>{meta.label}</span>
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground/80 px-1.5 py-0.5 rounded border border-border bg-muted/40">
                    {meta.selectionMode === 'single' ? 'single choice' : 'multi-select'}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {items.map((item) => {
                    const isSelected = selectedIds.includes(item.id);

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleToggleItem(item)}
                        className={`text-left p-3 rounded-lg border text-xs cursor-pointer relative ${
                          isSelected
                            ? 'border-foreground/30 bg-card shadow-xs'
                            : 'border-border bg-card/20 hover:bg-card/50 text-muted-foreground'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`font-medium ${
                              isSelected ? 'text-foreground' : 'text-muted-foreground'
                            }`}
                          >
                            {item.label}
                          </span>
                          <span
                            className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 border ${
                              isSelected
                                ? 'bg-foreground border-foreground text-background'
                                : 'border-border bg-muted/30'
                            }`}
                          >
                            {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                          </span>
                        </div>
                        <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">
                          {item.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>

        {/* Status Footer */}
        <div className="p-3 border-t border-border bg-card/60 text-[11px] font-mono text-muted-foreground flex items-center justify-between">
          <span>{selectedIds.length} modules active</span>
          <span>{fileKeys.length} files compiled</span>
        </div>
      </aside>

      {/* Right Pane: Live Inspector & Code Viewport */}
      <section className="flex-1 flex flex-col min-w-0 bg-card/10">
        {/* Tab Strip & Action Toolbar */}
        <div className="border-b border-border bg-card/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-3 py-2">
          {/* File Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {fileKeys.map((filePath) => {
              const isActive = filePath === activeTab;
              const isAgents = filePath.endsWith('AGENTS.md');

              return (
                <button
                  key={filePath}
                  type="button"
                  onClick={() => setSelectedTab(filePath)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-mono shrink-0 cursor-pointer border ${
                    isActive
                      ? 'border-foreground/20 bg-background text-foreground font-semibold shadow-xs'
                      : 'border-transparent text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                  }`}
                >
                  <FileCode className={`w-3.5 h-3.5 ${isAgents ? 'text-emerald-500' : ''}`} />
                  <span>{filePath}</span>
                </button>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-border bg-card hover:bg-muted text-xs font-medium text-foreground cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400 font-mono">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>Copy File</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownload}
              disabled={isDownloading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-foreground text-background text-xs font-medium cursor-pointer hover:opacity-90 disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isDownloading ? 'Packaging...' : 'Download .zip'}</span>
            </button>
          </div>
        </div>

        {/* File Header Bar */}
        <div className="px-4 py-2 border-b border-border bg-muted/20 flex items-center justify-between text-[11px] font-mono text-muted-foreground">
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5" />
            <span className="text-foreground font-medium">{activeTab}</span>
          </div>
          <div className="flex items-center gap-3">
            <span>{lineCount} lines</span>
            <span>{new Blob([activeContent]).size} bytes</span>
          </div>
        </div>

        {/* Code Content Viewport */}
        <div className="flex-1 overflow-auto bg-card/30">
          <div className="flex min-w-0 font-mono text-xs leading-relaxed">
            {/* Gutter Line Numbers */}
            <div
              className="select-none py-4 pl-4 pr-3 text-right text-muted-foreground/40 border-r border-border/60 bg-muted/20 shrink-0 font-mono"
              aria-hidden="true"
            >
              {Array.from({ length: lineCount }).map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>

            {/* Code Body */}
            <pre className="flex-1 overflow-x-auto p-4 text-foreground/90 whitespace-pre">
              <code>{activeContent}</code>
            </pre>
          </div>
        </div>
      </section>
    </div>
  );
}
