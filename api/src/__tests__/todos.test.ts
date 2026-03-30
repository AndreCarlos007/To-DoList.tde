import request from 'supertest';
import app from '../app';
import { pool } from '../db';

// Mock do pool de banco de dados para não precisar de banco real nos testes
jest.mock('../db', () => {
  const mockPool = {
    query: jest.fn(),
    connect: jest.fn(),
  };
  return { pool: mockPool, initDb: jest.fn() };
});

const mockPool = pool as jest.Mocked<typeof pool>;

beforeEach(() => {
  jest.clearAllMocks();
});

afterAll(async () => {
  jest.resetAllMocks();
});

// ─── GET /todos ────────────────────────────────────────────────────────────────

describe('GET /todos', () => {
  it('deve retornar lista de todos com status 200', async () => {
    const fakeTodos = [
      { id: 1, title: 'Estudar DevOps', completed: false, created_at: new Date() },
      { id: 2, title: 'Configurar Docker', completed: true, created_at: new Date() },
    ];
    (mockPool.query as jest.Mock).mockResolvedValueOnce({ rows: fakeTodos });

    const res = await request(app).get('/todos');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0].title).toBe('Estudar DevOps');
  });

  it('deve retornar 500 quando o banco falha', async () => {
    (mockPool.query as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

    const res = await request(app).get('/todos');

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error');
  });
});

// ─── GET /todos/:id ────────────────────────────────────────────────────────────

describe('GET /todos/:id', () => {
  it('deve retornar o todo pelo ID com status 200', async () => {
    const fakeTodo = { id: 1, title: 'Estudar DevOps', completed: false, created_at: new Date() };
    (mockPool.query as jest.Mock).mockResolvedValueOnce({ rows: [fakeTodo] });

    const res = await request(app).get('/todos/1');

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(1);
  });

  it('deve retornar 404 se o todo não existir', async () => {
    (mockPool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

    const res = await request(app).get('/todos/999');

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error', 'Todo não encontrado');
  });
});

// ─── POST /todos ───────────────────────────────────────────────────────────────

describe('POST /todos', () => {
  it('deve criar um todo e retornar 201', async () => {
    const newTodo = { id: 3, title: 'Nova tarefa', completed: false, created_at: new Date() };
    (mockPool.query as jest.Mock).mockResolvedValueOnce({ rows: [newTodo] });

    const res = await request(app)
      .post('/todos')
      .send({ title: 'Nova tarefa' });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Nova tarefa');
  });

  it('deve retornar 400 se o título estiver ausente', async () => {
    const res = await request(app).post('/todos').send({});

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('deve retornar 400 se o título for uma string vazia', async () => {
    const res = await request(app).post('/todos').send({ title: '   ' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});

// ─── PATCH /todos/:id ──────────────────────────────────────────────────────────

describe('PATCH /todos/:id', () => {
  it('deve atualizar o todo e retornar o registro atualizado', async () => {
    const existing = { id: 1, title: 'Estudar DevOps', completed: false };
    const updated = { ...existing, completed: true };

    (mockPool.query as jest.Mock)
      .mockResolvedValueOnce({ rows: [existing] }) // SELECT atual
      .mockResolvedValueOnce({ rows: [updated] }); // UPDATE

    const res = await request(app)
      .patch('/todos/1')
      .send({ completed: true });

    expect(res.status).toBe(200);
    expect(res.body.completed).toBe(true);
  });

  it('deve retornar 404 ao atualizar todo inexistente', async () => {
    (mockPool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .patch('/todos/999')
      .send({ completed: true });

    expect(res.status).toBe(404);
  });
});

// ─── DELETE /todos/:id ─────────────────────────────────────────────────────────

describe('DELETE /todos/:id', () => {
  it('deve deletar o todo e retornar mensagem de sucesso', async () => {
    const deleted = { id: 1, title: 'Estudar DevOps', completed: false };
    (mockPool.query as jest.Mock).mockResolvedValueOnce({ rows: [deleted] });

    const res = await request(app).delete('/todos/1');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message', 'Todo deletado com sucesso');
  });

  it('deve retornar 404 ao deletar todo inexistente', async () => {
    (mockPool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

    const res = await request(app).delete('/todos/999');

    expect(res.status).toBe(404);
  });
});

// ─── GET /health ───────────────────────────────────────────────────────────────

describe('GET /health', () => {
  it('deve retornar status ok', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
  });
});
