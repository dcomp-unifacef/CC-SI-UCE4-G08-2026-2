// Centraliza a leitura da configuração JWT usada pela autenticação e pelo login.
// Os valores vêm do ambiente; não há segredo padrão para evitar tokens inseguros.
// Importa somente o tipo das opções do jsonwebtoken para tipar o prazo do token.
import type { SignOptions } from "jsonwebtoken";

// Fornece o segredo obrigatório com que o authService assina e o middleware valida tokens.
export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("A variável JWT_SECRET não foi definida no arquivo .env");
  }

  return secret;
}

// Retorna o prazo configurado ou um dia; authService usa esse valor ao emitir o JWT.
export function getJwtExpiresIn(): SignOptions["expiresIn"] {
  return (process.env.JWT_EXPIRES_IN ?? "1d") as SignOptions["expiresIn"];
}
