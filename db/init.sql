-- Script de inicialização do banco de dados
-- Executado automaticamente quando o container PostgreSQL sobe pela primeira vez

CREATE TABLE IF NOT EXISTS todos (
  id         SERIAL PRIMARY KEY,
  title      VARCHAR(255) NOT NULL,
  completed  BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Dados de exemplo para demonstração
INSERT INTO todos (title, completed) VALUES
  ('Configurar o Docker Compose', TRUE),
  ('Criar a API REST com Node.js', TRUE),
  ('Implementar o frontend Next.js', FALSE),
  ('Configurar CI/CD com GitHub Actions', FALSE),
  ('Escrever os testes automatizados', FALSE);
