const service = require("../services/usuarioService");

export async function retrieveAll(req: any, res: any, next: any) {
  try {
    const usuarios = await service.findAll();
    res.json(usuarios);
  } catch (error) {
    next(error);
  }
}

export async function retrieveOne(req: any, res: any, next: any) {
  try {
    const id = Number(req.params.id);
    const usuario = await service.findById(id);
    res.json(usuario);
  } catch (error) {
    next(error);
  }
}

export async function create(req: any, res: any, next: any) {
  try {
    const usuario = await service.create(req.body);
    res.status(201).json(usuario);
  } catch (error) {
    next(error);
  }
}

export async function update(req: any, res: any, next: any) {
  try {
    const id = Number(req.params.id);
    const usuario = await service.update(id, req.body);
    res.json(usuario);
  } catch (error) {
    next(error);
  }
}

export async function remove(req: any, res: any, next: any) {
  try {
    const id = Number(req.params.id);
    await service.remove(id);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  retrieveAll,
  retrieveOne,
  create,
  update,
  remove,
};
