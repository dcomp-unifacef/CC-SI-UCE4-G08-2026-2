import service from "../services/tipoUsuarioService";
import { AppError } from "../errors/AppError";
import { CreateTipoUsuarioDto } from "../dto/tipoUsuario/createTipoUsuarioDto";
import { UpdateTipoUsuarioDto } from "../dto/tipoUsuario/updateTipoUsuarioDto";

function parseId(raw: string): number {
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError("O id deve ser um inteiro positivo.", 400);
  }
  return id;
}

export async function retrieveAll(req: any, res: any, next: any) {
  try {
    return res.json(await service.findAll());
  } catch (error) {
    return next(error);
  }
}

export async function retrieveOne(req: any, res: any, next: any) {
  try {
    return res.json(await service.findById(parseId(req.params.id)));
  } catch (error) {
    return next(error);
  }
}

export async function create(req: any, res: any, next: any) {
  try {
    const data = req.body as CreateTipoUsuarioDto;
    return res.status(201).json(await service.create(data));
  } catch (error) {
    return next(error);
  }
}

export async function update(req: any, res: any, next: any) {
  try {
    const data = req.body as UpdateTipoUsuarioDto;
    return res.json(await service.update(parseId(req.params.id), data));
  } catch (error) {
    return next(error);
  }
}

export async function remove(req: any, res: any, next: any) {
  try {
    await service.remove(parseId(req.params.id));
    return res.status(204).end();
  } catch (error) {
    return next(error);
  }
}
