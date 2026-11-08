# CC-SI-UCE4-G08-2026-2

Repositório do GRUPO 08 do Projeto UCE do 4º sem. CC/SI 2026-2. Alunos: GLAUBER MACÁRIO ALVES PEIXOTO, LUCA TELINI CROZARA, MIGUEL HENRIQUE ISAAC DE OLIVEIRA

Sistema de automação de pedidos de restaurante (Chic Dog) com:
- **Back-end:** Node.js + Express + TypeScript + Prisma (PostgreSQL)
- **Front-end:** React + Vite + TypeScript + Bootstrap

---

## Pré-requisitos

- Node.js >= 20.19
- PostgreSQL (ou Docker com Docker Compose)
- npm

---

## Variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto com base no `.env.example`:

```bash
cp .env.example .env
```

Ajuste os valores conforme seu ambiente. Exemplo mínimo (PostgreSQL local na porta 5433):

```
DATABASE_URL="postgresql://postgres@localhost:5433/chicdog"
PORT=3333
JWT_SECRET="troque-este-segredo-em-producao"
JWT_EXPIRES_IN="1d"
CORS_ORIGIN="*"

SEED_ADMIN_LOGIN="admin"
SEED_ADMIN_SENHA="admin123"
SEED_CLIENTE_LOGIN="cliente"
SEED_CLIENTE_SENHA="cliente123"
SEED_GARCOM_LOGIN="garcom"
SEED_GARCOM_SENHA="garcom123"
SEED_COZINHEIRO_LOGIN="cozinheiro"
SEED_COZINHEIRO_SENHA="cozinheiro123"
```

---

## Como rodar (back-end)

### Com Docker Compose (recomendado)

```bash
# Sobe PostgreSQL e a API
docker compose up -d
```

A API ficará disponível em `http://localhost:3333`.

### Sem Docker (PostgreSQL local)

1. Instale e inicie o PostgreSQL, criando o banco e o usuário definidos no `.env`.
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Gere o cliente Prisma:
   ```bash
   npx prisma generate
   ```
4. Aplique as migrações:
   ```bash
   npx prisma migrate deploy
   ```
5. Popule o banco com dados iniciais (seed):
   ```bash
   npx tsx prisma/seed.ts
   ```
6. Inicie a API:
   ```bash
   npm run dev
   ```

A API ficará disponível em `http://localhost:3333`.

---

## Como rodar (front-end)

```bash
cd Front-End
npm install
npm run dev
```

O front-end ficará disponível em `http://localhost:5173`.

Em desenvolvimento, o Vite encaminha automaticamente as requisições de `/api` para o back-end (veja `vite.config.ts`). Em produção, defina a variável `VITE_API_URL` com a URL do back-end.

---

## Tela de mesa do tablet

O tablet do cliente é configurado com a mesa em que está fixado. Use a URL
`http://localhost:5173/cliente?mesa=4` ou a tela de configuração (primeiro acesso
sem `?mesa=`). O número fica guardado no `localStorage` do navegador.

---

## Logins de seed (usuários criados automaticamente)

| Login | Senha | Perfil | Tela inicial |
|-------|-------|--------|--------------|
| `admin` | `admin123` | Administrador | /garcom |
| `garcom` | `garcom123` | Garçom | /garcom |
| `cozinheiro` | `cozinheiro123` | Cozinheiro | /cozinha |
| `cliente` | `cliente123` | Cliente | /cliente |

---

## Endpoints principais da API

| Método | Caminho | Descrição | Auth |
|--------|---------|-----------|------|
| `POST` | `/usuarios/login` | Autenticação | Não |
| `GET` | `/produtos` | Listar produtos | Sim |
| `GET` | `/pedidos` | Listar pedidos | Sim |
| `GET` | `/pedidos/mesa/:numeroMesa/ativo` | Pedido ativo de uma mesa | Sim |
| `GET` | `/pedidos/:id` | Detalhe de um pedido | Sim |
| `POST` | `/pedidos` | Criar pedido | Sim |
| `PATCH` | `/pedidos/:id/status` | Alterar status do pedido | Sim |
| `POST` | `/pedidos/:id/itens` | Adicionar item ao pedido | Sim |
| `GET` | `/tipo-usuarios` | Listar tipos de usuário | Sim |
| `GET` | `/usuarios` | Listar usuários | Sim |

---

## Estrutura

- `Back-End/` — API (Express + Prisma)
- `Front-End/` — Aplicação React (Vite)
- `prisma/schema.prisma` — Modelo de dados
- `Banco/BD.sql` — Dump SQL do banco
- `docker-compose.yml` — Orquestração com Docker
- `.env.example` — Exemplo de variáveis de ambiente
