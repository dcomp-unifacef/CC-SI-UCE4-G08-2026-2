import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env";
import { AppError } from "../errors/AppError";
import { verifyToken, type UsuarioAutenticado } from "../utils/jwt";
import {
  ROLE_GARCOM,
  isAdminRole,
  normalizeRole,
} from "../utils/roles";

export interface AuthenticatedRequest extends Request {
  usuarioAutenticado?: UsuarioAutenticado;
}

function extrairToken(req: Request): string | null {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return null;
  }

  return header.slice("Bearer ".length).trim();
}

export function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const token = extrairToken(req);

  if (!token) {
    next(new AppError("Token de autenticação não informado.", 401));
    return;
  }

  try {
    (req as AuthenticatedRequest).usuarioAutenticado = verifyToken(token);
    next();
  } catch {
    next(new AppError("Token inválido ou expirado.", 401));
  }
}

export function optionalAuthenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  if (!req.headers.authorization) {
    next();
    return;
  }

  authenticate(req, _res, next);
}

export function authorize(...tiposPermitidos: string[]) {
  const permitidos = tiposPermitidos.map(normalizeRole);

  return (req: Request, _res: Response, next: NextFunction): void => {
    const usuario = (req as AuthenticatedRequest).usuarioAutenticado;

    if (!usuario || !permitidos.includes(normalizeRole(usuario.tipo))) {
      next(new AppError("Acesso negado para este perfil.", 403));
      return;
    }

    next();
  };
}

export const authorizeAdmin = authorize(env.adminRole);
export const authorizeStaff = authorize(env.adminRole, ROLE_GARCOM);

export function authorizeSelfOrAdmin(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const usuario = (req as AuthenticatedRequest).usuarioAutenticado;

  if (!usuario) {
    next(new AppError("Token de autenticação não informado.", 401));
    return;
  }

  const ehOMesmoUsuario = Number(req.params.id) === usuario.idUsuario;

  if (!isAdminRole(usuario.tipo) && !ehOMesmoUsuario) {
    next(new AppError("Você só pode acessar o próprio usuário.", 403));
    return;
  }

  next();
}
