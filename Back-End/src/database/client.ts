import "dotenv/config";
// Carrega variáveis de ambiente antes da criação da conexão com o banco.
// Adapta o Prisma ao driver PostgreSQL e instancia o cliente compartilhado pelos repositórios.
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

// Obtém a URL que identifica o banco PostgreSQL a ser acessado pela aplicação.
const connectionString = process.env.DATABASE_URL;
// Interrompe a inicialização cedo se a aplicação não tiver conexão configurada.
if (!connectionString) {
  throw new Error("A variável DATABASE_URL não foi definida no arquivo .env");
}

// Prisma 7 exige um driver adapter; este projeto usa PostgreSQL.
const adapter = new PrismaPg(connectionString);

// Cria a instância única que os repositórios usam para consultar e persistir dados.
export const prisma = new PrismaClient({
  adapter,
  log: [
    { emit: "event", level: "query" },
    { emit: "stdout", level: "error" },
    { emit: "stdout", level: "info" },
    { emit: "stdout", level: "warn" },
  ],
});

// Exibe no terminal as consultas geradas pelo Prisma durante o desenvolvimento.
// A inscrição no evento query permite observar SQL, parâmetros e duração sem alterar os resultados.
prisma.$on("query", (event) => {
  console.log("---");
  console.log("Query: " + event.query);
  console.log("Params: " + event.params);
  console.log("Duration: " + event.duration + "ms");
});
