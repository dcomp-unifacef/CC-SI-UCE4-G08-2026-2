// Tipos HTTP usados nas rotas para receber filtros e enviar resultados.
import { NextFunction, Request, Response } from "express";
// Serviço implementa validações de negócio e acesso ao repository de pagamentos.
import service from "../services/pagamentoService";
// Erros de parsing de entrada são entregues ao tratamento central do app.
import { AppError } from "../errors/AppError";

// Valida ID textual da rota antes de repassá-lo à camada de serviço.
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

// Trata IDs de query opcionais, preservando a ausência como filtro não aplicado.
function parseOptionalId(raw: unknown, campo: string): number | undefined {
  if (raw === undefined) return undefined;
  if (typeof raw !== "string") {
    throw new AppError(`${campo} deve ser um inteiro positivo.`, 400);
  }

  return parseId(raw);
}

// Mantém filtro de status como texto único; valores de domínio são verificados pelo service.
function parseOptionalStatus(raw: unknown): string | undefined {
  if (raw === undefined) return undefined;
  if (typeof raw !== "string") {
    throw new AppError("O filtro status é inválido.", 400);
  }

  return raw;
}

// Lista pagamentos com filtros validados e representação serializada pelo service.
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

// Consulta pagamento pelo identificador primário.
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

// Consulta o pagamento associado ao pedido apontado na URL.
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

// Cria pagamento e retorna 201 após validações e persistência pelo service.
export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    return res.status(201).json(await service.create(req.body));
  } catch (error) {
    return next(error);
  }
}

// Atualiza campos permitidos de um pagamento já cadastrado.
export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    return res.json(await service.update(parseId(req.params.id), req.body));
  } catch (error) {
    return next(error);
  }
}
