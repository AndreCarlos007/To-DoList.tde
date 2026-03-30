'use client';

import { useState } from 'react';
import { useTodos } from '@/hooks/use-todos';
import { TodoForm } from '@/components/todo-form';
import { TodoItem } from '@/components/todo-item';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

type Filter = 'all' | 'active' | 'completed';

export function TodoList() {
  const { todos, isLoading, isError, createTodo, toggleTodo, updateTodo, deleteTodo } = useTodos();
  const [filter, setFilter] = useState<Filter>('all');

  const filtered = todos.filter((t) => {
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const completedCount = todos.filter((t) => t.completed).length;
  const activeCount = todos.filter((t) => !t.completed).length;

  return (
    <div className="flex flex-col gap-6">
      <TodoForm onAdd={createTodo} />

      {/* Filtros e contadores */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex gap-2">
          {(['all', 'active', 'completed'] as Filter[]).map((f) => (
            <Button
              key={f}
              variant={filter === f ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(f)}
              className="text-xs"
            >
              {f === 'all' ? 'Todas' : f === 'active' ? 'Pendentes' : 'Concluidas'}
            </Button>
          ))}
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary">{activeCount} pendente{activeCount !== 1 ? 's' : ''}</Badge>
          <Badge variant="outline">{completedCount} concluida{completedCount !== 1 ? 's' : ''}</Badge>
        </div>
      </div>

      {/* Lista */}
      {isError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          Nao foi possivel conectar com a API. Verifique se os containers estao rodando
          corretamente com <code className="font-mono text-xs">docker compose up</code>.
        </div>
      )}

      {isLoading && (
        <ul className="flex flex-col gap-2" aria-label="Carregando tarefas">
          {[1, 2, 3].map((i) => (
            <li key={i}>
              <Skeleton className="h-12 w-full rounded-lg" />
            </li>
          ))}
        </ul>
      )}

      {!isLoading && !isError && filtered.length === 0 && (
        <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          {filter === 'all'
            ? 'Nenhuma tarefa ainda. Adicione a sua primeira tarefa acima.'
            : filter === 'active'
            ? 'Sem tarefas pendentes.'
            : 'Sem tarefas concluidas.'}
        </div>
      )}

      {!isLoading && filtered.length > 0 && (
        <ul className="flex flex-col gap-2" aria-label="Lista de tarefas">
          {filtered.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={toggleTodo}
              onUpdate={updateTodo}
              onDelete={deleteTodo}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
