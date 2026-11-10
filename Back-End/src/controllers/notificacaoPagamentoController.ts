import { NextFunction, Request, Response } from "express";
import service from "../services/notificacaoPagamentoService";
import { AppError } from "../errors/AppError";

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
