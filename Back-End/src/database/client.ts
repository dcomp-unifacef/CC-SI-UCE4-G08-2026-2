import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { env } from "../config/env";

// Prisma 7 exige um driver adapter; este projeto usa PostgreSQL.
const adapter = new PrismaPg(env.databaseUrl);

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
prisma.$on("query", (event) => {
  console.log("---");
  console.log("Query: " + event.query);
  console.log("Params: " + event.params);
  console.log("Duration: " + event.duration + "ms");
});
