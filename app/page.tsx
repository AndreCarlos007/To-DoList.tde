import { TodoList } from '@/components/todo-list';

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-2xl px-4 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-foreground tracking-tight">
              DevOps Todo List
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5 font-mono">
              Next.js + Node.js + PostgreSQL + Docker
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-flex h-2 w-2 rounded-full bg-green-500 animate-pulse" aria-hidden="true" />
            <span className="text-xs text-muted-foreground">API conectada</span>
          </div>
        </div>
      </header>

      {/* Conteudo principal */}
      <div className="mx-auto max-w-2xl px-4 py-8">
        <TodoList />
      </div>

      {/* Footer */}
      <footer className="border-t border-border mt-12">
        <div className="mx-auto max-w-2xl px-4 py-4 text-center">
          <p className="text-xs text-muted-foreground font-mono">
            TDE — Pratica DevOps · Analise e Desenvolvimento de Sistemas
          </p>
        </div>
      </footer>
    </main>
  );
}
