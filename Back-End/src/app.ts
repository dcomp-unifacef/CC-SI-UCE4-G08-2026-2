import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import tipoUsuariosRouter from "./routes/tipoUsuarios";
import usuariosRouter from "./routes/usuarios";
import produtosRouter from "./routes/produtos";
import pedidosRouter from "./routes/pedidos";
import pagamentosRouter from "./routes/pagamentos";
import notificacoesRouter from "./routes/notificacoes";
import { AppError } from "./errors/AppError";

const app = express();

// Libera requisições cross-origin (ex.: front-end em outra porta).
const corsOrigin = process.env.CORS_ORIGIN || "*";
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

app.use(express.json());

app.use("/tipo-usuarios", tipoUsuariosRouter);
app.use("/usuarios", usuariosRouter);
app.use("/produtos", produtosRouter);
app.use("/pedidos", pedidosRouter);
app.use("/pagamentos", pagamentosRouter);
app.use("/notificacoes", notificacoesRouter);

app.use((_req: Request, res: Response) => {
  return res.status(404).json({ erro: "Rota não encontrada." });
});

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({ erro: error.message });
  }

  console.error(error);

  return res.status(500).json({
    erro: "Erro interno do servidor.",
  });
});

export default app;
