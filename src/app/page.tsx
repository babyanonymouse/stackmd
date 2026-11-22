import { StackWorkbench } from '@/components/StackWorkbench';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Compact Header */}
      <header className="border-b border-border bg-card/60 backdrop-blur-xs px-4 sm:px-6 py-3.5 shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-7 h-7 rounded-md bg-foreground text-background font-mono font-bold text-xs select-none">
              S
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold tracking-tight text-foreground">stackmd</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded border border-border text-muted-foreground bg-muted">
                  v0.1.0
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Deterministic agentic rulebook compiler and multi-IDE scaffolder
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded border border-border bg-muted/40 text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              client-side compiler
            </span>
          </div>
        </div>
      </header>

      {/* Interactive Workbench */}
      <div className="flex-1 flex flex-col min-h-0">
        <StackWorkbench />
      </div>
    </main>
  );
}
