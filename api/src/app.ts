import express from 'express';
import cors from 'cors';
import todosRouter from './routes/todos';

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/todos', todosRouter);

export default app;
