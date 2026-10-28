import { Request, Response, NextFunction } from "express";
import service from "../services/pagamentoService";
import type { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { parseId } from "../utils/validation";

function obterUsuario(req: Request) {
  return (req as AuthenticatedRequest).usuarioAutenticado;
}

export async function retrieveAll(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    return res.json(await service.findAll(obterUsuario(req)));
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
    return res.json(
      await service.findById(parseId(req.params.id), obterUsuario(req)),
    );
  } catch (error) {
    return next(error);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    return res
      .status(201)
      .json(await service.create(req.body, obterUsuario(req)));
  } catch (error) {
    return next(error);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    return res.json(
      await service.update(
        parseId(req.params.id),
        req.body,
        obterUsuario(req),
      ),
    );
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
