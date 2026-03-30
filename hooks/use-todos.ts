'use client';

import useSWR from 'swr';

export interface Todo {
  id: number;
  title: string;
  completed: boolean;
  created_at: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useTodos() {
  const { data, error, isLoading, mutate } = useSWR<Todo[]>(
    `${API_URL}/todos`,
    fetcher,
    { refreshInterval: 0 }
  );

  async function createTodo(title: string) {
    const res = await fetch(`${API_URL}/todos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    });
    if (!res.ok) throw new Error('Erro ao criar tarefa');
    await mutate();
  }

  async function toggleTodo(id: number, completed: boolean) {
    await fetch(`${API_URL}/todos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed }),
    });
    await mutate();
  }

  async function updateTodo(id: number, title: string) {
    await fetch(`${API_URL}/todos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    });
    await mutate();
  }

  async function deleteTodo(id: number) {
    await fetch(`${API_URL}/todos/${id}`, { method: 'DELETE' });
    await mutate();
  }

  return {
    todos: data ?? [],
    isLoading,
    isError: !!error,
    createTodo,
    toggleTodo,
    updateTodo,
    deleteTodo,
  };
}
