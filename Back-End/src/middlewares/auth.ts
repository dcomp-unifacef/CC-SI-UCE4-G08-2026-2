import { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";
import { getJwtSecret } from "../config/auth";
import { AppError } from "../errors/AppError";
import { ehAdministrador, normalizarPerfil } from "../domain/perfis";

interface TokenPayload {
  sub?: string;
  tipo?: string;
}

export function autenticar(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const authorization = req.headers.authorization;

  if (!authorization) {
    return next(new AppError("Token de autenticação não informado.", 401));
  }

  const [esquema, token] = authorization.split(" ");

  if (esquema !== "Bearer" || !token) {
    return next(
      new AppError("Formato do token inválido. Use: Bearer <token>.", 401),
    );
  }

  try {
    const payload = verify(token, getJwtSecret()) as TokenPayload;
    const id = Number(payload.sub);

    if (!Number.isInteger(id) || id <= 0) {
      return next(new AppError("Token inválido ou expirado.", 401));
    }

    req.usuario = {
      id,
      tipo: payload.tipo ?? "",
    };

    return next();
  } catch {
    return next(new AppError("Token inválido ou expirado.", 401));
  }
}

export function autorizar(...perfisPermitidos: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.usuario) {
      return next(new AppError("Usuário não autenticado.", 401));
    }

    if (ehAdministrador(req.usuario.tipo)) {
      return next();
    }

    const permitido = perfisPermitidos.some(
      (perfil) =>
        normalizarPerfil(perfil) === normalizarPerfil(req.usuario?.tipo),
    );

    if (!permitido) {
      return next(
        new AppError("Acesso negado para o perfil do usuário autenticado.", 403),
      );
    }

    return next();
  };
}
