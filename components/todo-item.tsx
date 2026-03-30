'use client';

import { useState } from 'react';
import { Pencil, Trash2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import type { Todo } from '@/hooks/use-todos';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: number, completed: boolean) => Promise<void>;
  onUpdate: (id: number, title: string) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export function TodoItem({ todo, onToggle, onUpdate, onDelete }: TodoItemProps) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(todo.title);
  const [loadingToggle, setLoadingToggle] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);

  async function handleToggle() {
    setLoadingToggle(true);
    try {
      await onToggle(todo.id, !todo.completed);
    } finally {
      setLoadingToggle(false);
    }
  }

  async function handleSave() {
    const trimmed = editValue.trim();
    if (!trimmed || trimmed === todo.title) {
      setEditing(false);
      setEditValue(todo.title);
      return;
    }
    setLoadingSave(true);
    try {
      await onUpdate(todo.id, trimmed);
      setEditing(false);
    } finally {
      setLoadingSave(false);
    }
  }

  async function handleDelete() {
    setLoadingDelete(true);
    try {
      await onDelete(todo.id);
    } finally {
      setLoadingDelete(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') {
      setEditing(false);
      setEditValue(todo.title);
    }
  }

  return (
    <li className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 transition-colors hover:bg-accent/30">
      <Checkbox
        checked={todo.completed}
        onCheckedChange={handleToggle}
        disabled={loadingToggle}
        aria-label={`Marcar "${todo.title}" como ${todo.completed ? 'incompleta' : 'completa'}`}
        className="shrink-0"
      />

      {editing ? (
        <div className="flex flex-1 items-center gap-2">
          <Input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            className="flex-1 h-8 text-sm"
            disabled={loadingSave}
          />
          <Button
            size="icon"
            variant="ghost"
            onClick={handleSave}
            disabled={loadingSave}
            aria-label="Salvar edição"
            className="h-8 w-8 text-primary hover:text-primary"
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => { setEditing(false); setEditValue(todo.title); }}
            aria-label="Cancelar edição"
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <>
          <span
            className={cn(
              'flex-1 text-sm leading-relaxed',
              todo.completed && 'line-through text-muted-foreground'
            )}
          >
            {todo.title}
          </span>
          <span className="text-xs text-muted-foreground hidden sm:block shrink-0">
            {new Date(todo.created_at).toLocaleDateString('pt-BR')}
          </span>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setEditing(true)}
            aria-label={`Editar "${todo.title}"`}
            className="h-8 w-8 shrink-0"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={handleDelete}
            disabled={loadingDelete}
            aria-label={`Deletar "${todo.title}"`}
            className="h-8 w-8 shrink-0 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </>
      )}
    </li>
  );
}
