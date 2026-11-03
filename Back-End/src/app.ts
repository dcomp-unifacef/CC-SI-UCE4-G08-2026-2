import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import tipoUsuariosRouter from "./routes/tipoUsuarios";
import usuariosRouter from "./routes/usuarios";
import produtosRouter from "./routes/produtos";
import pedidosRouter from "./routes/pedidos";
import pagamentosRouter from "./routes/pagamentos";
import { AppError } from "./errors/AppError";

const app = express();

app.use(express.json());

app.use("/tipo-usuarios", tipoUsuariosRouter);
app.use("/usuarios", usuariosRouter);
app.use("/produtos", produtosRouter);
app.use("/pedidos", pedidosRouter);
app.use("/pagamentos", pagamentosRouter);

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
