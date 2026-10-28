import { sign, verify, type SignOptions } from "jsonwebtoken";
import { env } from "../config/env";

export interface UsuarioAutenticado {
  idUsuario: number;
  tipo: string;
}

export function signToken(usuario: UsuarioAutenticado): string {
  return sign({ tipo: usuario.tipo }, env.jwtSecret, {
    subject: String(usuario.idUsuario),
    expiresIn: env.jwtExpiresIn as SignOptions["expiresIn"],
  });
}

export function verifyToken(token: string): UsuarioAutenticado {
  const decoded = verify(token, env.jwtSecret);

  if (typeof decoded === "string" || decoded.sub === undefined) {
    throw new Error("Token inválido.");
  }

  const idUsuario = Number(decoded.sub);

  if (!Number.isInteger(idUsuario) || idUsuario <= 0) {
    throw new Error("Token inválido.");
  }

  return {
    idUsuario,
    tipo: String((decoded as { tipo?: unknown }).tipo ?? ""),
  };
}
