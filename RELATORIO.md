# Relatório Técnico — TDE Prática DevOps

**Curso:** Análise e Desenvolvimento de Sistemas  
**Unidade Curricular:** Prática DevOps  
**Professor:** Marcos Gomes da Silva Rocha  
**Data de entrega:** 31/03/2026  

---

## 1. Objetivo

Desenvolver um ambiente de microserviços conteinerizado utilizando Docker e Docker Compose, com três containers interconectados — um servidor web (frontend Next.js), uma API REST (Node.js + Express) e um banco de dados persistente (PostgreSQL) — além de pipeline de CI/CD configurado com GitHub Actions e testes automatizados.

---

## 2. Tecnologias Utilizadas

| Camada        | Tecnologia             | Versão  |
|---------------|------------------------|---------|
| Frontend      | Next.js + TypeScript   | 15.x    |
| API           | Node.js + Express + TS | 20.x    |
| Banco de dados | PostgreSQL             | 16      |
| Conteinerização | Docker + Docker Compose | v3.9  |
| CI/CD         | GitHub Actions         | -       |
| Testes        | Jest + Supertest       | 29.x    |

---

## 3. Arquitetura do Sistema

```
┌─────────────────────────────────────────────────────────┐
│                    Docker Network                        │
│                                                         │
│  ┌──────────────┐    ┌──────────────┐    ┌───────────┐  │
│  │   todo_web   │    │   todo_api   │    │  todo_db  │  │
│  │  Next.js     │───>│  Node.js     │───>│ PostgreSQL│  │
│  │  :3000       │    │  :3001       │    │  :5432    │  │
│  └──────────────┘    └──────────────┘    └───────────┘  │
│         │                   │                   │        │
└─────────┼───────────────────┼───────────────────┼────────┘
          │                   │                   │
        Porta               Porta              Volume
        3000                3001           postgres_data
```

### 3.1 Descrição dos Containers

- **todo_db**: Container PostgreSQL 16 com volume persistente `postgres_data`. Expõe a porta 5432 e possui health check configurado (`pg_isready`) para garantir que a API só suba após o banco estar pronto.

- **todo_api**: Container Node.js com a API REST. Depende do container `db` com condição `service_healthy`. Inicializa a tabela `todos` automaticamente na subida via `initDb()`. Expõe a porta 3001.

- **todo_web**: Container Next.js otimizado com build multi-stage. Depende do container `api`. Expõe a porta 3000.

---

## 4. Estrutura do Repositório

```
/
├── .github/
│   └── workflows/
│       └── ci.yml              # Pipeline GitHub Actions
├── api/
│   ├── src/
│   │   ├── __tests__/
│   │   │   └── todos.test.ts   # Testes automatizados (Jest + Supertest)
│   │   ├── routes/
│   │   │   └── todos.ts        # Rotas CRUD
│   │   ├── app.ts              # Configuração Express
│   │   ├── db.ts               # Conexão e inicialização do banco
│   │   └── index.ts            # Entry point
│   ├── Dockerfile              # Build multi-stage da API
│   ├── package.json
│   └── tsconfig.json
├── app/                        # Frontend Next.js
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── todo-form.tsx           # Formulário de criação de tarefa
│   ├── todo-item.tsx           # Item individual com edição inline
│   └── todo-list.tsx           # Lista com filtros
├── db/
│   └── init.sql                # Script de inicialização com dados de exemplo
├── hooks/
│   └── use-todos.ts            # Hook SWR para consumo da API
├── docker-compose.yml          # Orquestração dos 3 containers
├── Dockerfile                  # Build multi-stage do frontend
└── RELATORIO.md                # Este relatório
```

---

## 5. Endpoints da API

| Método   | Rota          | Descrição                      |
|----------|---------------|--------------------------------|
| `GET`    | `/health`     | Verificação de saúde da API    |
| `GET`    | `/todos`      | Listar todas as tarefas        |
| `GET`    | `/todos/:id`  | Buscar tarefa por ID           |
| `POST`   | `/todos`      | Criar nova tarefa              |
| `PATCH`  | `/todos/:id`  | Atualizar título e/ou status   |
| `DELETE` | `/todos/:id`  | Deletar tarefa                 |

### Exemplo de corpo da requisição (POST /todos):
```json
{ "title": "Minha nova tarefa" }
```

### Exemplo de resposta:
```json
{
  "id": 1,
  "title": "Minha nova tarefa",
  "completed": false,
  "created_at": "2026-03-26T10:00:00.000Z"
}
```

---

## 6. Pipeline CI/CD — GitHub Actions

O arquivo `.github/workflows/ci.yml` define 4 jobs executados em sequência:

### Job 1: `test-api`
- Instala dependências da API
- Executa `npm run test:coverage` (Jest + Supertest com mocks do PostgreSQL)
- Publica o relatório de cobertura como artefato no GitHub

### Job 2: `build-api`
- Depende do job `test-api` (só roda se os testes passarem)
- Compila o TypeScript para JavaScript (`tsc`)
- Valida os artefatos gerados na pasta `dist/`

### Job 3: `build-frontend`
- Executa em paralelo com `build-api`
- Instala dependências do Next.js e executa `npm run build`

### Job 4: `docker-compose-build`
- Depende do sucesso de `build-api` e `build-frontend`
- Constrói todas as imagens Docker com `docker compose build`
- Sobe os 3 containers com `docker compose up -d`
- Valida o health check da API (`curl /health`)
- Testa o endpoint `/todos`
- Derruba e limpa os containers ao final

**Gatilhos:** Push ou Pull Request na branch `main`.

---

## 7. Testes Automatizados

Os testes estão em `api/src/__tests__/todos.test.ts` e utilizam **Jest** + **Supertest** para testar os endpoints HTTP sem necessidade de banco de dados real (utilizando mocks do `pg.Pool`).

### Cobertura dos testes:

| Endpoint            | Cenários testados                                         |
|---------------------|-----------------------------------------------------------|
| `GET /todos`        | Retorna lista com status 200; retorna 500 se banco falha  |
| `GET /todos/:id`    | Retorna todo por ID; retorna 404 se não existe            |
| `POST /todos`       | Cria todo com 201; retorna 400 sem título; retorna 400 com título vazio |
| `PATCH /todos/:id`  | Atualiza com sucesso; retorna 404 se não existe           |
| `DELETE /todos/:id` | Deleta com sucesso; retorna 404 se não existe             |
| `GET /health`       | Retorna `{ status: "ok" }`                               |

**Total: 12 casos de teste** cobrindo os principais fluxos felizes e de erro.

### Executar testes localmente:
```bash
cd api
npm install
npm test
# ou com cobertura:
npm run test:coverage
```

---

## 8. Como Executar o Projeto

### Pré-requisitos
- Docker Desktop (ou Docker Engine + Docker Compose V2)
- Git

### Subir o ambiente completo:
```bash
# Clonar o repositório
git clone <url-do-repositorio>
cd <nome-do-projeto>

# Subir todos os containers
docker compose up --build

# Acesse:
# Frontend:  http://localhost:3000
# API REST:  http://localhost:3001
# PostgreSQL: localhost:5432
```

### Comandos úteis:
```bash
# Subir em background
docker compose up -d

# Ver logs de um container específico
docker compose logs api
docker compose logs web
docker compose logs db

# Parar e remover containers e volumes
docker compose down -v

# Recriar apenas um serviço
docker compose up --build api
```

---

## 9. Persistência de Dados

O volume `postgres_data` garante que os dados do PostgreSQL persistam entre reinicializações dos containers. Mesmo após executar `docker compose down`, os dados são mantidos. Para remover os dados, use `docker compose down -v`.

---

## 10. Gestão de Versão (Git)

O projeto utiliza a seguinte estratégia de branches:

- **`main`**: Branch principal, protegida. Todo merge requer que o pipeline CI passe.
- **`feature/*`**: Branches para novas funcionalidades.
- **`fix/*`**: Branches para correções de bugs.

O pipeline de CI é acionado automaticamente em todo push e pull request para a branch `main`, garantindo que o código integrado sempre passa pelos testes e builds.

---

## 11. Conclusão

Este projeto demonstra na prática os principais conceitos de DevOps estudados nas Unidades I e II:

- **Conteinerização** com Docker, usando builds multi-stage para imagens otimizadas de produção.
- **Orquestração** com Docker Compose, interligando 3 containers com dependências e health checks.
- **Persistência** de dados com volumes Docker nomeados.
- **Automação de CI/CD** com GitHub Actions, executando testes, builds e validação de containers automaticamente.
- **Testes automatizados** com Jest e Supertest, garantindo qualidade do código antes de cada entrega.
- **Padronização de ambiente** via `docker-compose.yml`, tornando o ambiente de desenvolvimento idêntico ao de produção.
