# Frontend React + Pedido por Mesa — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Entregar o front React (garçom, cliente e cozinha) e adaptar o back para pedidos por mesa, um pedido ativo por mesa e edição de itens apenas em `Aberto`.

**Architecture:** Um app Vite/React com rotas por perfil consome a API Express existente via `fetch`. No back, `Pedido` ganha `numeroMesa` obrigatório, `idCliente`/`idGarcom` opcionais, índice único parcial por mesa e um endpoint de consulta do pedido ativo. As regras de decisão ficam em funções puras testáveis; o acesso ao banco continua nos repositories.

**Tech Stack:** TypeScript, Express 5, Prisma 7, PostgreSQL, React 19, Vite, Bootstrap, React Router, Vitest, Node test runner.

**Spec:** `docs/superpowers/specs/2026-11-03-frontend-design.md`

## Global Constraints

- Node.js >= 20.19; gerenciador `npm`.
- API em `http://localhost:3000`; login em `POST /usuarios/login`.
- Papéis: `Administrador`, `Garçom`, `Cozinheiro`, `Cliente`.
- Itens só podem ser criados, alterados ou removidos enquanto `statusPedido === "Aberto"`. O admin não tem exceção nesta entrega.
- Cozinheiro só altera `statusPedido`, e apenas para `Em preparo` ou `Pronto`.
- Transições válidas: `Aberto → Em preparo → Pronto → Entregue → Pago`; `Cancelado` permitido até `Entregue`.
- Um único pedido ativo por mesa; segundo pedido responde **409** com `{ erro, idPedido }`.
- `numeroMesa` é obrigatório e inteiro positivo; `idCliente` e `idGarcom` são opcionais.
- Front: Vite + React + TypeScript + Bootstrap + `react-router`; **sem Tailwind**.
- Valores monetários vêm sempre do back (`valorTotal`); a API devolve `Decimal` como string.
- Cliente não escolhe mesa: o tablet é configurado com `?mesa=<n>` ou `localStorage`.
- Deploy de produção fora do escopo.
- Senhas nunca vão para `localStorage`.

## Review Focus

- Dois tablets criando pedido para a mesma mesa ao mesmo tempo: só um pedido ativo pode existir; o segundo recebe 409 com o `idPedido`.
- Cliente ou garçom tentando acrescentar item com o pedido em `Em preparo`: bloqueio com 409 e tela somente leitura, sem botão de edição.
- Cliente logado em mesa cujo pedido pertence a outro cliente: vê o pedido, mas não altera.
- Administrador criando pedido sem escolher o garçom responsável: o formulário impede o envio e explica o motivo.
- Mesa inválida (`0`, vazia, texto) na configuração do tablet ou na tela do garçom: mensagem clara, nenhuma chamada à API.
- Token expirado ou inválido em qualquer tela: sessão limpa e volta ao login.

---

## Back-end

### Task 1: Erros da API com detalhes

**Files:**
- Modify: `Back-End/src/errors/AppError.ts`
- Create: `Back-End/src/utils/httpError.ts`
- Modify: `Back-End/src/app.ts:64-82`
- Test: `Back-End/tests/httpError.test.ts`, `Back-End/tests/errors.test.ts`
- Modify: `package.json` (script `test`)

**Interfaces:**
- Consumes: nada.
- Produces: `new AppError(message: string, statusCode: number, details?: Record<string, unknown>)`; `formatarErro(error: unknown): { status: number; body: Record<string, unknown> }`.

- [ ] **Step 1: Escrever o teste que falha**

Crie `Back-End/tests/httpError.test.ts`:

```ts
import assert from "node:assert/strict";
import { test } from "node:test";
import { AppError } from "../src/errors/AppError";
import { formatarErro } from "../src/utils/httpError";

test("formatarErro espalha os detalhes do AppError", () => {
  const resultado = formatarErro(
    new AppError("Mesa ocupada.", 409, { idPedido: 7 }),
  );

  assert.equal(resultado.status, 409);
  assert.deepEqual(resultado.body, { erro: "Mesa ocupada.", idPedido: 7 });
});

test("formatarErro mantém o corpo simples quando não há detalhes", () => {
  const resultado = formatarErro(new AppError("Não encontrado.", 404));

  assert.deepEqual(resultado.body, { erro: "Não encontrado." });
});

test("formatarErro traduz JSON inválido e erro desconhecido", () => {
  const json = Object.assign(new SyntaxError("Unexpected token"), { body: {} });

  assert.deepEqual(formatarErro(json), {
    status: 400,
    body: { erro: "JSON inválido no corpo da requisição." },
  });
  assert.deepEqual(formatarErro(new Error("boom")), {
    status: 500,
    body: { erro: "Erro interno do servidor." },
  });
});
```

Em `Back-End/tests/errors.test.ts`, acrescente ao teste existente:

```ts
test("AppError guarda detalhes opcionais", () => {
  const error = new AppError("Mesa ocupada.", 409, { idPedido: 7 });

  assert.deepEqual(error.details, { idPedido: 7 });
});
```

- [ ] **Step 2: Rodar e confirmar a falha**

Run: `npm test`
Expected: FAIL — `Cannot find module '../src/utils/httpError'` e `details` inexistente.

- [ ] **Step 3: Implementar**

`AppError` recebe `public readonly details?: Record<string, unknown>` como terceiro parâmetro do construtor.

`httpError.ts` implementa `formatarErro` exatamente com as três saídas testadas: `AppError` → `{ status, body: { erro, ...details } }`; `SyntaxError` com `body` → 400; qualquer outro → 500.

Em `app.ts`, o error handler passa a ser:

```ts
app.use((error: unknown, _req: unknown, res: any, _next: unknown) => {
  const { status, body } = formatarErro(error);

  if (status >= 500) console.error(error);

  return res.status(status).json(body);
});
```

No `package.json`, troque o script `test` por:

```json
"test": "node --import tsx --test Back-End/tests/*.test.ts"
```

- [ ] **Step 4: Rodar e confirmar que passa**

Run: `npm test`
Expected: todos os testes passam (12 ou mais).

- [ ] **Step 5: Commit**

```bash
git add Back-End/src/errors/AppError.ts Back-End/src/utils/httpError.ts Back-End/src/app.ts Back-End/tests package.json
git commit -m "feat: permite detalhes estruturados nos erros da API"
```

---

### Task 2: Regras puras de pedido

**Files:**
- Create: `Back-End/src/utils/pedidoRules.ts`
- Test: `Back-End/tests/pedidoRules.test.ts`

**Interfaces:**
- Consumes: nada.
- Produces:
  - `STATUS_ENCERRADOS: readonly string[]` (`["Pago", "Cancelado"]`);
  - `isPedidoAtivo(statusPedido: string): boolean`;
  - `podeEditarItens(statusPedido: string): boolean` (somente `Aberto`);
  - `decidirCriacao(ativo: PedidoAtivoResumo | null, contexto: { ehCliente: boolean }): DecisaoCriacao`;
  - `PedidoAtivoResumo = { idPedido: number; idCliente: number | null; statusPedido: string }`;
  - `DecisaoCriacao = { tipo: "criar" } | { tipo: "entrar"; idPedido: number } | { tipo: "conflito"; idPedido: number }`.

- [ ] **Step 1: Escrever o teste que falha**

Crie `Back-End/tests/pedidoRules.test.ts`:

```ts
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  decidirCriacao,
  isPedidoAtivo,
  podeEditarItens,
} from "../src/utils/pedidoRules";

test("isPedidoAtivo aceita todos os status menos Pago e Cancelado", () => {
  for (const status of ["Aberto", "Em preparo", "Pronto", "Entregue"]) {
    assert.equal(isPedidoAtivo(status), true);
  }

  assert.equal(isPedidoAtivo("Pago"), false);
  assert.equal(isPedidoAtivo("Cancelado"), false);
});

test("podeEditarItens só aceita Aberto", () => {
  assert.equal(podeEditarItens("Aberto"), true);
  assert.equal(podeEditarItens("Em preparo"), false);
  assert.equal(podeEditarItens("Pronto"), false);
});

test("sem pedido ativo a criação segue", () => {
  assert.deepEqual(decidirCriacao(null, { ehCliente: true }), { tipo: "criar" });
  assert.deepEqual(decidirCriacao(null, { ehCliente: false }), { tipo: "criar" });
});

test("cliente entra em pedido da mesa sem cliente enquanto está Aberto", () => {
  const ativo = { idPedido: 7, idCliente: null, statusPedido: "Aberto" };

  assert.deepEqual(decidirCriacao(ativo, { ehCliente: true }), {
    tipo: "entrar",
    idPedido: 7,
  });
});

test("cliente não entra em pedido sem cliente já em preparo", () => {
  const ativo = { idPedido: 7, idCliente: null, statusPedido: "Em preparo" };

  assert.deepEqual(decidirCriacao(ativo, { ehCliente: true }), {
    tipo: "conflito",
    idPedido: 7,
  });
});

test("pedido de outro cliente ou criado por staff é conflito", () => {
  const deOutroCliente = { idPedido: 8, idCliente: 3, statusPedido: "Aberto" };
  const semCliente = { idPedido: 9, idCliente: null, statusPedido: "Aberto" };

  assert.deepEqual(decidirCriacao(deOutroCliente, { ehCliente: true }), {
    tipo: "conflito",
    idPedido: 8,
  });
  assert.deepEqual(decidirCriacao(semCliente, { ehCliente: false }), {
    tipo: "conflito",
    idPedido: 9,
  });
});
```

- [ ] **Step 2: Rodar e confirmar a falha**

Run: `npm test`
Expected: FAIL — módulo `pedidoRules` não encontrado.

- [ ] **Step 3: Implementar `pedidoRules.ts`**

`isPedidoAtivo` compara sem diferenciar maiúsculas e remove espaços. `podeEditarItens` normaliza e compara com `"aberto"`. `decidirCriacao`:

```ts
if (!ativo) return { tipo: "criar" };
if (contexto.ehCliente && ativo.idCliente === null && podeEditarItens(ativo.statusPedido)) {
  return { tipo: "entrar", idPedido: ativo.idPedido };
}
return { tipo: "conflito", idPedido: ativo.idPedido };
```

- [ ] **Step 4: Rodar e confirmar que passa**

Run: `npm test`
Expected: PASS em todos.

- [ ] **Step 5: Commit**

```bash
git add Back-End/src/utils/pedidoRules.ts Back-End/tests/pedidoRules.test.ts
git commit -m "feat: adiciona regras puras de pedido ativo e edicao de itens"
```

---

### Task 3: Schema, migration e criação de pedido por mesa

**Files:**
- Modify: `prisma/schema.prisma:31-44`
- Create: `prisma/migrations/<timestamp>_pedido_mesa/migration.sql`
- Modify: `Back-End/src/repositories/pedidoRepository.ts`
- Modify: `Back-End/src/services/pedidoService.ts:169-235`
- Modify: `Back-End/src/controllers/pedidoController.ts:44-50`
- Modify: `Back-End/src/dto/pedido/createPedidoDto.ts`
- Test: verificação por API (passos 7 e 8)

**Interfaces:**
- Consumes: `AppError` com `details` (Task 1); `decidirCriacao`, `statusPedido` rules (Task 2).
- Produces:
  - `pedidoRepository.findAtivoPorMesa(numeroMesa: number): Promise<Pedido | null>`;
  - `pedidoRepository.entrarNoPedido(idPedido: number, idCliente: number, itens: ItemPedidoCalculado[]): Promise<Pedido>`;
  - `pedidoRepository.create(data: CreatePedidoData)` com `numeroMesa` obrigatório e `idCliente`/`idGarcom` opcionais;
  - `pedidoService.create(...)` devolve `{ pedido, criado: boolean }`.

- [ ] **Step 1: Alterar o schema**

Em `Pedido`, adicione `numeroMesa Int`, troque `idCliente Int` por `idCliente Int?`, `idGarcom Int` por `idGarcom Int?`, e as relações `cliente`/`garcom` para `Usuario?`.

- [ ] **Step 2: Criar a migration sem aplicar**

Run: `npx prisma migrate dev --create-only --name pedido_mesa`
Expected: nova pasta em `prisma/migrations/` com `migration.sql`.

- [ ] **Step 3: Completar a migration**

Garanta que o SQL, na ordem, faça: adicionar `numeroMesa` nullable; `UPDATE "pedido" SET "numeroMesa" = 1 WHERE "numeroMesa" IS NULL;`; `ALTER COLUMN "numeroMesa" SET NOT NULL`; `ALTER COLUMN "idCliente" DROP NOT NULL`; `ALTER COLUMN "idGarcom" DROP NOT NULL`; e criar o índice:

```sql
CREATE UNIQUE INDEX "unq_pedido_mesa_ativo" ON "pedido"("numeroMesa")
WHERE "statusPedido" NOT IN ('Pago', 'Cancelado');
```

- [ ] **Step 4: Aplicar e gerar o client**

Run: `npx prisma migrate deploy && npx prisma generate`
Expected: migration aplicada sem erro.

- [ ] **Step 5: Ajustar o repository**

- `CreatePedidoData` ganha `numeroMesa: number`; `idCliente?: number | null`; `idGarcom?: number | null`.
- `create` envia `numeroMesa` e usa `data.idCliente ?? null` / `data.idGarcom ?? null`.
- Novo `findAtivoPorMesa` com `where: { numeroMesa, statusPedido: { notIn: [...STATUS_ENCERRADOS] } }` e `pedidoInclude`, importando `STATUS_ENCERRADOS` de `utils/pedidoRules`.
- Novo `entrarNoPedido` em uma `$transaction`: atualiza `idCliente`, cria os itens com `createMany`, chama `recalcularTotal` e devolve o pedido com `pedidoInclude`.
- Exporte os dois no `export default`.

- [ ] **Step 6: Ajustar DTO e service**

`CreatePedidoDto`: `numeroMesa: number; idCliente?: number; idGarcom?: number; itens: CreateItemPedidoDto[]`.

Em `create`:

1. Calcule `ehCliente` e `numeroMesa = validatePositiveInt(input.numeroMesa, "numeroMesa")`.
2. Cliente: `idCliente = usuario.idUsuario`, sem `idGarcom`, e `statusPedido` sempre `Aberto` (ignora o body).
3. Staff: `idGarcom` obrigatório e validado como `Garçom`; `idCliente` só existe se vier no body, validado como `Cliente`.
4. Monte `itens`/`valorTotal` como hoje.
5. `const ativo = await pedidoRepository.findAtivoPorMesa(numeroMesa);`
6. `const decisao = decidirCriacao(ativo, { ehCliente: Boolean(ehCliente) });`
7. `conflito` → `throw new AppError("Esta mesa já possui um pedido em andamento.", 409, { idPedido: decisao.idPedido })`.
8. `entrar` → `return { pedido: await pedidoRepository.entrarNoPedido(decisao.idPedido, usuario!.idUsuario, itens), criado: false }`.
9. `criar` → envolva `pedidoRepository.create({ numeroMesa, valorTotal, statusPedido, idCliente, idGarcom, itens })` em `try/catch`. Se o erro tiver `code === "P2002"` (índice único parcial), busque `findAtivoPorMesa(numeroMesa)` e lance o mesmo 409 com `{ idPedido }`; senão, relance. No sucesso, `return { pedido, criado: true }`.

No controller `create`, use `const { pedido, criado } = await service.create(...)` e responda `res.status(criado ? 201 : 200).json(pedido)`.

- [ ] **Step 7: Typecheck**

Run: `npm run typecheck`
Expected: sem erros. Em `pagamentoService.ts:42`, troque a anotação `{ pedido: { idCliente: number } }` por `{ pedido: { idCliente: number | null } }`, porque `idCliente` agora é nullable; a comparação `idCliente !== usuario.idUsuario` continua correta.

- [ ] **Step 8: Verificar pela API**

Suba o Postgres (`docker compose up -d postgres`) e a API (`npx tsx Back-End/src/app.ts`), faça login (`admin/admin123`, `garcom/garcom123`, `cliente/cliente123`, `cozinheiro/cozinheiro123`) e confirme:

1. Garçom cria pedido com `numeroMesa: 1` e `itens` → 201.
2. Mesmo garçom cria outro para a mesa 1 → 409 com `idPedido` no corpo.
3. Cliente cria pedido na mesa 2 → 201, `idGarcom` nulo e `idCliente` igual ao do token.
4. Garçom cria na mesa 3 sem `idCliente`; cliente cria na mesa 3 → 200, mesmo `idPedido`, cliente vinculado e itens somados.
5. Cliente tenta criar na mesa 3 de novo → 409 com `idPedido`.

- [ ] **Step 9: Commit**

```bash
git add prisma Back-End/src/repositories/pedidoRepository.ts Back-End/src/services/pedidoService.ts Back-End/src/controllers/pedidoController.ts Back-End/src/dto/pedido/createPedidoDto.ts
git commit -m "feat: adiciona numero de mesa e um pedido ativo por mesa"
```

---

### Task 4: Consulta do pedido ativo e janela de edição

**Files:**
- Modify: `Back-End/src/services/pedidoService.ts` (novo `findAtivoPorMesa`; `ensureItensEditaveis`)
- Modify: `Back-End/src/controllers/pedidoController.ts`
- Modify: `Back-End/src/routes/pedidos.ts:8-10`
- Test: verificação por API (passo 5)

**Interfaces:**
- Consumes: `pedidoRepository.findAtivoPorMesa` (Task 3); `podeEditarItens` (Task 2).
- Produces: `GET /pedidos/mesa/:numeroMesa/ativo` → 200 com `Pedido` ou 404 `{ erro }`; itens editáveis somente em `Aberto`.

- [ ] **Step 1: Service**

Adicione `findAtivoPorMesa(numeroMesa: number)`: busca no repository e, se não houver, lança `new AppError("Não há pedido ativo nesta mesa.", 404)`. Exporte no `default`.

Troque `STATUS_EDICAO_ITENS` por `podeEditarItens` em `ensureItensEditaveis`, com a mensagem `"Os itens só podem ser alterados enquanto o pedido está em Aberto."` e status 409.

- [ ] **Step 2: Controller**

```ts
export async function retrieveAtivoPorMesa(req: Request, res: Response, next: NextFunction) {
  try {
    return res.json(await service.findAtivoPorMesa(parseId(req.params.numeroMesa)));
  } catch (error) {
    return next(error);
  }
}
```

- [ ] **Step 3: Rota**

Em `routes/pedidos.ts`, registre **antes** de `router.get("/:id", ...)`:

```ts
router.get("/mesa/:numeroMesa/ativo", authenticate, controller.retrieveAtivoPorMesa);
```

- [ ] **Step 4: Typecheck**

Run: `npm run typecheck`
Expected: sem erros.

- [ ] **Step 5: Verificar pela API**

1. `GET /pedidos/mesa/1/ativo` com token do garçom → 200 com o pedido.
2. `GET /pedidos/mesa/999/ativo` → 404.
3. Pedido em `Aberto`: garçom adiciona item → 201.
4. Cozinheiro move para `Em preparo`; garçom tenta adicionar → 409 com a mensagem de `Aberto`.
5. Cliente dono do pedido tenta adicionar em `Em preparo` → 409.

- [ ] **Step 6: Rodar a suíte inteira**

Run: `npm test && npm run typecheck`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add Back-End/src/services/pedidoService.ts Back-End/src/controllers/pedidoController.ts Back-End/src/routes/pedidos.ts
git commit -m "feat: expõe pedido ativo por mesa e restringe itens a Aberto"
```

---

## Front-end

### Task 5: Scaffold Vite + Bootstrap + rotas

**Files:**
- Create: `Front-End/` (gerado pelo Vite)
- Modify: `Front-End/vite.config.ts`
- Modify: `Front-End/src/main.tsx`
- Replace: `Front-End/src/App.tsx`
- Modify: `Front-End/package.json`

**Interfaces:**
- Consumes: API em `http://localhost:3000`.
- Produces: app em `http://localhost:5173` com proxy `/api`; `BrowserRouter` com `/login`, `/garcom`, `/cozinha`, `/cliente`.

- [ ] **Step 1: Criar o projeto**

```bash
npm create vite@latest Front-End -- --template react-ts
cd Front-End
npm install
npm install bootstrap react-router
npm install -D vitest
```

Aceite os padrões do gerador (linter padrão, instalar com npm).

- [ ] **Step 2: Configurar o proxy**

`vite.config.ts`:

```ts
server: {
  proxy: {
    "/api": {
      target: "http://localhost:3000",
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, ""),
    },
  },
},
```

- [ ] **Step 3: Bootstrap e rotas**

Em `main.tsx`, importe `bootstrap/dist/css/bootstrap.min.css` e remova o import de `./index.css` (mantenha o arquivo, sem uso).

Substitua `App.tsx` por um `BrowserRouter` com `Routes` para `/login`, `/garcom`, `/cozinha` e `/cliente`, cada um com um parágrafo provisório, e `*` redirecionando para `/login` com `Navigate`.

No `package.json`, adicione `"test": "vitest run"`.

- [ ] **Step 4: Verificar**

Run: `npm run build`
Expected: build sem erros.

Run: `npm run dev` e abra `http://localhost:5173`; as quatro rotas devem renderizar os parágrafos provisórios.

- [ ] **Step 5: Commit**

```bash
git add Front-End
git commit -m "feat: cria front-end com Vite, Bootstrap e rotas"
```

---

### Task 6: Tipos e cliente HTTP

**Files:**
- Create: `Front-End/src/types/api.ts`
- Create: `Front-End/src/api/client.ts`
- Create: `Front-End/src/api/auth.ts`
- Create: `Front-End/src/api/pedidos.ts`
- Create: `Front-End/src/api/produtos.ts`
- Create: `Front-End/src/api/usuarios.ts`
- Test: `Front-End/src/api/client.test.ts`

**Interfaces:**
- Consumes: API do back.
- Produces:
  - `class ApiError extends Error { status: number; detalhes?: Record<string, unknown> }`
  - `definirToken(token: string | null): void`
  - `definirTratadorSessaoExpirada(handler: (() => void) | null): void`
  - `apiFetch<T>(caminho: string, opcoes?: RequestInit): Promise<T>`
  - `entrar(loginUsuario: string, senha: string): Promise<RespostaLogin>`
  - `listarPedidos(): Promise<Pedido[]>`; `buscarPedido(id: number): Promise<Pedido>`; `buscarPedidoAtivoDaMesa(numeroMesa: number): Promise<Pedido | null>`; `criarPedido(dados: CriarPedidoInput): Promise<Pedido>`; `atualizarPedido(id: number, dados: AtualizarPedidoInput): Promise<Pedido>`; `adicionarItem(id: number, dados: ItemInput): Promise<Pedido>`; `alterarItem(id: number, idItem: number, dados: Partial<ItemInput>): Promise<Pedido>`; `removerItem(id: number, idItem: number): Promise<Pedido>`
  - `listarProdutos(): Promise<Produto[]>`; `listarUsuarios(): Promise<UsuarioApi[]>`

- [ ] **Step 1: Escrever o teste que falha**

Crie `Front-End/src/api/client.test.ts`:

```ts
import { afterEach, test, expect, vi } from "vitest";
import { apiFetch, definirToken } from "./client";

afterEach(() => {
  definirToken(null);
  vi.unstubAllGlobals();
});

test("apiFetch envia o token e devolve o JSON", async () => {
  const fetchFalso = vi.fn(async () =>
    new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }),
  );
  vi.stubGlobal("fetch", fetchFalso);
  definirToken("abc");

  await expect(apiFetch("/pedidos")).resolves.toEqual({ ok: true });

  const [, opcoes] = fetchFalso.mock.calls[0]!;
  expect(new Headers(opcoes?.headers).get("Authorization")).toBe("Bearer abc");
});

test("apiFetch transforma erro do back em ApiError com detalhes", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () =>
      new Response(JSON.stringify({ erro: "Mesa ocupada.", idPedido: 7 }), {
        status: 409,
        headers: { "Content-Type": "application/json" },
      }),
    ),
  );

  await expect(apiFetch("/pedidos", { method: "POST", body: "{}" })).rejects.toEqual(
    expect.objectContaining({
      status: 409,
      message: "Mesa ocupada.",
      detalhes: { idPedido: 7 },
    }),
  );
});
```

- [ ] **Step 2: Rodar e confirmar a falha**

Run: `npm test`
Expected: FAIL — módulo `./client` não encontrado.

- [ ] **Step 3: Implementar tipos e client**

`types/api.ts` define `UsuarioLogado`, `RespostaLogin`, `UsuarioApi`, `Produto`, `ItemPedido`, `Pedido` (com `numeroMesa`, `idCliente: number | null`, `idGarcom: number | null`, `cliente`/`garcom` possivelmente nulos) e `CriarPedidoInput`/`ItemInput`/`AtualizarPedidoInput`.

`client.ts` guarda o token em variável de módulo (`definirToken`), monta `Headers` com `Content-Type: application/json` quando há body e `Authorization` quando há token, usa `const BASE = "/api"`, trata `204` devolvendo `undefined` e, em `!res.ok`, lê `{ erro, ...detalhes }` e lança `new ApiError(status, erro ?? "Falha na requisição.", detalhesSemErro)`. Quando `status === 401`, chama o handler registrado por `definirTratadorSessaoExpirada` antes de lançar o erro.

Os módulos de API são funções finas sobre `apiFetch`. `buscarPedidoAtivoDaMesa` captura `ApiError` com status 404 e devolve `null`.

- [ ] **Step 4: Rodar e confirmar que passa**

Run: `npm test`
Expected: PASS nos dois testes.

- [ ] **Step 5: Commit**

```bash
git add Front-End/src/api Front-End/src/types Front-End/src/api/client.test.ts
git commit -m "feat: adiciona tipos e cliente HTTP do front"
```

---

### Task 7: Sessão, autenticação e guarda de rotas

**Files:**
- Create: `Front-End/src/lib/sessao.ts`
- Create: `Front-End/src/lib/auth.ts`
- Test: `Front-End/src/lib/auth.test.ts`
- Create: `Front-End/src/contexts/AuthContext.tsx`
- Create: `Front-End/src/routes/RotaProtegida.tsx`
- Modify: `Front-End/src/App.tsx`

**Interfaces:**
- Consumes: `entrar`, `definirToken`, `definirTratadorSessaoExpirada` (Task 6).
- Produces: `rotaInicialPorTipo(tipo: string): string`; `podeAcessarRota(tipo: string, caminho: string): boolean`; `AuthProvider`; `useAuth(): { usuario, entrar(login, senha), sair() }`; `RotaProtegida`.

- [ ] **Step 1: Escrever o teste que falha**

Crie `Front-End/src/lib/auth.test.ts`:

```ts
import { expect, test } from "vitest";
import { podeAcessarRota, rotaInicialPorTipo } from "./auth";

test("cada perfil cai na sua rota inicial", () => {
  expect(rotaInicialPorTipo("Garçom")).toBe("/garcom");
  expect(rotaInicialPorTipo("Administrador")).toBe("/garcom");
  expect(rotaInicialPorTipo("Cozinheiro")).toBe("/cozinha");
  expect(rotaInicialPorTipo("Cliente")).toBe("/cliente");
  expect(rotaInicialPorTipo("Desconhecido")).toBe("/login");
});

test("a guarda bloqueia rotas de outro perfil", () => {
  expect(podeAcessarRota("Garçom", "/garcom/pedidos/4")).toBe(true);
  expect(podeAcessarRota("Administrador", "/garcom/novo")).toBe(true);
  expect(podeAcessarRota("Cozinheiro", "/cozinha")).toBe(true);
  expect(podeAcessarRota("Cliente", "/cliente")).toBe(true);

  expect(podeAcessarRota("Cliente", "/garcom")).toBe(false);
  expect(podeAcessarRota("Cozinheiro", "/cliente")).toBe(false);
  expect(podeAcessarRota("Garçom", "/cozinha")).toBe(false);
  expect(podeAcessarRota("Cliente", "/desconhecido")).toBe(false);
});
```

- [ ] **Step 2: Rodar e confirmar a falha**

Run: `npm test`
Expected: FAIL — módulo `./auth` não encontrado.

- [ ] **Step 3: Implementar**

`auth.ts`: `Garçom`/`Administrador` → `/garcom`; `Cozinheiro` → `/cozinha`; `Cliente` → `/cliente`; resto → `/login`. `podeAcessarRota` aceita `caminho === base || caminho.startsWith(base + "/")`, com `/garcom` para staff, `/cozinha` só cozinheiro e `/cliente` só cliente.

`sessao.ts`: chave `chicdog.sessao`, tipo `Sessao = { usuario: UsuarioLogado; token: string }`, funções `lerSessao`, `salvarSessao`, `limparSessao` com acesso a `localStorage` protegido por `typeof window !== "undefined"`.

`AuthContext.tsx`: lê a sessão na inicialização, chama `definirToken`, expõe `usuario`, `entrar` (chama `entrar` da API, salva a sessão, define o token) e `sair` (limpa tudo). Em um `useEffect` de mount, registra `sair` com `definirTratadorSessaoExpirada` e remove o handler no unmount, para que qualquer 401 derrube a sessão. `useAuth` lança erro se usado fora do provider.

`RotaProtegida`: sem usuário → `Navigate to="/login"`; sem permissão para `location.pathname` → `Navigate to={rotaInicialPorTipo(usuario.tipo)}`.

Em `App.tsx`, envolva as rotas com `AuthProvider` e `RotaProtegida`.

- [ ] **Step 4: Rodar e confirmar que passa**

Run: `npm test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add Front-End/src/lib Front-End/src/contexts Front-End/src/routes Front-End/src/App.tsx
git commit -m "feat: adiciona sessao, login e guarda de rotas por perfil"
```

---

### Task 8: Layout e tela de login

**Files:**
- Create: `Front-End/src/components/Layout.tsx`
- Create: `Front-End/src/pages/Login.tsx`
- Modify: `Front-End/src/App.tsx`

**Interfaces:**
- Consumes: `useAuth`, `rotaInicialPorTipo`, `ApiError`.
- Produces: layout com cabeçalho e navegação por perfil; login funcional.

- [ ] **Step 1: Layout**

Cabeçalho `bg-dark text-white py-3` com `Chic Dog` e o nome do usuário; navegação `bg-light border-bottom py-2` com `nav nav-pills`; conteúdo em `<main className="container py-4">`. Links: staff → `Pedidos` e `Novo pedido`; cozinha → `Cozinha`; cliente → `Meu pedido`. Botão `Sair` chama `sair()` e navega para `/login`.

- [ ] **Step 2: Login**

Formulário controlado com `loginUsuario` e `senha`, botão desabilitado durante o envio, `alert alert-danger` com a mensagem de `ApiError`, e `navigate(rotaInicialPorTipo(usuario.tipo), { replace: true })` no sucesso.

- [ ] **Step 3: Verificar**

Run: `npm run build` e `npm run dev`.
Expected: login com `garcom/garcom123` cai em `/garcom`; `cozinheiro/cozinheiro123` em `/cozinha`; `cliente/cliente123` em `/cliente`; `admin/admin123` em `/garcom`; senha errada mostra o erro do back.

- [ ] **Step 4: Commit**

```bash
git add Front-End/src/components/Layout.tsx Front-End/src/pages/Login.tsx Front-End/src/App.tsx
git commit -m "feat: adiciona layout e tela de login"
```

---

### Task 9: Garçom — lista e novo pedido

**Files:**
- Create: `Front-End/src/lib/carrinho.ts`
- Test: `Front-End/src/lib/carrinho.test.ts`
- Create: `Front-End/src/lib/pedidoForm.ts`
- Test: `Front-End/src/lib/pedidoForm.test.ts`
- Create: `Front-End/src/components/StatusBadge.tsx`
- Create: `Front-End/src/components/ProductCard.tsx`
- Create: `Front-End/src/components/CartItem.tsx`
- Create: `Front-End/src/pages/garcom/GarcomLista.tsx`
- Create: `Front-End/src/pages/garcom/GarcomNovo.tsx`
- Modify: `Front-End/src/App.tsx`

**Interfaces:**
- Consumes: `listarPedidos`, `buscarPedidoAtivoDaMesa`, `criarPedido`, `listarProdutos`, `listarUsuarios`; `useAuth`.
- Produces:
  - `ItemCarrinho = { idProduto: number; nome: string; preco: number; quantidade: number }`
  - `adicionarItem(itens: ItemCarrinho[], produto: { idProduto: number; nome: string; preco: string | number }, quantidade?: number): ItemCarrinho[]`
  - `alterarQuantidade(itens: ItemCarrinho[], idProduto: number, quantidade: number): ItemCarrinho[]`
  - `removerItem(itens: ItemCarrinho[], idProduto: number): ItemCarrinho[]`
  - `calcularPrevia(itens: ItemCarrinho[]): number`
  - `validarNovoPedido({ numeroMesa, idGarcom, itens, exigeGarcom }: { numeroMesa: number; idGarcom: number | null; itens: ItemCarrinho[]; exigeGarcom: boolean }): string | null`

- [ ] **Step 1: Escrever os testes que falham**

`carrinho.test.ts`:

```ts
import { expect, test } from "vitest";
import {
  adicionarItem,
  alterarQuantidade,
  calcularPrevia,
  removerItem,
} from "./carrinho";

const produto = { idProduto: 2, nome: "X-Salada", preco: "18.90" };

test("adicionarItem soma quantidade do mesmo produto", () => {
  const uma = adicionarItem([], produto);
  const duas = adicionarItem(uma, produto);

  expect(duas).toHaveLength(1);
  expect(duas[0].quantidade).toBe(2);
});

test("alterarQuantidade para zero remove o item", () => {
  const itens = adicionarItem([], produto, 3);

  expect(alterarQuantidade(itens, 2, 0)).toEqual([]);
  expect(removerItem(itens, 2)).toEqual([]);
});

test("calcularPrevia soma e arredonda em duas casas", () => {
  const itens = [
    { idProduto: 1, nome: "A", preco: 0.1, quantidade: 1 },
    { idProduto: 2, nome: "B", preco: 0.2, quantidade: 1 },
  ];

  expect(calcularPrevia(itens)).toBe(0.3);
});
```

`pedidoForm.test.ts`:

```ts
import { expect, test } from "vitest";
import { validarNovoPedido } from "./pedidoForm";

const item = { idProduto: 1, nome: "A", preco: 10, quantidade: 1 };

test("exige mesa válida, carrinho e garçom quando necessário", () => {
  expect(validarNovoPedido({ numeroMesa: 0, idGarcom: null, itens: [item], exigeGarcom: false })).toMatch(/mesa/i);
  expect(validarNovoPedido({ numeroMesa: 4, idGarcom: null, itens: [], exigeGarcom: false })).toMatch(/item/i);
  expect(validarNovoPedido({ numeroMesa: 4, idGarcom: null, itens: [item], exigeGarcom: true })).toMatch(/garçom/i);
  expect(validarNovoPedido({ numeroMesa: 4, idGarcom: null, itens: [item], exigeGarcom: false })).toBeNull();
});
```

- [ ] **Step 2: Rodar e confirmar a falha**

Run: `npm test`
Expected: FAIL — módulos não encontrados.

- [ ] **Step 3: Implementar**

`carrinho.ts` normaliza `preco` (`Number(preco)`), soma quantidades ao adicionar, remove quando a quantidade chega a zero e arredonda a prévia com `toFixed(2)`.

`pedidoForm.ts` valida mesa inteira positiva, carrinho não vazio e, quando `exigeGarcom`, um `idGarcom` inteiro positivo.

`GarcomLista`: busca os pedidos no mount, filtra com `isPedidoAtivo` equivalente no front (`!["Pago","Cancelado"].includes(status)`), mostra cartões com mesa, status (`StatusBadge`), total e hora; botão `Novo pedido`; clique no cartão navega para `/garcom/pedidos/:id`.

`GarcomNovo`: campo de mesa; ao sair do campo, `buscarPedidoAtivoDaMesa`; se existir, `navigate('/garcom/pedidos/' + id, { state: { aviso: 'mesa já possui pedido em andamento' } })`. Grade de produtos disponíveis com `ProductCard`, carrinho com `CartItem`, prévia do total. Se `usuario.tipo === "Administrador"`, `select` obrigatório de garçom (de `listarUsuarios`, filtrando `tipoUsuario.nome === "Garçom"` e `statusUsuario`); caso contrário, `idGarcom = usuario.id`. Envio: `criarPedido({ numeroMesa, idGarcom, itens })`; em `ApiError` 409 com `detalhes.idPedido`, navegue para o pedido existente; outros erros no `alert`.

- [ ] **Step 4: Rodar e confirmar que passa**

Run: `npm test && npm run build`
Expected: PASS e build sem erros.

- [ ] **Step 5: Commit**

```bash
git add Front-End/src/lib Front-End/src/components Front-End/src/pages/garcom Front-End/src/App.tsx
git commit -m "feat: adiciona lista e criacao de pedidos do garcom"
```

---

### Task 10: Garçom — detalhe do pedido

**Files:**
- Create: `Front-End/src/lib/status.ts`
- Test: `Front-End/src/lib/status.test.ts`
- Create: `Front-End/src/pages/garcom/GarcomPedido.tsx`
- Modify: `Front-End/src/App.tsx`

**Interfaces:**
- Consumes: `buscarPedido`, `atualizarPedido`, `adicionarItem`, `alterarItem`, `removerItem`, `listarProdutos`.
- Produces:
  - `acoesDeStatus(status: string): { rotulo: string; novoStatus: string; confirmar?: boolean }[]`
  - `pedidoAtivo(status: string): boolean`
  - `podeEditarItens(status: string): boolean`

- [ ] **Step 1: Escrever o teste que falha**

```ts
import { expect, test } from "vitest";
import { acoesDeStatus, pedidoAtivo, podeEditarItens } from "./status";

test("pedidoAtivo ignora Pago e Cancelado", () => {
  expect(pedidoAtivo("Aberto")).toBe(true);
  expect(pedidoAtivo("Em preparo")).toBe(true);
  expect(pedidoAtivo("Pago")).toBe(false);
  expect(pedidoAtivo("Cancelado")).toBe(false);
});

test("podeEditarItens só em Aberto", () => {
  expect(podeEditarItens("Aberto")).toBe(true);
  expect(podeEditarItens("Em preparo")).toBe(false);
});

test("ações de status seguem as transições do back", () => {
  expect(acoesDeStatus("Aberto").map((a) => a.novoStatus)).toEqual(["Em preparo", "Cancelado"]);
  expect(acoesDeStatus("Em preparo").map((a) => a.novoStatus)).toEqual(["Pronto", "Cancelado"]);
  expect(acoesDeStatus("Pronto").map((a) => a.novoStatus)).toEqual(["Entregue", "Cancelado"]);
  expect(acoesDeStatus("Entregue").map((a) => a.novoStatus)).toEqual(["Cancelado"]);
  expect(acoesDeStatus("Pago")).toEqual([]);
  expect(acoesDeStatus("Cancelado")).toEqual([]);
});
```

- [ ] **Step 2: Rodar e confirmar a falha**

Run: `npm test`
Expected: FAIL — módulo `./status` não encontrado.

- [ ] **Step 3: Implementar**

`status.ts` com as três funções acima; `Cancelado` recebe `confirmar: true`. Os rótulos são `Iniciar preparo`, `Marcar como pronto`, `Entregue`, `Cancelar pedido`.

`GarcomPedido`: lê `id` de `useParams`, busca o pedido, mostra mesa, status, total do back e itens. Enquanto `Aberto`: grade de produtos para adicionar, botões `−`/`+` e `Remover` por item, usando `adicionarItem`, `alterarItem` e `removerItem` e substituindo o estado pelo pedido devolvido. Mostra as ações de `acoesDeStatus(pedido.statusPedido)`; antes de enviar, pede `window.confirm` quando `confirmar`. Em `ApiError` 409/403, mostra o `alert` e refaz `buscarPedido`. Exibe o aviso vindo de `location.state.aviso`.

- [ ] **Step 4: Rodar e confirmar que passa**

Run: `npm test && npm run build`
Expected: PASS.

- [ ] **Step 5: Verificar manualmente**

Garçom cria pedido, adiciona/edita/remove item em `Aberto`; cozinheiro move para `Em preparo`; recarregar o detalhe mostra os itens somente leitura e apenas as ações `Pronto`/`Cancelado`.

- [ ] **Step 6: Commit**

```bash
git add Front-End/src/lib/status.ts Front-End/src/lib/status.test.ts Front-End/src/pages/garcom/GarcomPedido.tsx Front-End/src/App.tsx
git commit -m "feat: adiciona detalhe e edicao de pedido do garcom"
```

---

### Task 11: Cozinha com polling

**Files:**
- Create: `Front-End/src/hooks/usePolling.ts`
- Create: `Front-End/src/pages/Cozinha.tsx`
- Modify: `Front-End/src/App.tsx`

**Interfaces:**
- Consumes: `listarPedidos`, `atualizarPedido`.
- Produces: `usePolling(callback: () => void | Promise<void>, intervaloMs: number): void`.

- [ ] **Step 1: Implementar o hook**

`usePolling` guarda o callback em `useRef`, registra `setInterval` em `useEffect` e limpa no unmount. Não dispara o callback imediatamente; a página faz a primeira busca no mount.

- [ ] **Step 2: Implementar a página**

Busca os pedidos, agrupa em `Aberto`, `Em preparo` e `Pronto` (ignora o resto), e renderiza três colunas com cartões de mesa, hora, itens e quantidades. Cada cartão mostra `Iniciar preparo` quando `Aberto` e `Pronto` quando `Em preparo`, chamando `atualizarPedido(id, { statusPedido })`; o botão fica desabilitado durante a requisição. Em erro, `alert` com a mensagem e nova busca. Rodapé com `Atualizado às HH:MM:SS`. Polling de 5000 ms.

- [ ] **Step 3: Verificar**

Run: `npm run build` e `npm run dev` com `cozinheiro/cozinheiro123`.
Expected: a fila aparece; um pedido criado pelo garçom surge em até 5 s; `Iniciar preparo` move o cartão para a coluna do meio; `Pronto` move para a última; nenhum botão de entregar/pagar.

- [ ] **Step 4: Commit**

```bash
git add Front-End/src/hooks/usePolling.ts Front-End/src/pages/Cozinha.tsx Front-End/src/App.tsx
git commit -m "feat: adiciona painel da cozinha com polling"
```

---

### Task 12: Cliente no tablet da mesa

**Files:**
- Create: `Front-End/src/lib/mesa.ts`
- Test: `Front-End/src/lib/mesa.test.ts`
- Create: `Front-End/src/hooks/useMesaDoTablet.ts`
- Create: `Front-End/src/pages/cliente/ConfigurarTablet.tsx`
- Create: `Front-End/src/pages/cliente/Cliente.tsx`
- Modify: `Front-End/src/App.tsx`

**Interfaces:**
- Consumes: `buscarPedidoAtivoDaMesa`, `criarPedido`, `adicionarItem`, `alterarItem`, `removerItem`, `listarProdutos`; `useAuth`; `podeEditarItens`.
- Produces:
  - `validarMesa(valor: string): number | null`
  - `mesaDaUrl(search: string): number | null`
  - `resolverMesa(search: string, armazenado: string | null): number | null`
  - `useMesaDoTablet(): { mesa: number | null; configurarMesa(valor: number): void }`

- [ ] **Step 1: Escrever o teste que falha**

```ts
import { expect, test } from "vitest";
import { mesaDaUrl, resolverMesa, validarMesa } from "./mesa";

test("validarMesa aceita apenas inteiro positivo", () => {
  expect(validarMesa("4")).toBe(4);
  expect(validarMesa("0")).toBeNull();
  expect(validarMesa("-1")).toBeNull();
  expect(validarMesa("abc")).toBeNull();
  expect(validarMesa("")).toBeNull();
});

test("mesaDaUrl lê ?mesa=", () => {
  expect(mesaDaUrl("?mesa=3")).toBe(3);
  expect(mesaDaUrl("?outro=1")).toBeNull();
  expect(mesaDaUrl("?mesa=0")).toBeNull();
});

test("URL vence o valor guardado", () => {
  expect(resolverMesa("?mesa=5", "3")).toBe(5);
  expect(resolverMesa("", "3")).toBe(3);
  expect(resolverMesa("", null)).toBeNull();
});
```

- [ ] **Step 2: Rodar e confirmar a falha**

Run: `npm test`
Expected: FAIL — módulo `./mesa` não encontrado.

- [ ] **Step 3: Implementar**

`mesa.ts` com `URLSearchParams` e `validarMesa`. `useMesaDoTablet` inicializa com `resolverMesa(window.location.search, localStorage.getItem("chicdog.mesa"))` e `configurarMesa` grava no `localStorage`.

Em `Cliente.tsx`:

1. Sem mesa → `ConfigurarTablet` (campo numérico, botão salvar).
2. Com mesa → `buscarPedidoAtivoDaMesa(mesa)`.
3. `null` → cardápio + carrinho; envio `criarPedido({ numeroMesa: mesa, itens })` sem `idGarcom`; 409 → recarrega e mostra o aviso.
4. Pedido com `idCliente === usuario.id`: mostra itens e total; se `podeEditarItens(status)`, permite adicionar/alterar/remover; senão, texto "o pedido já está em preparo".
5. Pedido com `idCliente === null`: mostra os itens e permite acrescentar; o envio usa `criarPedido` com a mesma mesa e o back vincula o cliente; 409 → aviso.
6. Pedido de outro cliente: somente leitura com o aviso de que o pedido da mesa já está em andamento.

Cabeçalho mostra `Mesa {mesa}`. Nenhum botão de status, pagamento ou cancelamento.

- [ ] **Step 4: Rodar e confirmar que passa**

Run: `npm test && npm run build`
Expected: PASS.

- [ ] **Step 5: Verificar manualmente**

Abra `http://localhost:5173/cliente?mesa=1` logado como cliente. Sem pedido na mesa, crie um. Em outra aba, `?mesa=2` com o mesmo cliente deve mostrar o outro pedido. Garçom cria um pedido na mesa 3; o cliente em `?mesa=3` vê os itens e consegue acrescentar. Depois que a cozinha move para `Em preparo`, recarregue: modo somente leitura.

- [ ] **Step 6: Commit**

```bash
git add Front-End/src/lib/mesa.ts Front-End/src/lib/mesa.test.ts Front-End/src/hooks/useMesaDoTablet.ts Front-End/src/pages/cliente Front-End/src/App.tsx
git commit -m "feat: adiciona fluxo do cliente configurado por mesa"
```

---

### Task 13: Verificação integrada e documentação

**Files:**
- Modify: `README.md`
- Test: execução manual completa

**Interfaces:**
- Consumes: tudo.
- Produces: instruções de execução e evidência de que o fluxo fecha.

- [ ] **Step 1: Rodar todas as verificações**

```bash
npm test
npm run typecheck
cd Front-End && npm test && npm run build
```

Expected: tudo PASS, build sem erros.

- [ ] **Step 2: Rodar o cenário completo**

1. `docker compose up -d postgres`; `npx prisma migrate deploy`; `npm run db:seed`; `npx tsx Back-End/src/app.ts`.
2. Admin em `/garcom/novo`: escolher garçom, mesa 1, 2 itens → pedido criado; total igual ao devolvido pelo back.
3. Garçom em `/garcom`: vê o pedido da mesa 1; abre e adiciona um item; total atualizado pelo back.
4. Cozinha: vê o pedido em `Aberto`; clica `Iniciar preparo`.
5. Garçom tenta adicionar item → 409 e a tela recarrega sem os controles de edição.
6. Cliente em `/cliente?mesa=1` → pedido da mesa em `Em preparo`, somente leitura.
7. Cozinha clica `Pronto`; garçom marca `Entregue`.
8. Cliente em `/cliente?mesa=2` sem pedido cria um; total confere; garçom vê na lista.
9. Duas abas criando pedido para a mesa 4 ao mesmo tempo: uma cria, a outra cai no mesmo pedido com o aviso.
10. Logout e login com cada perfil conferem os redirecionamentos.

- [ ] **Step 3: Documentar**

No `README.md`, acrescente uma seção `Front-end` com: instalar (`cd Front-End && npm install`), rodar (`npm run dev`), abrir `http://localhost:5173`, e a explicação da mesa do tablet (`?mesa=4` ou tela de configuração). Inclua os logins do seed.

- [ ] **Step 4: Commit**

```bash
git add README.md
git commit -m "docs: explica como rodar o front-end e configurar a mesa"
```
