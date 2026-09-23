const express = require("express");
const usuariosRouter = require("./routes/usuarios");

const app = express();

app.use(express.json());

app.use("/usuarios", usuariosRouter);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando com sucesso na porta ${PORT}`);
});
