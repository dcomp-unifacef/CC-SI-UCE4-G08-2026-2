const express = require("express");

const tipoUsuariosRouter = require("./routes/tipoUsuarios");
const usuariosRouter = require("./routes/usuarios").default;
const produtosRouter = require("./routes/produtos").default;

const { AppError } = require("./errors/AppError");

const app = express();

app.use(express.json());

app.use("/tipo-usuarios", tipoUsuariosRouter);
app.use("/usuarios", usuariosRouter);
app.use("/produtos", produtosRouter);

app.use((error: any, _req: any, res: any, _next: any) => {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({ erro: error.message });
  }

  console.error(error);

  return res.status(500).json({
    erro: "Erro interno do servidor.",
  });
});

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando com sucesso na porta ${PORT}`);
});