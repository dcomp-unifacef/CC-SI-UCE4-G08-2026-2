import "dotenv/config";

function requireEnv(name: string): string {
  const value = process.env[name];

  if (value === undefined || value.trim() === "") {
    throw new Error(`A variável de ambiente ${name} não foi definida.`);
  }

  return value;
}

const port = Number(process.env.PORT ?? 3000);

if (!Number.isInteger(port) || port <= 0) {
  throw new Error("A variável de ambiente PORT deve ser um inteiro positivo.");
}

export const env = {
  port,
  databaseUrl: requireEnv("DATABASE_URL"),
  jwtSecret: requireEnv("JWT_SECRET"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "1d",
  adminRole: process.env.ADMIN_ROLE ?? "Administrador",
  corsOrigin: process.env.CORS_ORIGIN ?? "*",
} as const;
