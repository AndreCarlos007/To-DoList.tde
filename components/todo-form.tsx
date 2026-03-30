'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface TodoFormProps {
  onAdd: (title: string) => Promise<void>;
}

export function TodoForm({ onAdd }: TodoFormProps) {
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) {
      setError('Digite o nome da tarefa');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await onAdd(trimmed);
      setValue('');
    } catch {
      setError('Erro ao adicionar tarefa. Verifique se a API está rodando.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (error) setError('');
          }}
          placeholder="Nova tarefa..."
          disabled={loading}
          className="flex-1"
          aria-label="Nova tarefa"
        />
        <Button type="submit" disabled={loading} aria-label="Adicionar tarefa">
          <Plus className="h-4 w-4 mr-1" />
          Adicionar
        </Button>
      </div>
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
