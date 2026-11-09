import { NextFunction, Request, Response } from "express";
import service, { UsuarioAutenticado } from "../services/pedidoService";
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

function parseOptionalId(raw: unknown, campo: string): number | undefined {
  if (raw === undefined) return undefined;
  if (typeof raw !== "string") {
    throw new AppError(`${campo} deve ser um inteiro positivo.`, 400);
  }

  return parseId(raw);
}

function parseOptionalInt(raw: unknown, campo: string): number | undefined {
  if (raw === undefined) return undefined;
  if (typeof raw !== "string") {
    throw new AppError(`${campo} deve ser um inteiro positivo.`, 400);
  }

  const valor = Number(raw);

  if (!Number.isInteger(valor) || valor <= 0) {
    throw new AppError(`${campo} deve ser um inteiro positivo.`, 400);
  }

  return valor;
}

function parseStatus(raw: unknown): string | string[] | undefined {
  if (raw === undefined) return undefined;

  if (typeof raw === "string") return raw;

  if (Array.isArray(raw) && raw.every((item) => typeof item === "string")) {
    return raw as string[];
  }

  throw new AppError("O filtro status é inválido.", 400);
}

function parseData(raw: unknown): string | undefined {
  if (raw === undefined) return undefined;
  if (typeof raw !== "string") return undefined;

  // Formato esperado: YYYY-MM-DD
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    throw new AppError("O filtro data deve estar no formato YYYY-MM-DD.", 400);
  }

  return raw;
}

function getUsuario(req: Request): UsuarioAutenticado {
  if (!req.usuario) {
    throw new AppError("Usuário não autenticado.", 401);
  }

  return req.usuario;
}

export async function retrieveAll(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    return res.json(
      await service.findAll(
        {
          status: parseStatus(req.query.status),
          idCliente: parseOptionalId(req.query.idCliente, "idCliente"),
          idGarcom: parseOptionalId(req.query.idGarcom, "idGarcom"),
          idCozinheiro: parseOptionalId(
            req.query.idCozinheiro,
            "idCozinheiro",
          ),
          data: parseData(req.query.data),
          page: parseOptionalInt(req.query.page, "page"),
          limit: parseOptionalInt(req.query.limit, "limit"),
        },
        getUsuario(req),
      ),
    );
  } catch (error) {
    return next(error);
  }
}

export async function retrieveFila(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    return res.json(await service.findFila());
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
      await service.findById(parseId(req.params.id), getUsuario(req)),
    );
  } catch (error) {
    return next(error);
  }
}

export async function buscarAtivoDaMesa(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const numeroMesa = parseId(req.params.numeroMesa);
    const pedido = await service.buscarAtivoDaMesa(numeroMesa);
    if (!pedido) {
      return res.status(404).json({
        erro: "Não há pedido ativo para esta mesa.",
      });
    }
    return res.json(pedido);
  } catch (error) {
    return next(error);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    return res
      .status(201)
      .json(await service.create(req.body, getUsuario(req)));
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

export async function updateStatus(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    return res.json(
      await service.alterarStatus(
        parseId(req.params.id),
        req.body,
        getUsuario(req),
      ),
    );
  } catch (error) {
    return next(error);
  }
}

export async function addItem(req: Request, res: Response, next: NextFunction) {
  try {
    return res
      .status(201)
      .json(await service.adicionarItem(parseId(req.params.id), req.body));
  } catch (error) {
    return next(error);
  }
}

export async function updateItem(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    return res.json(
      await service.atualizarItem(
        parseId(req.params.id),
        parseId(req.params.idItemPedido),
        req.body,
      ),
    );
  } catch (error) {
    return next(error);
  }
}

export async function removeItem(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    return res.json(
      await service.removerItem(
        parseId(req.params.id),
        parseId(req.params.idItemPedido),
      ),
    );
  } catch (error) {
    return next(error);
  }
}

export async function cancel(req: Request, res: Response, next: NextFunction) {
  try {
    return res.json(
      await service.cancelar(parseId(req.params.id), getUsuario(req), req.body.motivo),
    );
  } catch (error) {
    return next(error);
  }
}
