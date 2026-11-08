import { NextFunction, Request, Response } from "express";
import service from "../services/pagamentoService";
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

function parseOptionalId(raw: unknown, campo: string): number | undefined {
  if (raw === undefined) return undefined;
  if (typeof raw !== "string") {
    throw new AppError(`${campo} deve ser um inteiro positivo.`, 400);
  }

  return parseId(raw);
}

function parseOptionalStatus(raw: unknown): string | undefined {
  if (raw === undefined) return undefined;
  if (typeof raw !== "string") {
    throw new AppError("O filtro status é inválido.", 400);
  }

  return raw;
}

export async function retrieveAll(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    return res.json(
      await service.findAll({
        idPedido: parseOptionalId(req.query.idPedido, "idPedido"),
        status: parseOptionalStatus(req.query.status),
      }),
    );
  } catch (error) {
    return next(error);
  }
}

export async function retrieveOne(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    return res.json(await service.findById(parseId(req.params.id)));
  } catch (error) {
    return next(error);
  }
}

export async function retrieveByPedido(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    return res.json(await service.findByPedido(parseId(req.params.idPedido)));
  } catch (error) {
    return next(error);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    return res.status(201).json(await service.create(req.body));
  } catch (error) {
    return next(error);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    return res.json(await service.update(parseId(req.params.id), req.body));
  } catch (error) {
    return next(error);
  }
}
