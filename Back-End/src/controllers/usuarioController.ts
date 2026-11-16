import { Request, Response, NextFunction } from "express";
// Tipos Express definem os argumentos dos handlers de usuário.
// Serviço valida cadastro/edição e coordena hash de senha e repository.
import service from "../services/usuarioService";
// Erro HTTP para identificadores inválidos.
import { AppError } from "../errors/AppError";

// Valida o parâmetro textual e o converte em chave numérica positiva.
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

// Lista usuários retornados pelo service, que seleciona somente dados públicos.
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

// Busca usuário pelo ID validado e deixa ao service tratar ausência.
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

// Cria usuário e retorna o registro público criado com status 201.
export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    return res.status(201).json(await service.create(req.body));
  } catch (error) {
    return next(error);
  }
}

// Atualiza usuário por ID e entrega o corpo ao fluxo de validação do service.
export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    return res.json(await service.update(parseId(req.params.id), req.body));
  } catch (error) {
    return next(error);
  }
}

// Desativa o usuário e responde sem corpo; o service preserva vínculos históricos.
export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await service.remove(parseId(req.params.id));
    return res.status(204).end();
  } catch (error) {
    return next(error);
  }
}
