// Tipos HTTP usados pelos handlers de catálogo.
import { Request, Response, NextFunction } from "express";
// ProdutoService valida dados, acessa repository e serializa valores monetários.
import service from "../services/produtoService";
// AppError representa parâmetros inválidos com status adequado.
import { AppError } from "../errors/AppError";
// Contratos estáticos dos corpos de criação e atualização.
import { CreateProdutoDto } from "../dto/produto/createProdutoDto";
import { UpdateProdutoDto } from "../dto/produto/updateProdutoDto";

// Valida o identificador textual usado nas URLs do recurso.
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

// Lista catálogo por meio do service e retorna JSON ao cliente.
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

// Converte ID e consulta item individual, propagando erros ao Express.
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

// Encaminha DTO de criação validado em tipo ao service e responde com status 201.
export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const data = req.body as CreateProdutoDto;

    return res.status(201).json(await service.create(data));
  } catch (error) {
    return next(error);
  }
}

// Atualiza apenas campos aceitos pelo DTO; regras de conteúdo pertencem ao service.
export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseId(req.params.id);
    const data = req.body as UpdateProdutoDto;

    return res.json(await service.update(id, data));
  } catch (error) {
    return next(error);
  }
}

// Exclui produto pelo ID e usa resposta sem corpo em caso de sucesso.
export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseId(req.params.id);

    await service.remove(id);

    return res.status(204).end();
  } catch (error) {
    return next(error);
  }
}
