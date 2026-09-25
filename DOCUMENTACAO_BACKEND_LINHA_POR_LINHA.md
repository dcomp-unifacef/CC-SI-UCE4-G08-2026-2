# Guia linha por linha: backend da UCE

Este guia explica as linhas úteis dos arquivos criados ou alterados nesta conversa. Está escrito para quem está começando com Express, TypeScript, Prisma e organização em camadas.

> As linhas vazias foram omitidas nas tabelas porque só servem para espaçamento. Os números são os números de linha dos arquivos atuais. `authService.ts` e `AppError.ts` já existiam antes; explico como são usados, mas não os apresento como arquivos que criei.

## Visão geral do fluxo

Para o CRUD de `TipoUsuario`, uma requisição passa por estas camadas:

```text
HTTP → rota → controller → service → repository → Prisma → banco
```

- **Rota** escolhe qual função tratará cada método e caminho HTTP.
- **Controller** lê URL e JSON, chama o service e monta a resposta HTTP.
- **Service** valida regras da aplicação e decide quando retornar erros.
- **Repository** faz consultas e gravações pelo Prisma.

O login segue este fluxo:

```text
POST /usuarios/login → authController → authService existente → banco / bcrypt / JWT
```

O controller valida a entrada HTTP. A lógica de procurar o usuário, comparar a senha e criar o token fica no service que já existia.

---

## 1. `Back-End/src/repositories/tipoUsuarioRepository.ts`

Esta camada traduz as operações da aplicação em consultas Prisma na tabela `tipoUsuario`.

| Linha | Código | O que faz |
|---:|---|---|
| 1 | `import { prisma } from "../database/client";` | Importa o cliente Prisma compartilhado, usado para conversar com o banco. |
| 3 | `function findAll() {` | Começa a operação de listar todos os tipos. |
| 4 | `return prisma.tipoUsuario.findMany({ orderBy: { nome: "asc" } });` | Busca todos os registros e ordena pelo nome em ordem alfabética. |
| 5 | `}` | Fecha a função `findAll`. |
| 7 | `function findById(idTipoUsuario: number) {` | Começa a busca de um tipo pelo ID numérico. |
| 8 | `return prisma.tipoUsuario.findUnique({ where: { idTipoUsuario } });` | Pede ao Prisma um registro com esse ID; se não existir, o retorno será `null`. |
| 9 | `}` | Fecha a função `findById`. |
| 11 | `function create(nome: string) {` | Começa a criação. O service já validou o nome antes de chegar aqui. |
| 12 | `return prisma.tipoUsuario.create({ data: { nome } });` | Insere um registro na tabela com o nome informado. |
| 13 | `}` | Fecha a função `create`. |
| 15 | `function update(idTipoUsuario: number, nome: string) {` | Começa a atualização, recebendo o ID e o novo nome. |
| 16 | `return prisma.tipoUsuario.update({ where: { idTipoUsuario }, data: { nome } });` | Encontra o registro pelo ID e grava o novo nome. |
| 17 | `}` | Fecha a função `update`. |
| 19 | `function remove(idTipoUsuario: number) {` | Começa a exclusão pelo ID. |
| 20 | `return prisma.tipoUsuario.delete({ where: { idTipoUsuario } });` | Pede ao Prisma para apagar o registro. Uma chave estrangeira pode bloquear a exclusão se usuários ainda usarem esse tipo. |
| 21 | `}` | Fecha a função `remove`. |
| 23 | `export default { findAll, findById, create, update, remove };` | Exporta as cinco operações para o service. |

---

## 2. `Back-End/src/services/tipoUsuarioService.ts`

O service concentra as regras: nome obrigatório, limite de tamanho, existência do ID e cuidado com tipos associados a usuários.

| Linha | Código | O que faz |
|---:|---|---|
| 1 | `import repository from "../repositories/tipoUsuarioRepository";` | Importa as operações que acessam o banco. |
| 2 | `import { AppError } from "../errors/AppError";` | Importa o erro da aplicação, que carrega uma mensagem e um status HTTP. |
| 4 | `function validarNome(nome: unknown): asserts nome is string {` | Declara a validação. `unknown` obriga o código a conferir o valor; `asserts` informa ao TypeScript que, ao terminar, o nome é texto. |
| 5 | `if (typeof nome !== "string" || nome.trim().length === 0) {` | Rejeita valores que não são texto e textos vazios ou só com espaços. |
| 6 | `throw new AppError("O campo nome é obrigatório.", 400);` | Interrompe a operação com HTTP 400, indicando dados inválidos. |
| 7 | `}` | Fecha essa condição. |
| 8 | `if (nome.trim().length > 50) {` | Confere o limite de 50 caracteres que corresponde à coluna do banco. |
| 9 | `throw new AppError("O nome deve ter no máximo 50 caracteres.", 400);` | Informa que o nome ultrapassou o limite. |
| 10 | `}` | Fecha a condição de tamanho. |
| 11 | `}` | Fecha a função de validação. |
| 13 | `async function findAll() {` | Declara a listagem assíncrona, pois a consulta ao banco leva tempo. |
| 14 | `return repository.findAll();` | Delega a consulta ao repository e devolve o resultado. |
| 15 | `}` | Fecha `findAll`. |
| 17 | `async function findById(id: number) {` | Começa a busca com verificação de existência. |
| 18 | `const tipoUsuario = await repository.findById(id);` | Espera o banco responder e guarda o registro encontrado ou `null`. |
| 19 | `if (!tipoUsuario) throw new AppError("Tipo de usuário não encontrado.", 404);` | Se não encontrou, interrompe com 404 Not Found. |
| 20 | `return tipoUsuario;` | Devolve o tipo encontrado. |
| 21 | `}` | Fecha `findById`. |
| 23 | `async function create(nome: unknown) {` | Começa o cadastro; o valor ainda é `unknown` porque veio da requisição HTTP. |
| 24 | `validarNome(nome);` | Aplica as regras de nome antes de gravar. |
| 25 | `return repository.create(nome.trim());` | Remove espaços das pontas e manda o nome ao repository. |
| 26 | `}` | Fecha `create`. |
| 28 | `async function update(id: number, nome: unknown) {` | Começa a atualização. |
| 29 | `await findById(id);` | Garante que o ID existe; caso contrário, a busca lança 404. |
| 30 | `validarNome(nome);` | Reaplica as mesmas regras do cadastro. |
| 31 | `return repository.update(id, nome.trim());` | Grava o novo nome sem espaços nas pontas. |
| 32 | `}` | Fecha `update`. |
| 34 | `async function remove(id: number) {` | Começa a exclusão. |
| 35 | `await findById(id);` | Confirma que o registro existe antes de tentar excluir. |
| 36 | `try {` | Inicia um bloco para tratar uma falha possível do banco. |
| 37 | `return await repository.remove(id);` | Tenta excluir e espera a resposta do Prisma. |
| 38 | `} catch (error: any) {` | Captura a falha caso a exclusão não seja permitida. |
| 39 | `// Um tipo associado a usuários não pode ser apagado por causa da FK.` | Comentário: a chave estrangeira protege usuários que referenciam este tipo. |
| 40 | `if (error?.code === "P2003") {` | Reconhece o código Prisma de violação de chave estrangeira. |
| 41 | `throw new AppError("Não é possível excluir um tipo associado a usuários.", 409);` | Converte a falha em HTTP 409 Conflict, explicando que o tipo está em uso. |
| 42 | `}` | Fecha a condição do erro de chave estrangeira. |
| 43 | `throw error;` | Relança outros erros, para que falhas diferentes não sejam escondidas. |
| 44 | `}` | Fecha o `catch`. |
| 45 | `}` | Fecha `remove`. |
| 47 | `export default { findAll, findById, create, update, remove };` | Disponibiliza as operações para o controller. |

---

## 3. `Back-End/src/controllers/tipoUsuarioController.ts`

O controller é a ponte entre HTTP e service. Ele não consulta o banco diretamente.

| Linha | Código | O que faz |
|---:|---|---|
| 1 | `import service from "../services/tipoUsuarioService";` | Importa as regras e operações de negócio. |
| 2 | `import { AppError } from "../errors/AppError";` | Importa o erro usado para rejeitar IDs inválidos. |
| 4 | `function parseId(raw: string): number {` | Declara uma função auxiliar para validar IDs que chegam como texto na URL. |
| 5 | `const id = Number(raw);` | Converte, por exemplo, o texto `"12"` para o número `12`. |
| 6 | `if (!Number.isInteger(id) || id <= 0) throw new AppError("O id deve ser um inteiro positivo.", 400);` | Rejeita letras, números decimais, zero e valores negativos. |
| 7 | `return id;` | Devolve o ID depois da validação. |
| 8 | `}` | Fecha `parseId`. |
| 10 | `export async function retrieveAll(_req: any, res: any, next: any) {` | Declara o handler de listagem. `_req` não é usado; o sublinhado sinaliza isso. |
| 11 | `try { res.json(await service.findAll()); } catch (error) { next(error); }` | Devolve a lista como JSON; se falhar, encaminha o erro ao Express. |
| 12 | `}` | Fecha o handler de listagem. |
| 14 | `export async function retrieveOne(req: any, res: any, next: any) {` | Declara o handler de busca individual. |
| 15 | `try { res.json(await service.findById(parseId(req.params.id))); } catch (error) { next(error); }` | Lê `id` da URL, valida, consulta o service e responde em JSON. |
| 16 | `}` | Fecha o handler. |
| 18 | `export async function create(req: any, res: any, next: any) {` | Declara o handler de criação. |
| 19 | `try { res.status(201).json(await service.create(req.body?.nome)); } catch (error) { next(error); }` | Lê `nome` do JSON, pede a criação e responde 201 Created. O `?.` evita erro se `body` faltar. |
| 20 | `}` | Fecha o handler. |
| 22 | `export async function update(req: any, res: any, next: any) {` | Declara o handler de atualização. |
| 23 | `try { res.json(await service.update(parseId(req.params.id), req.body?.nome)); } catch (error) { next(error); }` | Valida o ID, pega o nome enviado e responde com o registro atualizado. |
| 24 | `}` | Fecha o handler. |
| 26 | `export async function remove(req: any, res: any, next: any) {` | Declara o handler de exclusão. |
| 27 | `try {` | Inicia o tratamento da operação assíncrona. |
| 28 | `await service.remove(parseId(req.params.id));` | Valida o ID e pede ao service que exclua o tipo. |
| 29 | `res.status(204).end();` | Responde 204 No Content: sucesso sem corpo de resposta. |
| 30 | `} catch (error) { next(error); }` | Encaminha qualquer erro ao middleware central. |
| 31 | `}` | Fecha o handler. |

---

## 4. `Back-End/src/routes/tipoUsuarios.ts`

| Linha | Código | O que faz |
|---:|---|---|
| 1 | `import { Router } from "express";` | Importa a ferramenta para agrupar rotas Express. |
| 2 | `import * as controller from "../controllers/tipoUsuarioController";` | Importa os handlers HTTP. |
| 4 | `const router = Router();` | Cria o conjunto de rotas. |
| 5 | `router.get("/", controller.retrieveAll);` | GET no prefixo `/tipo-usuarios` lista tudo. |
| 6 | `router.get("/:id", controller.retrieveOne);` | GET em `/tipo-usuarios/2` busca o ID 2. |
| 7 | `router.post("/", controller.create);` | POST em `/tipo-usuarios` cria um tipo. |
| 8 | `router.put("/:id", controller.update);` | PUT em `/tipo-usuarios/2` atualiza esse tipo. |
| 9 | `router.delete("/:id", controller.remove);` | DELETE em `/tipo-usuarios/2` tenta excluir esse tipo. |
| 11 | `// O app.ts atual carrega as rotas com require().` | Comentário que explica a forma de exportação escolhida. |
| 12 | `module.exports = router;` | Exporta diretamente o router em CommonJS, que é como `app.ts` o importa. |

---

## 5. `Back-End/src/controllers/authController.ts`

| Linha | Código | O que faz |
|---:|---|---|
| 1 | `import { Request, Response, NextFunction } from "express";` | Importa tipos Express para requisição, resposta e encaminhamento de erros. |
| 2 | `import { executeLogin } from "../services/authService";` | Importa a autenticação já implementada no service existente. |
| 3 | `import { AppError } from "../errors/AppError";` | Importa o erro controlado para entrada inválida. |
| 5 | `export async function login(req: Request, res: Response, next: NextFunction) {` | Exporta o handler usado pela rota POST `/usuarios/login`. |
| 6 | `try {` | Começa o bloco que trata erros de validação e autenticação. |
| 7 | `const { loginUsuario, senha } = req.body ?? {};` | Lê os campos do JSON; se não vier corpo, usa um objeto vazio. |
| 9 | `if (typeof loginUsuario !== "string" || loginUsuario.trim().length === 0) {` | Exige um login de texto não vazio. |
| 10 | `throw new AppError("O campo loginUsuario é obrigatório.", 400);` | Informa que o login está faltando ou inválido. |
| 11 | `}` | Fecha a validação do login. |
| 12 | `if (typeof senha !== "string" || senha.length === 0) {` | Exige senha de texto não vazia. A senha não é cortada nem aparada. |
| 13 | `throw new AppError("O campo senha é obrigatório.", 400);` | Informa que a senha está faltando ou inválida. |
| 14 | `}` | Fecha a validação da senha. |
| 16 | `const resultado = await executeLogin({` | Chama a autenticação preexistente e espera o resultado. |
| 17 | `loginUsuario: loginUsuario.trim(),` | Remove espaços antes e depois do login. |
| 18 | `senha,` | Encaminha a senha sem modificá-la para comparação com o hash. |
| 19 | `});` | Fecha o objeto enviado a `executeLogin`. |
| 21 | `return res.status(200).json(resultado);` | Em sucesso, responde 200 OK e devolve usuário e token em JSON. |
| 22 | `} catch (error) {` | Captura erros lançados durante a validação ou o login. |
| 23 | `return next(error);` | Encaminha o erro ao middleware de erros do Express. |
| 24 | `}` | Fecha o `catch`. |
| 25 | `}` | Fecha a função `login`. |

---

## 6. `Back-End/src/app.ts`

| Linha | Código | O que faz |
|---:|---|---|
| 1 | `const express = require("express");` | Carrega Express usando CommonJS. |
| 2 | `const tipoUsuariosRouter = require("./routes/tipoUsuarios");` | Carrega o router de TipoUsuario, exportado diretamente com `module.exports`. |
| 3 | `// usuarios.ts exporta o router como default, então o CommonJS expõe .default.` | Explica por que a próxima linha acessa `.default`. |
| 4 | `const usuariosRouter = require("./routes/usuarios").default;` | Pega o export default do router de usuários; sem `.default`, `app.use` receberia o objeto de módulo. |
| 5 | `const { AppError } = require("./errors/AppError");` | Importa a classe de erro que já existia. |
| 7 | `const app = express();` | Cria a aplicação. |
| 8 | `app.use(express.json());` | Ativa a leitura de corpos JSON. |
| 9 | `app.use("/tipo-usuarios", tipoUsuariosRouter);` | Registra todas as rotas de TipoUsuario com esse prefixo. |
| 10 | `app.use("/usuarios", usuariosRouter);` | Registra as rotas de usuários com esse prefixo. |
| 12 | `// Converte AppError em resposta HTTP com seu status; erros inesperados ficam como 500.` | Descreve a função do middleware logo abaixo. |
| 13 | `app.use((error: any, _req: any, res: any, _next: any) => {` | Registra um middleware de erro do Express; quatro parâmetros identificam esse tipo de middleware. |
| 14 | `if (error instanceof AppError) {` | Detecta falhas controladas da aplicação. |
| 15 | `return res.status(error.statusCode).json({ erro: error.message });` | Responde usando o status guardado no erro, como 400, 401, 404 ou 409. |
| 16 | `}` | Fecha a condição de AppError. |
| 17 | `console.error(error);` | Registra erros inesperados no terminal para depuração. |
| 18 | `return res.status(500).json({ erro: "Erro interno do servidor." });` | Responde 500 para falhas não previstas, sem enviar detalhes internos ao cliente. |
| 19 | `});` | Fecha o middleware. |
| 21 | `const PORT = Number(process.env.PORT) || 3000;` | Usa a porta do ambiente quando existe; senão usa 3000. |
| 22 | `app.listen(PORT, () => {` | Inicia o servidor HTTP. |
| 23 | `console.log(`Servidor rodando com sucesso na porta ${PORT}`);` | Informa no terminal que o servidor subiu e em qual porta. |
| 24 | `});` | Fecha a chamada de inicialização. |

---

## 7. Mudanças em `tsconfig.json`

A configuração anterior combinava `module: "CommonJS"` com `moduleResolution: "Bundler"`; o TypeScript instalado recusava essa combinação. Os dois valores agora usam Node16 juntos.

| Configuração | Para que serve |
|---|---|
| `target: "ES2023"` | Permite recursos modernos do JavaScript até ES2023. |
| `module: "Node16"` | Aplica regras de módulos do Node moderno. Como `package.json` não declara `type: "module"`, os arquivos do projeto continuam no modo CommonJS do Node. |
| `moduleResolution: "Node16"` | Resolve os imports segundo as regras Node16; fica pareado com `module`. |
| `strict: true` | Ativa verificações rigorosas de tipos. |
| `esModuleInterop: true` | Facilita a interoperabilidade entre imports TypeScript e pacotes CommonJS. |
| `forceConsistentCasingInFileNames: true` | Detecta caminhos com diferença de maiúsculas/minúsculas. |
| `skipLibCheck: true` | Pula a checagem interna dos arquivos de tipos das dependências. |
| `outDir: "./dist"` | Define onde o compilador gravaria JavaScript gerado. |
| `rootDir: "./Back-End"` | Marca a raiz do código compilado. |
| `types: ["node"]` | Inclui tipos do Node.js. |
| `moduleDetection: "force"` | Trata os arquivos incluídos como módulos. |
| `include: ["Back-End/**/*"]` | Inclui os arquivos do backend na compilação. |

## 8. Mudança no comando `dev` de `package.json`

O script ficou assim:

```json
"dev": "prisma migrate deploy && tsx Back-End/src/app.ts"
```

O comando aplica as migrações pendentes primeiro. O operador `&&` só inicia o app se a migração terminar sem erro. `tsx` já está nas dependências e executa o `app.ts` existente. O comando antigo apontava para `src/server.ts`, que não existia, e usava `ts-node-dev`, que não estava listado nas dependências.

## 9. Código existente que as alterações usam

`Back-End/src/services/authService.ts` já existia. A função `executeLogin` procura o usuário pelo login, inclui o tipo de usuário, recusa usuários ausentes ou inativos, compara a senha usando bcrypt e gera um JWT usando jsonwebtoken. O controller novo não duplica essa lógica: apenas valida a requisição e chama o service.

`Back-End/src/errors/AppError.ts` também já existia. Ela estende `Error` e guarda `statusCode`; o middleware novo em `app.ts` usa esse código para formar a resposta HTTP correta.

## 10. Exemplos de requisição

| Método e caminho | Exemplo de corpo | Resultado esperado |
|---|---|---|
| `GET /tipo-usuarios` | — | Lista os tipos em ordem alfabética. |
| `GET /tipo-usuarios/2` | — | Devolve o tipo de ID 2 ou erro 404. |
| `POST /tipo-usuarios` | `{"nome":"Garçom"}` | Cria um tipo e responde 201. |
| `PUT /tipo-usuarios/2` | `{"nome":"Atendente"}` | Atualiza o nome do ID 2. |
| `DELETE /tipo-usuarios/2` | — | Exclui e responde 204, ou 409 se usuários dependerem desse tipo. |
| `POST /usuarios/login` | `{"loginUsuario":"miguel","senha":"minha-senha"}` | Responde com dados básicos do usuário e token se o login for válido. |

## 11. Verificação feita e o que falta validar

Foi executado `tsc --noEmit`: a checagem de tipos passou sem erros após configurar `module` e `moduleResolution` como Node16. `--noEmit` significa que a checagem não gera arquivos JavaScript.

A API não foi iniciada e não foram feitas requisições reais ao banco nesta etapa. Portanto, a compilação passou, mas ainda é necessário confirmar que o banco está acessível e que `npm run dev`, as migrações e os endpoints funcionam em execução.

---

## 12. CRUD da tabela `Usuario`: o que já existia e o que foi completado

### Estado que encontrei antes desta etapa

A estrutura básica do CRUD já existia: controller com listagem, busca, criação, atualização e exclusão; service com hash da senha no cadastro/alteração; repository com operações Prisma; DTOs; e rota `/usuarios` com login. Porém, a camada tinha problemas: o controller usava `require` para importar um service exportado como `default`; consultas do repository traziam o hash de senha; não havia validação suficiente dos campos; atualizar login não verificava duplicidade; e excluir fisicamente podia falhar devido aos pedidos relacionados.

### `Back-End/src/controllers/usuarioController.ts`

- Os imports agora usam `import service from ...`, coerente com o `export default` do service.
- `parseId` confirma que o ID da URL é texto que representa inteiro positivo. Isso evita enviar valores inválidos ao Prisma.
- Cada handler (`retrieveAll`, `retrieveOne`, `create`, `update`, `remove`) chama o service e encaminha falhas com `next(error)`.
- A criação responde 201; a exclusão responde 204; as outras operações devolvem JSON.
- Removi a mistura de exports CommonJS e exports TypeScript. O router importa os handlers TypeScript nomeados.

### `Back-End/src/services/usuarioService.ts`

- `getObjectData` exige que o corpo seja um objeto JSON, rejeitando `null`, listas e outros tipos.
- `validateText` valida nome e login como texto não vazio, remove espaços das pontas e aplica o limite do banco: 80 caracteres.
- `validatePassword` exige senha não vazia e com até 255 caracteres. A senha é preservada como foi digitada, inclusive espaços nas pontas, e depois é transformada em hash com bcrypt.
- `validateIdTipoUsuario` exige um inteiro positivo; `ensureTipoUsuarioExists` confirma a existência desse tipo antes de criar ou alterar o usuário.
- `create` escolhe explicitamente os campos permitidos, verifica login duplicado, valida o tipo, gera o hash e ativa o usuário (`statusUsuario: true`). O cliente não escolhe o status inicial.
- `update` aceita apenas os campos definidos no DTO. Valida os campos enviados, verifica login duplicado excluindo o próprio usuário, faz hash de senha nova e rejeita um corpo sem campos atualizáveis.
- `throwDatabaseError` traduz `P2002` (restrição única de login) para HTTP 409 e `P2003` (relação inválida) para HTTP 400. Erros desconhecidos continuam sendo encaminhados.
- `findById` devolve 404 quando não encontra usuário.
- `remove` faz desativação lógica via repository em vez de apagar a linha. Isso mantém pedidos antigos que referenciam o usuário. Para reativar, `PUT /usuarios/:id` pode enviar `{"statusUsuario":true}`.

### `Back-End/src/repositories/usuarioRepository.ts`

- `publicSelect` enumera os campos devolvidos ao cliente e não inclui `senha`; também inclui somente o nome do tipo associado.
- `findAll` e `findById` usam essa seleção segura e ordenam a listagem pelo nome.
- `findByLogin` seleciona somente ID e login, pois sua finalidade é detectar duplicidade.
- `findTipoUsuarioById` verifica no banco a existência da chave estrangeira antes de criar ou alterar.
- `create` e `update` gravam com Prisma, mas continuam devolvendo apenas os campos de `publicSelect`.
- `deactivate` atualiza `statusUsuario` para `false`, preservando a linha para o histórico de pedidos.

### `Back-End/src/dto/usuario/createUsuarioDto.ts` e `updateUsuarioDto.ts`

- O DTO de criação lista `nome`, `loginUsuario`, `senha` e `idTipoUsuario`. `statusUsuario` saiu da entrada de criação porque o service sempre inicia novos usuários ativos.
- O DTO de atualização mantém os campos opcionais, permitindo alterar somente parte dos dados. `statusUsuario` pode ser enviado como booleano para desativar ou reativar.

### Rotas e exemplos de Usuario

| Método e caminho | Corpo | Ação |
|---|---|---|
| `GET /usuarios` | — | Lista usuários; nenhum resultado inclui o hash da senha. |
| `GET /usuarios/3` | — | Busca usuário por ID ou retorna 404. |
| `POST /usuarios` | `{"nome":"Ana","loginUsuario":"ana","senha":"senha123","idTipoUsuario":1}` | Cria usuário ativo com senha criptografada. |
| `PUT /usuarios/3` | `{"nome":"Ana Silva"}` | Atualiza os campos enviados; aceita `nome`, `loginUsuario`, `senha`, `statusUsuario` e `idTipoUsuario`. |
| `DELETE /usuarios/3` | — | Desativa o usuário e preserva seus pedidos. Responde 204. |
| `POST /usuarios/login` | `{"loginUsuario":"ana","senha":"senha123"}` | Usa o authController e o authService existente para autenticar. |

A verificação `tsc --noEmit` passou depois dessas alterações. Não foi feita uma chamada real ao banco; ainda é preciso testar os endpoints com o banco iniciado.

---

## 13. Conexão Prisma com PostgreSQL

O projeto foi convertido de SQL Server para PostgreSQL para seguir o padrão utilizado com o professor. O Prisma 7 exige um driver adapter, portanto a conexão foi ajustada em `Back-End/src/database/client.ts`:

- O arquivo importa `PrismaPg` de `@prisma/adapter-pg` em vez de `PrismaMssql`.
- O adapter recebe a `DATABASE_URL` definida no `.env` e é passado ao construtor de `PrismaClient`.
- A validação da variável de ambiente continua ocorrendo antes de criar a conexão.
- O driver `pg` foi adicionado às dependências do projeto e o adapter de SQL Server foi removido.
- O schema Prisma passou a usar `provider = "postgresql"`.
- O `docker-compose.yml` agora define um serviço PostgreSQL na porta `5432`, com banco `chicdog` e healthcheck.
- A migration antiga, que usava sintaxe do SQL Server, foi arquivada em `prisma/legacy-sqlserver/` e não é executada pelo PostgreSQL.
- Uma nova migration PostgreSQL foi gerada em `prisma/migrations/20260925202218_init/migration.sql`, usando `SERIAL`, `BOOLEAN`, `TIMESTAMP`, `DECIMAL` e chaves estrangeiras compatíveis com PostgreSQL.
- `Banco/BD.sql` foi atualizado para refletir o mesmo schema.

### Testes e verificações executados

- `npx tsc --noEmit`: verificação de tipos concluída sem erros.
- `npx prisma validate`: schema Prisma válido.
- `docker compose config`: configuração do Docker Compose validada.
- `docker compose up -d postgres`: serviço PostgreSQL iniciado.
- `docker compose ps`: serviço `chicdog_postgres` reportado como `healthy`.
- `npx prisma migrate dev --name init`: nova migration PostgreSQL gerada.
- `npx prisma generate`: Prisma Client regenerado para a configuração atual.
- `npm run dev` ainda não foi executado nesta etapa; o teste HTTP dos endpoints fica para a próxima validação.

A auditoria de dependências será revisada novamente depois que a API for executada com o PostgreSQL.

---

## 14. DTOs de `TipoUsuario`

Foram criados dois arquivos para documentar os formatos aceitos pela API:

- `Back-End/src/dto/tipoUsuario/createTipoUsuarioDto.ts`: exporta `CreateTipoUsuarioDto`, com `nome: string`, porque o nome é necessário para criar um tipo.
- `Back-End/src/dto/tipoUsuario/updateTipoUsuarioDto.ts`: exporta `UpdateTipoUsuarioDto`, com `nome?: string`, representando uma atualização parcial. Como `nome` é o único campo editável por enquanto, o service ainda rejeita atualização sem um nome válido.
- `tipoUsuarioController.ts` importa os dois DTOs e tipa o corpo da criação e atualização antes de encaminhá-lo ao service. Esse cast ajuda o TypeScript, mas não substitui validação real.
- `tipoUsuarioService.ts` recebe os DTOs como tipos de entrada, extrai `nome` e mantém validação em tempo de execução: exige texto não vazio e limita o nome a 50 caracteres, conforme a coluna do banco.

A compilação `tsc --noEmit` passou depois dessa integração.

---

## 15. CRUD de `Produto`

A terceira tabela funcional do projeto é `Produto`. O módulo segue a mesma organização em camadas usada por `TipoUsuario` e `Usuario`.

### Arquivos criados

- `Back-End/src/dto/produto/createProdutoDto.ts`: define `CreateProdutoDto` com `nome`, `preco`, `descricao` e `disponivel` opcional.
- `Back-End/src/dto/produto/updateProdutoDto.ts`: define `UpdateProdutoDto` com todos os campos opcionais para permitir atualização parcial.
- `Back-End/src/repositories/produtoRepository.ts`: contém `findAll`, `findById`, `create`, `update` e `remove` usando o Prisma.
- `Back-End/src/services/produtoService.ts`: contém as validações e regras de negócio do módulo.
- `Back-End/src/controllers/produtoController.ts`: lê os parâmetros e o corpo JSON, chama o service e trata os status HTTP.
- `Back-End/src/routes/produtos.ts`: registra as rotas do recurso.

### Validações do service

- `nome`: texto não vazio, com no máximo 80 caracteres, conforme a coluna do banco.
- `preco`: número finito e maior que zero.
- `descricao`: texto não vazio, com no máximo 100 caracteres.
- `disponivel`: boolean opcional no cadastro e boolean quando enviado na atualização.
- No cadastro, quando `disponivel` não é enviado, o produto assume `true`, conforme o padrão do schema.
- Na atualização, apenas os campos presentes no corpo são enviados ao repository.
- Uma atualização sem campos válidos é rejeitada com `AppError` e status `400`.
- Um produto inexistente é rejeitado com `AppError` e status `404`.

### Rotas de `Produto`

| Método e caminho | Corpo | Ação |
|---|---|---|
| `GET /produtos` | — | Lista todos os produtos. |
| `GET /produtos/:id` | — | Busca um produto pelo ID. |
| `POST /produtos` | `{"nome":"Cachorro-quente","preco":15.5,"descricao":"Lanche para cachorro"}` | Cria um produto e responde `201`. |
| `PUT /produtos/:id` | `{"preco":18.9}` | Atualiza os campos enviados. |
| `DELETE /produtos/:id` | — | Exclui um produto e responde `204`. |

O controller valida o parâmetro `id` antes de chamar o service. Valores que não representam um inteiro positivo são rejeitados com status `400`.

A verificação `npx tsc --noEmit` passou após a criação do módulo.

---

## 16. Estado atual da entrega

A entrega atual possui três módulos de API funcionando:

- `TipoUsuario`;
- `Usuario`;
- `Produto`.

O schema também possui as entidades `Pedido`, `Pagamento` e `ItemPedido`, mas elas ainda não possuem controllers, services ou repositories próprios. A conversão do banco para PostgreSQL foi concluída e a migration ativa está em `prisma/migrations/20260925202218_init/migration.sql`.

Ainda falta executar a validação final da API com `npm run dev` e testar os endpoints com o PostgreSQL em execução.