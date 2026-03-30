import app from './app';
import { initDb } from './db';

const PORT = process.env.PORT || 3001;

async function main() {
  await initDb();
  app.listen(PORT, () => {
    console.log(`[api] Servidor rodando em http://localhost:${PORT}`);
  });
}

main().catch((err) => {
  console.error('[api] Erro fatal ao iniciar:', err);
  process.exit(1);
});
