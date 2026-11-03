# CC-SI-UCE4-G08-2026-2
Repositório do GRUPO 08 do Projeto UCE do 4º sem. CC/SI 2026-2. Alunos: GLAUBER MACÁRIO ALVES PEIXOTO, LUCA TELINI CROZARA, MIGUEL HENRIQUE ISAAC DE OLIVEIRA

## Front-end

O front-end está em `Front-End/` (React + Vite + TypeScript + Bootstrap).

### Como rodar

1. Suba o banco e a API:
   ```bash
   docker compose up -d postgres
   npm run db:migrate
   npm run db:seed
   npm run dev
   ```
2. Em outro terminal, rode o front:
   ```bash
   cd Front-End
   npm install
   npm run dev
   ```
3. Abra `http://localhost:5173`.

### Mesa do tablet

O tablet do cliente é configurado com a mesa em que está fixado. Use a URL
`http://localhost:5173/cliente?mesa=4` ou a tela de configuração (primeiro acesso
sem `?mesa=`). O número fica guardado no `localStorage` do navegador.

### Logins do seed

- `admin` / `admin123` (Administrador)
- `garcom` / `garcom123` (Garçom)
- `cozinheiro` / `cozinheiro123` (Cozinheiro)
- `cliente` / `cliente123` (Cliente)
