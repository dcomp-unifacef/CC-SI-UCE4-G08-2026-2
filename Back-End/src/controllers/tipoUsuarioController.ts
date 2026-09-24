import service from "../services/tipoUsuarioService";
import { AppError } from "../errors/AppError";

function parseId(raw: string): number {
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) throw new AppError("O id deve ser um inteiro positivo.", 400);
  return id;
}

export async function retrieveAll(_req: any, res: any, next: any) {
  try { res.json(await service.findAll()); } catch (error) { next(error); }
}

export async function retrieveOne(req: any, res: any, next: any) {
  try { res.json(await service.findById(parseId(req.params.id))); } catch (error) { next(error); }
}

export async function create(req: any, res: any, next: any) {
  try { res.status(201).json(await service.create(req.body?.nome)); } catch (error) { next(error); }
}

export async function update(req: any, res: any, next: any) {
  try { res.json(await service.update(parseId(req.params.id), req.body?.nome)); } catch (error) { next(error); }
}

export async function remove(req: any, res: any, next: any) {
  try {
    await service.remove(parseId(req.params.id));
    res.status(204).end();
  } catch (error) { next(error); }
}
