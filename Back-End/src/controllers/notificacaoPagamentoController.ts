// Tipos de requisição, resposta e continuação do Express para os handlers HTTP.
import { NextFunction, Request, Response } from "express";
// Service executa as regras de notificação e acessa o repository/Prisma.
import service from "../services/notificacaoPagamentoService";
// Erros de entrada devem chegar ao middleware de erros em app.ts.
import { AppError } from "../errors/AppError";

// Converte o ID da URL para inteiro positivo antes da operação de domínio.
function parseId(raw: unknown): number {
  if (typeof raw !== "string") {
    throw new AppError("O id deve ser um inteiro positivo.", 400);
  }

  const id = Number(raw);

  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError("O id deve ser um inteiro positivo.", 400);
  }

  return id;
}

// Recebe solicitação de pagamento, persiste via service e devolve o registro criado.
export async function criar(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const notificacao = await service.criarNotificacao(req.body);
    return res.status(201).json(notificacao);
  } catch (error) {
    return next(error);
  }
}

// Lista notificações que a equipe ainda precisa atender.
export async function listarPendentes(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    return res.json(await service.listarPendentes());
  } catch (error) {
    return next(error);
  }
}

// Retorna o total pendente de leitura para atualizar o indicador do front-end.
export async function contarNaoLidas(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    return res.json({ naoLidas: await service.contarNaoLidas() });
  } catch (error) {
    return next(error);
  }
}

// Registra atendimento da notificação identificada.
export async function marcarComoAtendida(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const notificacao = await service.marcarComoAtendida(
      parseId(req.params.id),
    );
    return res.json(notificacao);
  } catch (error) {
    return next(error);
  }
}

// Marca como lida a notificação identificada para remover do contador.
export async function marcarComoLida(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const notificacao = await service.marcarComoLida(parseId(req.params.id));
    return res.json(notificacao);
  } catch (error) {
    return next(error);
  }
}
