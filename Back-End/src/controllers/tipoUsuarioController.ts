import service from "../services/tipoUsuarioService";
import { parseId } from "../utils/validation";

export async function retrieveAll(_req: any, res: any, next: any) {
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
    return res.status(201).json(await service.create(req.body?.nome));
  } catch (error) {
    return next(error);
  }
}

export async function update(req: any, res: any, next: any) {
  try {
    return res.json(
      await service.update(parseId(req.params.id), req.body?.nome),
    );
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
