import "dotenv/config";
// Inicializa variáveis de ambiente para configuração de CORS e conexão.
// Express compõe a API; os tipos descrevem os parâmetros dos middlewares HTTP.
import express, { NextFunction, Request, Response } from "express";
// Cada import de rota conecta o prefixo de recurso aos respectivos controllers e serviços.
import tipoUsuariosRouter from "./routes/tipoUsuarios";
import usuariosRouter from "./routes/usuarios";
import produtosRouter from "./routes/produtos";
import pedidosRouter from "./routes/pedidos";
import pagamentosRouter from "./routes/pagamentos";
import notificacoesRouter from "./routes/notificacoes";
// Erros esperados da aplicação são convertidos em respostas HTTP com status conhecido.
import { AppError } from "./errors/AppError";

// Monta a instância Express que será iniciada por server.ts e também pode ser testada isoladamente.
const app = express();

// Libera requisições cross-origin (ex.: front-end em outra porta).
const corsOrigin = process.env.CORS_ORIGIN || "*";
// Middleware CORS permite chamadas do cliente web e trata preflight antes das rotas.
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.header("Access-Control-Allow-Origin", corsOrigin);
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization",
  );
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  );

  if (_req.method === "OPTIONS") {
    return res.status(204).end();
  }

  return next();
});

// Decodifica corpos JSON para que controllers e services possam validar req.body.
app.use(express.json());

// Registra os routers sob seus caminhos públicos; cada router aplica suas próprias regras de acesso.
app.use("/tipo-usuarios", tipoUsuariosRouter);
app.use("/usuarios", usuariosRouter);
app.use("/produtos", produtosRouter);
app.use("/pedidos", pedidosRouter);
app.use("/pagamentos", pagamentosRouter);
app.use("/notificacoes", notificacoesRouter);

// Responde a caminhos não registrados, antes do middleware de erros.
app.use((_req: Request, res: Response) => {
  return res.status(404).json({ erro: "Rota não encontrada." });
});

// Traduz AppError para status/mensagem controlados e oculta detalhes de falhas inesperadas.
app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({ erro: error.message });
  }

  console.error(error);

  return res.status(500).json({
    erro: "Erro interno do servidor.",
  });
});

// Exporta a aplicação configurada para inicialização e testes.
export default app;
