# CC-SI-UCE4-G08-2026-2 — Chic Dog

Repositório do GRUPO 08 do Projeto UCE do 4º sem. CC/SI 2026-2.
Alunos: GLAUBER MACÁRIO ALVES PEIXOTO, LUCA TELINI CROZARA, MIGUEL HENRIQUE ISAAC DE OLIVEIRA.

Sistema de gestão de pedidos da Chic Dog. Este repositório contém o **backend** (API REST) em Node.js, TypeScript, Express, Prisma e PostgreSQL.

## Tecnologias

- Node.js + TypeScript
- Express.js
- Prisma ORM (driver adapter PostgreSQL)
- PostgreSQL
- JWT + bcryptjs
- Docker / Docker Compose

## Estrutura

```text
Back-End/src
├── app.ts                 # aplicação Express (sem listen)
├── server.ts              # inicialização do servidor HTTP
├── config/                # configuração de JWT
├── controllers/           # camada HTTP
├── database/              # cliente Prisma
├── domain/                # regras de status e perfis
├── dto/                   # contratos de entrada
├── errors/                # erros da aplicação
├── middlewares/           # autenticação JWT e autorização por perfil
├── repositories/          # acesso ao banco
├── routes/                # rotas por recurso
├── services/              # regras de negócio
└── utils/                 # serialização de Decimals
prisma/
├── schema.prisma
├── migrations/
└── seed.ts
```

## Configuração

1. Copie o arquivo de exemplo e ajuste os valores:

```bash
cp .env.example .env
```

2. Variáveis principais:

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | String de conexão PostgreSQL usada pela API |
| `PORT` | Porta da API (padrão `3000`) |
| `POSTGRES_PORT` | Porta do PostgreSQL no Docker (padrão `5432`) |
| `JWT_SECRET` | Segredo usado para assinar os tokens JWT |
| `JWT_EXPIRES_IN` | Validade do token (padrão `1d`) |
| `SEED_ADMIN_LOGIN` / `SEED_ADMIN_SENHA` | Credenciais do administrador criado pelo seed |

## Executando com Docker

```bash
docker compose up --build
```

A API fica disponível em `http://localhost:3333`. O comando aplica as migrations e executa o seed automaticamente.

## Executando localmente

```bash
npm install
npx prisma generate
npx prisma migrate deploy
npm run seed
npm run dev
```

A API fica disponível em `http://localhost:3000`.

## Scripts

| Script | Ação |
|---|---|
| `npm run dev` | Aplica migrations e inicia a API em modo desenvolvimento |
| `npm run build` | Compila TypeScript para `dist/` |
| `npm start` | Aplica migrations e inicia a versão compilada |
| `npm run typecheck` | Verifica os tipos sem gerar arquivos |
| `npm test` | Executa os testes automatizados |
| `npm run seed` | Popula tipos de usuário, usuários e produtos |
| `npm run prisma:migrate` | Cria uma nova migration em desenvolvimento |

## Usuários criados pelo seed

| Perfil | Login | Senha |
|---|---|---|
| Administrador | `admin` | `admin123` |
| Gerente | `gerente` | `gerente123` |
| Garçom | `garcom` | `garcom123` |
| Cozinheiro | `cozinheiro` | `cozinheiro123` |
| Cliente | `cliente` | `cliente123` |

## Autenticação

Faça login para obter o token:

```http
POST /usuarios/login
Content-Type: application/json

{
  "loginUsuario": "garcom",
  "senha": "garcom123"
}
```

Resposta:

```json
{
  "usuario": {
    "id": 3,
    "nome": "Garçom Chic Dog",
    "login": "garcom",
    "tipo": "Garçom"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

Exceto o login, todas as rotas exigem o cabeçalho:

```http
Authorization: Bearer <token>
```

### Permissões

- **Administrador**: acesso total.
- **Gerente**: gerencia usuários, tipos de usuário, produtos, pedidos e pagamentos.
- **Garçom**: cria e altera pedidos/itens, envia para preparo, entrega e registra pagamentos.
- **Cozinheiro**: consulta a fila, inicia preparo (`Em preparo`) e conclui (`Pronto`).
- **Cliente**: consulta produtos e apenas os próprios pedidos; não altera cadastros.

## Endpoints

### Tipos de usuário

| Método | Rota | Perfil |
|---|---|---|
| GET | `/tipo-usuarios` | autenticado |
| GET | `/tipo-usuarios/:id` | autenticado |
| POST | `/tipo-usuarios` | Gerente |
| PUT | `/tipo-usuarios/:id` | Gerente |
| DELETE | `/tipo-usuarios/:id` | Gerente |

### Usuários

| Método | Rota | Perfil |
|---|---|---|
| POST | `/usuarios/login` | público |
| GET | `/usuarios` | Garçom/Gerente |
| GET | `/usuarios/:id` | Garçom/Gerente |
| POST | `/usuarios` | Gerente |
| PUT | `/usuarios/:id` | Gerente |
| DELETE | `/usuarios/:id` | Gerente (desativação lógica) |

### Produtos

| Método | Rota | Perfil |
|---|---|---|
| GET | `/produtos` | autenticado |
| GET | `/produtos/:id` | autenticado |
| POST | `/produtos` | Gerente |
| PUT | `/produtos/:id` | Gerente |
| DELETE | `/produtos/:id` | Gerente |

### Pedidos

| Método | Rota | Perfil |
|---|---|---|
| GET | `/pedidos` | autenticado (cliente vê apenas os próprios; filtros: `status`, `idCliente`, `idGarcom`, `idCozinheiro`, `page`, `limit`) |
| GET | `/pedidos/fila` | Garçom/Cozinheiro/Gerente (pedidos `Pendente` e `Em preparo`) |
| GET | `/pedidos/:id` | autenticado (cliente vê apenas os próprios) |
| POST | `/pedidos` | Garçom/Gerente |
| PUT | `/pedidos/:id` | Garçom/Gerente (somente `Pendente`) |
| PATCH | `/pedidos/:id/status` | Garçom/Cozinheiro/Gerente |
| PATCH | `/pedidos/:id/cancelar` | Garçom/Gerente |
| DELETE | `/pedidos/:id` | Garçom/Gerente (cancelamento lógico) |
| POST | `/pedidos/:id/itens` | Garçom/Gerente |
| PUT | `/pedidos/:id/itens/:idItemPedido` | Garçom/Gerente |
| DELETE | `/pedidos/:id/itens/:idItemPedido` | Garçom/Gerente |

Exemplo de criação de pedido:

```http
POST /pedidos
Authorization: Bearer <token>
Content-Type: application/json

{
  "idCliente": 5,
  "idCozinheiro": 4,
  "tempoEstimado": 20,
  "itens": [
    { "idProduto": 1, "quantidade": 2 },
    { "idProduto": 4, "quantidade": 1 }
  ]
}
```

O `idGarcom` é preenchido automaticamente com o usuário autenticado quando não informado. O valor unitário é capturado do produto no momento da venda e o total é calculado pela soma dos subtotais.

Exemplo de alteração de status:

```http
PATCH /pedidos/1/status
Authorization: Bearer <token>
Content-Type: application/json

{ "status": "Em preparo" }
```

Fluxo permitido:

```text
Pendente -> Em preparo -> Pronto -> Entregue
     \-> Cancelado (somente enquanto Pendente para o garçom)
```

Pedidos em `Em preparo`, `Pronto`, `Entregue` ou `Cancelado` não podem mais ser alterados.

### Pagamentos

| Método | Rota | Perfil |
|---|---|---|
| GET | `/pagamentos` | Gerente |
| GET | `/pagamentos/:id` | Gerente |
| GET | `/pagamentos/pedido/:idPedido` | Garçom/Gerente |
| POST | `/pagamentos` | Garçom/Gerente |
| PUT | `/pagamentos/:id` | Gerente |

Exemplo:

```http
POST /pagamentos
Authorization: Bearer <token>
Content-Type: application/json

{
  "idPedido": 1,
  "formaPagamento": "Pix"
}
```

O valor do pagamento é definido automaticamente pelo total do pedido. Cada pedido aceita apenas um pagamento e pedidos cancelados não podem ser pagos.

## Regras de negócio implementadas

- Todo pedido exige cliente, garçom e ao menos um item.
- Quantidade sempre maior que zero.
- Valor unitário é registrado no momento da venda (snapshot).
- Total = soma dos subtotais (`quantidade × valorUnit`).
- Alteração/remoção de itens apenas com pedido `Pendente`.
- Pedido com status diferente de `Pendente` não pode ser alterado pelo garçom.
- Cancelamento respeita o status e o perfil do usuário.
- Pagamento único por pedido e com valor igual ao total.
- Exclusão de usuário é lógica (`statusUsuario = false`).
- Falhas de chave estrangeira e unicidade são convertidas em erros HTTP claros.

## Testes

```bash
npm test
```

Os testes cobrem as regras de status, permissões por perfil, transições do fluxo e cálculo de valores.
