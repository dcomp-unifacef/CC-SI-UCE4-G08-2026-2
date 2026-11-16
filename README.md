# Chic Dog — Sistema de automação de pedidos

Projeto do Grupo 08 do Projeto UCE, 4º semestre de CC/SI (2026-2), desenvolvido para automatizar pedidos em restaurante.

- **Back-end:** Node.js, Express, TypeScript, Prisma e PostgreSQL.
- **Front-end:** React, TypeScript, Vite e Bootstrap.

## Pré-requisitos

- Node.js 20.19 ou superior e npm.
- PostgreSQL local ou Docker com Docker Compose.

## Configuração do ambiente

Copie o arquivo de exemplo para criar o `.env` na raiz:

```bash
cp .env.example .env
```

No Windows, você também pode copiar `.env.example` manualmente e renomear a cópia para `.env`. Ajuste as variáveis para o seu ambiente. Para PostgreSQL local na porta padrão, por exemplo:

```env
DATABASE_URL="postgresql://postgres:SUA_SENHA@localhost:5432/chicdog"
PORT=3333
JWT_SECRET="substitua-por-um-segredo-proprio"
JWT_EXPIRES_IN="1d"
CORS_ORIGIN="*"
```

O arquivo `.env.example` contém também as variáveis `SEED_*` para definir nomes, logins e senhas dos usuários de demonstração. O Compose usa `POSTGRES_PORT` para escolher a porta publicada do PostgreSQL no computador; o padrão é `5432`. Se você escolher outra porta, mantenha `POSTGRES_PORT` e `DATABASE_URL` consistentes com ela.

**Segurança:** logins e senhas de seed mostrados neste README são apenas para desenvolvimento local. Troque as senhas, configure um `JWT_SECRET` forte e restrinja `CORS_ORIGIN` antes de qualquer implantação. Não publique nem compartilhe seu `.env`.

## Como iniciar o back-end

### Com Docker Compose

Na raiz do projeto, com o Docker em execução:

```bash
docker compose up -d
```

O Compose inicia o PostgreSQL, aguarda o banco ficar disponível e então inicia a API. A API fica em `http://localhost:3333`. Para acompanhar os serviços, use `docker compose logs -f`; para pará-los, use `docker compose down`. Os dados do banco ficam no volume `postgres_data`.

### Com PostgreSQL local

1. Crie o banco PostgreSQL e configure `DATABASE_URL` no `.env`.
2. Na raiz do projeto, instale as dependências:
   ```bash
   npm install
   ```
3. Gere o cliente Prisma e inicie o back-end:
   ```bash
   npx prisma generate
   npm run dev
   ```

O script `dev` aplica as migrações, executa o seed e inicia a API. A API fica em `http://localhost:3333`.

## Como iniciar o front-end

Em outro terminal:

```bash
cd Front-End
npm install
npm run dev
```

O front-end fica em `http://localhost:5173`. Em desenvolvimento, o proxy do Vite encaminha requisições de `/api` para `http://localhost:3333`. Para configurar outra URL da API, defina `VITE_API_URL` no ambiente do front-end; em produção, use a URL pública da API.

### Tablet do cliente

Associe o tablet a uma mesa abrindo, por exemplo, `http://localhost:5173/cliente?mesa=4`. Também é possível informar a mesa pela tela de configuração no primeiro acesso. O número escolhido é salvo no `localStorage` do navegador.

## Usuários de demonstração

O seed cria ou atualiza estes usuários conforme as variáveis `SEED_*` do `.env`:

| Login padrão | Senha padrão | Perfil | Tela inicial |
|---|---|---|---|
| `admin` | `admin123` | Administrador | `/garcom` |
| `garcom` | `garcom123` | Garçom | `/garcom` |
| `cozinheiro` | `cozinheiro123` | Cozinheiro | `/cozinha` |
| `cliente` | `cliente123` | Cliente | `/cliente` |

Esses valores são públicos e inseguros; use-os somente em ambiente local.

## API

As rotas abaixo são montadas diretamente na raiz da API. Exceto pelo login, elas exigem autenticação por token JWT no cabeçalho `Authorization: Bearer <token>`. Algumas rotas também restringem o acesso por perfil.

### Autenticação e usuários

| Método | Caminho | Descrição | Acesso |
|---|---|---|---|
| `POST` | `/usuarios/login` | Autentica o usuário e inicia uma sessão | Público |
| `GET` | `/usuarios` | Lista usuários | Garçom ou gerente |
| `GET` | `/usuarios/:id` | Consulta um usuário | Garçom ou gerente |
| `POST` | `/usuarios` | Cadastra um usuário | Gerente |
| `PUT` | `/usuarios/:id` | Atualiza um usuário | Gerente |
| `DELETE` | `/usuarios/:id` | Remove/desativa um usuário | Gerente |

### Tipos de usuário e produtos

| Método | Caminho | Descrição | Acesso |
|---|---|---|---|
| `GET` | `/tipo-usuarios` | Lista tipos de usuário | Autenticado |
| `GET` | `/tipo-usuarios/:id` | Consulta um tipo de usuário | Autenticado |
| `POST` | `/tipo-usuarios` | Cadastra um tipo de usuário | Gerente |
| `PUT` | `/tipo-usuarios/:id` | Atualiza um tipo de usuário | Gerente |
| `DELETE` | `/tipo-usuarios/:id` | Remove um tipo de usuário | Gerente |
| `GET` | `/produtos` | Lista produtos disponíveis | Autenticado |
| `GET` | `/produtos/:id` | Consulta um produto | Autenticado |
| `POST` | `/produtos` | Cadastra um produto | Gerente |
| `PUT` | `/produtos/:id` | Atualiza um produto | Gerente |
| `DELETE` | `/produtos/:id` | Remove um produto | Gerente |

### Pedidos

| Método | Caminho | Descrição | Acesso |
|---|---|---|---|
| `GET` | `/pedidos` | Lista pedidos | Autenticado; visibilidade depende do perfil |
| `GET` | `/pedidos/fila` | Consulta a fila de produção | Garçom, cozinheiro ou gerente |
| `GET` | `/pedidos/mesa/:numeroMesa/ativo` | Consulta o pedido ativo de uma mesa | Autenticado |
| `GET` | `/pedidos/:id` | Consulta um pedido | Autenticado; clientes ficam sujeitos a regras de propriedade |
| `POST` | `/pedidos` | Cria um pedido | Cliente, garçom ou gerente |
| `PUT` | `/pedidos/:id` | Atualiza um pedido | Garçom, cozinheiro ou gerente |
| `PATCH` | `/pedidos/:id/status` | Altera o status do pedido | Garçom, cozinheiro ou gerente |
| `PATCH` | `/pedidos/:id/cancelar` | Cancela um pedido com motivo | Garçom, cozinheiro ou gerente |
| `DELETE` | `/pedidos/:id` | Cancela um pedido | Garçom, cozinheiro ou gerente |
| `POST` | `/pedidos/:id/itens` | Adiciona item ao pedido | Garçom ou gerente |
| `PUT` | `/pedidos/:id/itens/:idItemPedido` | Atualiza item do pedido | Garçom ou gerente |
| `DELETE` | `/pedidos/:id/itens/:idItemPedido` | Remove item do pedido | Garçom ou gerente |

### Pagamentos e notificações

| Método | Caminho | Descrição | Acesso |
|---|---|---|---|
| `GET` | `/pagamentos` | Lista pagamentos | Gerente |
| `GET` | `/pagamentos/:id` | Consulta um pagamento | Gerente |
| `GET` | `/pagamentos/pedido/:idPedido` | Consulta pagamento de um pedido | Cliente, garçom ou gerente |
| `POST` | `/pagamentos` | Registra um pagamento | Cliente, garçom ou gerente |
| `PUT` | `/pagamentos/:id` | Atualiza um pagamento | Gerente |
| `POST` | `/notificacoes` | Cria solicitação de pagamento | Cliente, garçom, gerente ou administrador |
| `GET` | `/notificacoes/pendentes` | Lista solicitações pendentes | Garçom, gerente ou administrador |
| `GET` | `/notificacoes/contar-nao-lidas` | Conta notificações não lidas | Garçom, gerente ou administrador |
| `PATCH` | `/notificacoes/:id/atender` | Marca solicitação como atendida | Garçom, gerente ou administrador |
| `PATCH` | `/notificacoes/:id/lida` | Marca notificação como lida | Garçom, gerente ou administrador |

## Testes e verificações

Para executar os testes do front-end:

```bash
cd Front-End
npm test
```

Para executar o teste existente do back-end a partir da raiz:

```bash
node --import tsx --test Back-End/test/pedidoRules.test.ts
```

**Observação:** o script `npm test` da raiz aponta atualmente para `Back-End/tests/*.test.ts`, mas os testes estão na pasta `Back-End/test`. Por isso, o comando direto acima indica o caminho do teste existente sem alterar a configuração do projeto.

Outros comandos disponíveis na raiz incluem `npm run typecheck`, `npm run build` e `npm run lint`. No front-end, `npm run build` compila e gera a aplicação, e `npm run lint` executa o Oxlint.

## Estrutura do projeto

- `Back-End/` — API Express, organizada em rotas, controllers, services, repositories, DTOs e testes.
- `Front-End/` — aplicação React e Vite.
- `prisma/schema.prisma` — modelos e relações do banco.
- `prisma/migrations/` — histórico de migrações aplicadas pelo Prisma.
- `prisma/seed.ts` — criação dos perfis, usuários e produtos iniciais.
- `Banco/BD.sql` — script SQL de referência do banco.
- `docker-compose.yml` e `Dockerfile` — execução local dos serviços em contêineres.
- `.env.example` — modelo das variáveis de ambiente.
