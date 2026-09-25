import { Request, Response, NextFunction } from "express";
import service from "../services/produtoService";
import { AppError } from "../errors/AppError";
import { CreateProdutoDto } from "../dto/produto/createProdutoDto";
import { UpdateProdutoDto } from "../dto/produto/updateProdutoDto";

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

export async function retrieveAll(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    return res.json(await service.findAll());
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
    const id = parseId(req.params.id);

    return res.json(await service.findById(id));
  } catch (error) {
    return next(error);
  }
}

export async function create(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const data = req.body as CreateProdutoDto;

    return res.status(201).json(await service.create(data));
  } catch (error) {
    return next(error);
  }
}

export async function update(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = parseId(req.params.id);
    const data = req.body as UpdateProdutoDto;

    return res.json(await service.update(id, data));
  } catch (error) {
    return next(error);
  }
}

export async function remove(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = parseId(req.params.id);

    await service.remove(id);

    return res.status(204).end();
  } catch (error) {
    return next(error);
  }
}