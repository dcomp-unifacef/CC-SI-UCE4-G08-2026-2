import { Request, Response, NextFunction } from "express";
import service from "../services/usuarioService";
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

export async function retrieveAll(_req: Request, res: Response, next: NextFunction) {
  try {
    return res.json(await service.findAll());
  } catch (error) {
    return next(error);
  }
}

export async function retrieveOne(req: Request, res: Response, next: NextFunction) {
  try {
    return res.json(await service.findById(parseId(req.params.id)));
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

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await service.remove(parseId(req.params.id));
    return res.status(204).end();
  } catch (error) {
    return next(error);
  }
}
