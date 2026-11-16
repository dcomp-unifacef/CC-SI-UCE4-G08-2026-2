// Tipos Express para adaptar a requisição HTTP às operações de serviço.
import { NextFunction, Request, Response } from "express";
// Serviço concentra regras de pedido e expõe o tipo do usuário autenticado.
import service, { UsuarioAutenticado } from "../services/pedidoService";
// Erros de parâmetros/campos inválidos seguem o formato HTTP comum da aplicação.
import { AppError } from "../errors/AppError";

// Converte o parâmetro textual de rota em ID positivo antes de chamar o service/repository.
function parseId(raw: unknown): number {
  if (typeof raw !== "string") {
    throw new AppError("O id deve ser um inteiro positivo.", 400);
  }

  // Valida novamente o valor convertido para rejeitar decimais, zero e negativos.
  const id = Number(raw);

  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError("O id deve ser um inteiro positivo.", 400);
  }

  return id;
}

// Lê filtro de ID opcional sem confundir ausência com valor inválido.
function parseOptionalId(raw: unknown, campo: string): number | undefined {
  if (raw === undefined) return undefined;
  if (typeof raw !== "string") {
    throw new AppError(`${campo} deve ser um inteiro positivo.`, 400);
  }

  return parseId(raw);
}

// Valida filtros inteiros positivos da query (mesa, página e tamanho de página).
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

// Admite status único ou lista de strings, formato que o repository usa como filtro.
function parseStatus(raw: unknown): string | string[] | undefined {
  if (raw === undefined) return undefined;

  if (typeof raw === "string") return raw;

  if (Array.isArray(raw) && raw.every((item) => typeof item === "string")) {
    return raw as string[];
  }

  throw new AppError("O filtro status é inválido.", 400);
}

// Verifica formato ISO de data antes de montar o filtro que o repository aplica ao Prisma.
function parseData(raw: unknown): string | undefined {
  if (raw === undefined) return undefined;
  if (typeof raw !== "string") return undefined;

  // Formato esperado: YYYY-MM-DD
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    throw new AppError("O filtro data deve estar no formato YYYY-MM-DD.", 400);
  }

  return raw;
}

// Recupera a identidade preenchida pelo middleware de autenticação tipado em express.d.ts.
function getUsuario(req: Request): UsuarioAutenticado {
  if (!req.usuario) {
    throw new AppError("Usuário não autenticado.", 401);
  }

  return req.usuario;
}

// Lista pedidos com query validada; o service aplica visibilidade e serialização.
export async function retrieveAll(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    // Traduz cada filtro individual e passa o usuário para restringir consultas de cliente.
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
          numeroMesa: parseOptionalInt(
            req.query.numeroMesa,
            "numeroMesa",
          ),
          data: parseData(req.query.data),
          page: parseOptionalInt(req.query.page, "page"),
          limit: parseOptionalInt(req.query.limit, "limit"),
        },
        getUsuario(req),
      ),
    );
  // Encaminha erros de validação, domínio ou banco ao middleware global.
  } catch (error) {
    return next(error);
  }
}

// Devolve a fila operacional definida pelo service para equipe de cozinha/atendimento.
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

// Recupera um pedido específico após validar seu ID e sua permissão de consulta.
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

// Busca o pedido ativo por mesa e responde 404 explicitamente quando não há registro.
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

// Cria pedido a partir do corpo e da identidade autenticada; retorna HTTP 201.
export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    return res
      .status(201)
      .json(await service.create(req.body, getUsuario(req)));
  } catch (error) {
    return next(error);
  }
}

// Atualiza os campos do pedido conforme validação e estado permitido no service.
export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    return res.json(await service.update(parseId(req.params.id), req.body));
  } catch (error) {
    return next(error);
  }
}

// Muda o estado; o service valida transições e permissões do perfil.
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

// Acrescenta item à comanda pendente e sinaliza criação com HTTP 201.
export async function addItem(req: Request, res: Response, next: NextFunction) {
  try {
    return res
      .status(201)
      .json(await service.adicionarItem(parseId(req.params.id), req.body));
  } catch (error) {
    return next(error);
  }
}

// Atualiza item indicado tanto pelo pedido quanto pelo identificador da linha.
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

// Remove item da comanda, deixando ao service a regra de não esvaziar o pedido.
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

// Cancela o pedido com identidade autenticada e motivo recebido no corpo.
export async function cancel(req: Request, res: Response, next: NextFunction) {
  try {
    return res.json(
      await service.cancelar(parseId(req.params.id), getUsuario(req), req.body.motivo),
    );
  } catch (error) {
    return next(error);
  }
}
