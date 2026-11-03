import express from "express";
import { env } from "./config/env";
import { formatarErro } from "./utils/httpError";
import pagamentosRouter from "./routes/pagamentos";
import pedidosRouter from "./routes/pedidos";
import produtosRouter from "./routes/produtos";
import tipoUsuariosRouter from "./routes/tipoUsuarios";
import usuariosRouter from "./routes/usuarios";

const app = express();

app.disable("x-powered-by");
app.use(express.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", env.corsOrigin);
  res.setHeader("Vary", "Origin");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,PATCH,DELETE,OPTIONS",
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization",
  );

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  return next();
});

app.get("/health", (_req, res) => {
  return res.json({ status: "ok" });
});

app.use("/tipo-usuarios", tipoUsuariosRouter);
app.use("/usuarios", usuariosRouter);
app.use("/produtos", produtosRouter);
app.use("/pedidos", pedidosRouter);
app.use("/pagamentos", pagamentosRouter);

app.use((_req, res) => {
  return res.status(404).json({ erro: "Rota não encontrada." });
});

app.use((error: unknown, _req: any, res: any, _next: any) => {
  const { status, body } = formatarErro(error);

  if (status >= 500) {
    console.error(error);
  }

  return res.status(status).json(body);
});

app.listen(env.port, () => {
  console.log(`Servidor rodando com sucesso na porta ${env.port}`);
});
