import type { SignOptions } from "jsonwebtoken";

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("A variável JWT_SECRET não foi definida no arquivo .env");
  }

  return secret;
}

export function getJwtExpiresIn(): SignOptions["expiresIn"] {
  return (process.env.JWT_EXPIRES_IN ?? "1d") as SignOptions["expiresIn"];
}
