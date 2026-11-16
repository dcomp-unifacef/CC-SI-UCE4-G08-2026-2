// Tipos do Express implementam o contrato de middleware HTTP.
import { NextFunction, Request, Response } from "express";
// verify valida assinatura/expiração dos JWT apresentados pelo cliente.
import { verify } from "jsonwebtoken";
// Busca o segredo central de configuração, também usado na emissão pelo authService.
import { getJwtSecret } from "../config/auth";
// AppError torna falhas de autenticação/autorização respostas 401 ou 403.
import { AppError } from "../errors/AppError";
// Regras de perfis padronizam a comparação com os valores armazenados e declarados nas rotas.
import { ehAdministrador, normalizarPerfil } from "../domain/perfis";

// Forma mínima do payload que authService grava no token e que este middleware consome.
interface TokenPayload {
  sub?: string;
  tipo?: string;
}

// Valida o cabeçalho Bearer, verifica JWT e anexa a identidade à Request do Express.
export function autenticar(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const authorization = req.headers.authorization;

  // Sem cabeçalho não há credencial para verificar.
  if (!authorization) {
    return next(new AppError("Token de autenticação não informado.", 401));
  }

  // Rejeita esquemas diferentes de Bearer e cabeçalhos sem token.
  const [esquema, token] = authorization.split(" ");

  if (esquema !== "Bearer" || !token) {
    return next(
      new AppError("Formato do token inválido. Use: Bearer <token>.", 401),
    );
  }

  // Verifica assinatura/expiração, valida chave numérica e constrói o contexto do usuário.
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
    // Qualquer falha de verificação resulta em resposta não autenticada sem vazar detalhes.
  } catch {
    return next(new AppError("Token inválido ou expirado.", 401));
  }
}

// Cria middleware de autorização para os perfis informados pela definição de cada rota.
export function autorizar(...perfisPermitidos: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    // Defesa adicional caso a rota seja chamada sem passar pelo middleware autenticar.
    if (!req.usuario) {
      return next(new AppError("Usuário não autenticado.", 401));
    }

    // Administrador é exceção global às listas explícitas de perfis.
    if (ehAdministrador(req.usuario.tipo)) {
      return next();
    }

    // Normaliza valores e aceita acesso se qualquer perfil permitido corresponder ao token.
    const permitido = perfisPermitidos.some(
      (perfil) =>
        normalizarPerfil(perfil) === normalizarPerfil(req.usuario?.tipo),
    );

    // Bloqueia o usuário autenticado quando seu papel não está autorizado para a rota.
    if (!permitido) {
      return next(
        new AppError("Acesso negado para o perfil do usuário autenticado.", 403),
      );
    }

    // Continua a cadeia Express somente após confirmar autorização.
    return next();
  };
}
