import { Request, Response, NextFunction } from "express";
// Tipos HTTP do Express usados para receber credenciais, enviar token e encaminhar erros.
// Serviço compara a senha com o hash e emite token JWT após login válido.
import { executeLogin } from "../services/authService";
// Erros de validação são tratados pelo middleware global com status apropriado.
import { AppError } from "../errors/AppError";

// Endpoint público de login: valida o corpo e devolve o resultado produzido pelo authService.
export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    // Aceita corpo ausente como objeto vazio para que a validação gere erro de campo obrigatório.
    const { loginUsuario, senha } = req.body ?? {};

    // Impede autenticação com identificador ausente, não textual ou composto só de espaços.
    if (typeof loginUsuario !== "string" || loginUsuario.trim().length === 0) {
      throw new AppError("O campo loginUsuario é obrigatório.", 400);
    }
    // A senha é obrigatória, mas não sofre trim para preservar o valor cadastrado.
    if (typeof senha !== "string" || senha.length === 0) {
      throw new AppError("O campo senha é obrigatório.", 400);
    }

    // Normaliza apenas o login e delega autenticação, assinatura JWT e resposta ao service.
    const resultado = await executeLogin({
      loginUsuario: loginUsuario.trim(),
      senha,
    });

    return res.status(200).json(resultado);
    // Qualquer falha segue para o tratamento centralizado do Express.
  } catch (error) {
    return next(error);
  }
}
