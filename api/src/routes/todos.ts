import { Router, Request, Response } from 'express';
import { pool } from '../db';

const router = Router();

// GET /todos - Listar todos os todos
router.get('/', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT * FROM todos ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar todos' });
  }
});

// GET /todos/:id - Buscar todo por ID
router.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM todos WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Todo não encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar todo' });
  }
});

// POST /todos - Criar novo todo
router.post('/', async (req: Request, res: Response) => {
  const { title } = req.body;
  if (!title || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ error: 'O campo "title" é obrigatório' });
  }
  try {
    const result = await pool.query(
      'INSERT INTO todos (title) VALUES ($1) RETURNING *',
      [title.trim()]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar todo' });
  }
});

// PATCH /todos/:id - Atualizar todo (título e/ou status)
router.patch('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, completed } = req.body;

  try {
    const current = await pool.query('SELECT * FROM todos WHERE id = $1', [id]);
    if (current.rows.length === 0) {
      return res.status(404).json({ error: 'Todo não encontrado' });
    }

    const newTitle =
      title !== undefined ? title.trim() : current.rows[0].title;
    const newCompleted =
      completed !== undefined ? completed : current.rows[0].completed;

    const result = await pool.query(
      'UPDATE todos SET title = $1, completed = $2 WHERE id = $3 RETURNING *',
      [newTitle, newCompleted, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar todo' });
  }
});

// DELETE /todos/:id - Deletar todo
router.delete('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'DELETE FROM todos WHERE id = $1 RETURNING *',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Todo não encontrado' });
    }
    res.json({ message: 'Todo deletado com sucesso', todo: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao deletar todo' });
  }
});

export default router;
