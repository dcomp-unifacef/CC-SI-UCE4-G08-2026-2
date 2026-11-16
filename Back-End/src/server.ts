import "dotenv/config";
// Carrega a configuração do ambiente antes de iniciar o servidor HTTP.
// Importa a aplicação configurada com middlewares, tratamento de erros e rotas.
import app from "./app";

// Usa a porta do ambiente ou a porta padrão de desenvolvimento.
const PORT = Number(process.env.PORT) || 3000;

// Abre o servidor e informa a porta ativa no terminal.
app.listen(PORT, () => {
  console.log(`Servidor rodando com sucesso na porta ${PORT}`);
});
