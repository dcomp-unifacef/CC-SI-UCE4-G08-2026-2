# Front-end — Chic Dog

Aplicação web de pedidos do Chic Dog, desenvolvida com React, TypeScript e Vite. As instruções de configuração do banco, do back-end, dos usuários de demonstração e dos endpoints estão no [README principal](../README.md).

## Pré-requisitos

- Node.js 20.19 ou superior e npm.
- Back-end em execução em `http://localhost:3333` para acessar os dados da aplicação.

## Instalação e execução

Na pasta `Front-End/`, instale as dependências e inicie o servidor de desenvolvimento:

```bash
npm install
npm run dev
```

Abra `http://localhost:5173`. Durante o desenvolvimento, o proxy do Vite encaminha requisições com prefixo `/api` ao back-end.

Para apontar o cliente a outra URL, configure `VITE_API_URL` no ambiente do Vite. Em produção, essa variável deve conter a URL base do back-end.

## Scripts disponíveis

Execute os comandos abaixo na pasta `Front-End/`:

| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia o servidor de desenvolvimento Vite |
| `npm run build` | Executa a verificação TypeScript e gera a versão de produção |
| `npm run preview` | Serve localmente a versão de produção gerada |
| `npm run lint` | Analisa o código com Oxlint |
| `npm test` | Executa os testes do front-end uma vez |

## Acesso do tablet do cliente

Abra uma URL como `http://localhost:5173/cliente?mesa=4` para configurar a mesa. No primeiro acesso, também é possível configurar a mesa pela tela correspondente. O número é armazenado no `localStorage` do navegador.
