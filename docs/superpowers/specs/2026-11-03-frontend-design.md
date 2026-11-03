# Design — Frontend React do sistema Chic Dog (UCE Grupo 08)

Data: 2026-11-03
Status: proposta para aprovação

## 1. Intenção e por quê

A Chic Dog de Franca anotava pedidos em papel, o que gerava letra ilegível, pedidos errados e confusão entre salão e cozinha. O back-end em Express/Prisma já resolve o registro e as regras; falta a interface operacional.

Três pessoas usam o sistema em situações diferentes:

- **Garçom**, em um tablet no salão: abre o pedido da mesa, escolhe produtos e envia para a cozinha.
- **Cliente**, em um tablet fixo na mesa: vê o que já foi pedido naquela mesa e acrescenta itens enquanto o pedido está `Aberto`.
- **Cozinheiro**, em um monitor fixo: vê a fila e avança o preparo (`Aberto → Em preparo → Pronto`).

O objetivo do front é substituir o papel nesses três momentos, sem introduzir um sistema de PDV completo.

## 2. Objetivos

- Login com JWT e redirecionamento por perfil (`Garçom`, `Cliente`, `Cozinheiro`, `Administrador`).
- Garçom: listar pedidos ativos, criar pedido por mesa, adicionar/editar/remover itens, marcar `Entregue` e cancelar.
- Cliente: na mesa configurada no tablet, ver o pedido da mesa, criar o primeiro pedido e acrescentar/alterar/remover itens enquanto o pedido está `Aberto`.
- Cozinha: painel com pedidos `Aberto`, `Em preparo` e `Pronto`, com botões para `Em preparo` e `Pronto`, atualizado por polling.
- Layout utilizável em tablet 10" (paisagem) e monitor 1080p.
- Consumir a API existente sem duplicar regra de negócio no cliente.

## 3. Não objetivos

- Tela de pagamento e fechamento de conta.
- CRUD de produtos, usuários e tipos de usuário.
- Alteração de itens depois que o pedido entra em `Em preparo`, inclusive pelo `Administrador`. A exceção do admin fica registrada como possibilidade futura, fora desta entrega.
- Tempo real via WebSocket.
- Funcionamento offline.
- Notificações sonoras ou impressoras.
- Autoatendimento sem login: o cliente usa uma conta real.

## 4. Anti-objetivos

- Não ser um PDV genérico multi-restaurante.
- Não calcular preço/total como fonte da verdade no cliente — o total exibido é sempre o `valorTotal` devolvido pelo back.
- Não guardar senha no navegador.
- Não simular tempo real com polling agressivo (menos de 3 s) nem esconder que é polling.
- Não permitir que o cliente escolha a mesa: a mesa vem da configuração do tablet.

## 5. Restrições

- API existente em `http://localhost:3000` (Express + Prisma + PostgreSQL).
- Login retorna `{ usuario: { id, nome, login, tipo }, token }`; o token vai em `Authorization: Bearer`.
- Papéis no back: `Administrador`, `Garçom`, `Cozinheiro`, `Cliente`.
- `Cozinheiro` só pode alterar `statusPedido`, e apenas para `Em preparo` ou `Pronto`.
- Transições válidas: `Aberto → Em preparo → Pronto → Entregue → Pago`, com `Cancelado` permitido até `Entregue`.
- **Itens só podem ser criados, alterados ou removidos enquanto o pedido está `Aberto`.** A partir de `Em preparo`, ninguém altera (o admin fica fora desta entrega).
- JWT expira em 1 dia; não há refresh token.
- Repositório único, com `Back-End/` já existente; o front ficará em `Front-End/`.
- Desenvolvimento com `vite dev` e proxy para `http://localhost:3000`; deploy não faz parte desta entrega.
- **Stack do front segue o guia do professor (`sigaEssaStack.pdf`):** Vite + React + TypeScript + **Bootstrap** + React Router. O guia não usa Tailwind; a interface é montada com classes do Bootstrap.
- O tablet do cliente é configurado com o número da mesa. Ele não escolhe mesa na tela.

## 6. Mudanças necessárias no back antes do front

O modelo atual de `Pedido` não tem mesa, exige `idCliente` e exige `idGarcom`. O fluxo definido é **somente por mesa**, com pedido podendo nascer do garçom ou do cliente.

- Adicionar `numeroMesa Int` obrigatório em `Pedido` (migration com backfill para linhas existentes).
- Tornar `idCliente Int?` opcional: pedido aberto pelo garçom pode não ter cliente; pedido feito pelo cliente tem `idCliente` do token.
- Tornar `idGarcom Int?` opcional: pedido feito pelo cliente nasce sem garçom. A tela do garçom mostra "sem responsável" e qualquer garçom pode assumir/editar.
- **Um pedido ativo por mesa:** o service verifica, na criação, se já existe pedido com o mesmo `numeroMesa` cujo status não seja `Pago` nem `Cancelado`. Para valer com dois tablets ao mesmo tempo, além da checagem no service, criar um **índice único parcial** `WHERE statusPedido NOT IN ('Pago', 'Cancelado')` via SQL na migration; violação (`P2002`) vira 409.
- **Resposta do 409:** `{ erro, idPedido }`, para o front abrir o pedido existente.
- **Cliente entrando em pedido aberto pelo garçom:** se o pedido ativo da mesa tem `idCliente` nulo, o `POST /pedidos` do cliente vincula `idCliente` a ele e acrescenta os itens, devolvendo o pedido atualizado (200). Se o pedido já pertence a outro cliente, responde 409.
- **Descoberta do pedido da mesa:** novo `GET /pedidos/mesa/:numeroMesa/ativo`, autenticado, que devolve o pedido ativo da mesa (ou 404). É usado pelo tablet do cliente e pela tela de novo pedido do garçom. Trade-off assumido: o back confia no `numeroMesa` enviado pelo tablet, então um usuário autenticado consegue consultar outra mesa; para o escopo do trabalho isso é aceitável.
- **Regra de edição de itens:** `STATUS_EDICAO_ITENS` passa a ser apenas `["Aberto"]`; a mensagem de erro e os testes existentes precisam acompanhar.
- **Criação pelo cliente:** `idCliente` vem do token (ignora o body), `idGarcom` não é enviado e não é validado.
- **Criação pelo garçom/admin:** `idGarcom` vem do token do garçom ou do seletor do admin; `idCliente` continua opcional.

## 7. Abordagens consideradas

**A — Um app React com rotas por perfil (escolhida).**
Vite + React + TypeScript + React Router. Rotas `/login`, `/garcom`, `/garcom/novo`, `/garcom/pedidos/:id`, `/cliente`, `/cozinha`. Um build, um deploy, componentes e cliente HTTP compartilhados. Trade-off: o bundle de cada perfil carrega o código dos outros, irrelevante neste tamanho.

**B — Dois apps separados.**
Isolamento e deploy independentes, mas dobra configuração, build e manutenção. Não compensa para o prazo e o tamanho do grupo.

**C — Next.js.**
SSR não traz benefício para um painel autenticado interno e adiciona complexidade de rotas de servidor.

## 8. Como foi decidido

- **Stack:** Vite + React + TypeScript + React Router + Bootstrap, conforme o guia do professor.
- **HTTP:** `fetch` com um módulo `api.ts` que injeta o token e trata 401.
- **Estado:** `AuthContext` para usuário/token; o resto em estado local. Sem Redux e sem React Query.
- **Atualização da cozinha:** polling de 5 s com `useEffect` + `setInterval`.
- **Estilo:** Bootstrap importado em `main.tsx`; sem Tailwind.
- **Estrutura:** `Front-End/` ao lado de `Back-End/`.
- **Rotas protegidas:** componente de guarda que lê o `tipo` do usuário e redireciona.
- **Administrador:** entra em `/garcom` como operador; na criação de pedido escolhe o garçom responsável em um `select` alimentado por `GET /usuarios` (admin-only), filtrando `tipoUsuario.nome === "Garçom"`.
- **Cliente:** entra em `/cliente`; a mesa vem da configuração do tablet, não de um seletor.
- **Mesa:** um único pedido ativo por mesa; ao tentar criar outro, o front abre o pedido existente e o usuário acrescenta os itens desejados.
- **Total:** sempre o `valorTotal` devolvido pelo back. O carrinho antes de enviar mostra uma prévia calculada com os preços de `GET /produtos`.

### Configuração da mesa no tablet do cliente

- O número da mesa é lido de `?mesa=<número>` na URL ou de `localStorage`, nessa ordem.
- Se não houver mesa configurada, aparece uma tela simples "Configurar tablet" pedindo o número uma vez; o valor fica salvo no dispositivo.
- A tela do cliente mostra a mesa no cabeçalho e não oferece troca.
- Para demonstração, dá para abrir abas diferentes com `?mesa=3` e `?mesa=4` no mesmo navegador.

## 9. Telas e fluxos

### `/login`
Formulário `loginUsuario` + `senha`. Sucesso: guarda token e usuário e redireciona por tipo — `Garçom` e `Administrador` para `/garcom`, `Cozinheiro` para `/cozinha`, `Cliente` para `/cliente`.

### `/garcom`
Lista de pedidos ativos (não `Pago`/`Cancelado`), ordenados por `dataHora` desc. Cada cartão mostra mesa, status, total e hora; pedidos sem garçom mostram "sem responsável". Ações: abrir detalhe e criar novo pedido.

### `/garcom/novo`
Seleção da mesa (campo numérico ou grade configurável) e busca de produtos disponíveis (`GET /produtos`). Ao escolher a mesa, consulta `GET /pedidos/mesa/:numeroMesa/ativo`; se já houver pedido, redireciona para `/garcom/pedidos/:id` com o aviso "mesa já possui pedido em andamento". Senão, monta o carrinho e envia `POST /pedidos` com `numeroMesa`, `idGarcom` e `itens`; `idGarcom` vem do token, ou do `select` de garçom responsável quando quem está logado é `Administrador`. Se o back responder 409, o front usa o `idPedido` para abrir o pedido existente.

### `/garcom/pedidos/:id`
Detalhe com mesa, itens e total (do back). Enquanto `Aberto`, permite adicionar, alterar quantidade e remover item. Quando `Pronto`, oferece `Entregue`. Cancelamento com confirmação, se o status permitir.

### `/cliente`
- Carrega a mesa do dispositivo e consulta `GET /pedidos/mesa/:numeroMesa/ativo`.
- **Sem pedido ativo:** mostra o cardápio e o carrinho; ao enviar, `POST /pedidos` sem `idGarcom`, com `idCliente` implícito no token.
- **Pedido ativo do próprio cliente:** mostra status, itens e total; enquanto `Aberto`, permite acrescentar, alterar quantidade e remover. A partir de `Em preparo`, a tela fica somente leitura com o aviso "o pedido já está em preparo".
- **Pedido ativo sem cliente (aberto pelo garçom):** mostra os itens da mesa e permite acrescentar; o envio usa `POST /pedidos` com a mesma `numeroMesa` e o back vincula o cliente ao pedido.
- **Pedido ativo de outro cliente:** somente leitura, com aviso de que o pedido da mesa já está em andamento.
- Sem botão de pagar, cancelar ou mudar status.

### `/cozinha`
Três blocos: `Aberto`, `Em preparo`, `Pronto`. Cartões com mesa, hora, itens e quantidades. Botões: `Iniciar preparo` (`Aberto → Em preparo`) e `Pronto` (`Em preparo → Pronto`). Polling de 5 s; sem botão de entregar nem pagar.

## 10. Estrutura de pastas proposta

```
Front-End/
  index.html
  package.json
  tsconfig.json
  vite.config.ts
  src/
    api/            # cliente HTTP e funções por recurso
    components/     # Layout, StatusBadge, ProductCard, CartItem, TablePicker
    contexts/       # AuthContext
    hooks/          # usePolling, useAuth, useMesaDoTablet
    pages/          # Login, Garcom (lista, novo, detalhe), Cliente, Cozinha
    routes/         # configuração e guarda de rotas
    types/          # tipos da API
```

## 11. Tratamento de erros

- `AppError` do back chega como `{ erro: "mensagem" }`; o front exibe a mensagem.
- 401 limpa a sessão e volta ao login.
- 403 mostra aviso de permissão (ex.: item bloqueado, pedido de outro cliente).
- Falha de rede mostra aviso com botão de tentar de novo.
- **409 na criação de pedido** (mesa já tem pedido ativo): o front lê o `idPedido` da resposta e redireciona para o detalhe com o aviso "mesa já possui pedido em andamento".
- **409 nas demais operações** (item fora da janela de edição, transição de status inválida): recarrega o pedido para refletir o estado atual e avisa o que aconteceu.
- Toda ação que altera pedido desabilita o botão enquanto a requisição está em andamento, para evitar duplo clique.

## 12. O que fica a cargo de quem implementa

- Desenho visual exato, paleta e tipografia, dentro do Bootstrap (sugestão: identidade da Chic Dog).
- Grade de mesas do garçom (quantidade e disposição) ou campo numérico.
- Nomes e divisão fina dos componentes.
- Estratégia de testes do front (mínimo sugerido: login, guarda de rota, configuração da mesa e cálculo da prévia do carrinho).
