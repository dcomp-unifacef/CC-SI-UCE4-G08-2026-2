import { Request, Response, NextFunction } from "express";
import { executeLogin } from "../services/authService";
import { AppError } from "../errors/AppError";

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { loginUsuario, senha } = req.body ?? {};

    if (typeof loginUsuario !== "string" || loginUsuario.trim().length === 0) {
      throw new AppError("O campo loginUsuario é obrigatório.", 400);
    }
    if (typeof senha !== "string" || senha.length === 0) {
      throw new AppError("O campo senha é obrigatório.", 400);
    }

    const resultado = await executeLogin({
      loginUsuario: loginUsuario.trim(),
      senha,
    });

    return res.status(200).json(resultado);
  } catch (error) {
    return next(error);
  }
}
