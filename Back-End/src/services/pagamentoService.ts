import repository, {
  DadosPagamento,
  FiltrosPagamento,
} from "../repositories/pagamentoRepository";
import { AppError } from "../errors/AppError";
import {
  round2,
  STATUS_PAGAMENTO,
  statusPagamentoValido,
} from "../domain/pedidoRules";
import { serializePagamento } from "../utils/serializers";

function getObjectData(data: unknown): Record<string, unknown> {
  if (data === null || typeof data !== "object" || Array.isArray(data)) {
    throw new AppError("O corpo da requisição deve ser um objeto JSON.", 400);
  }

  return data as Record<string, unknown>;
}

function hasOwn(data: Record<string, unknown>, campo: string): boolean {
  return Object.prototype.hasOwnProperty.call(data, campo);
}

function validarId(valor: unknown, campo: string): number {
  if (typeof valor !== "number" || !Number.isInteger(valor) || valor <= 0) {
    throw new AppError(`${campo} deve ser um inteiro positivo.`, 400);
  }

  return valor;
}

function validarFormaPagamento(valor: unknown): string {
  if (typeof valor !== "string" || valor.trim().length === 0) {
    throw new AppError("O campo formaPagamento é obrigatório.", 400);
  }

  const texto = valor.trim();

  if (texto.length > 80) {
    throw new AppError(
      "O campo formaPagamento deve ter no máximo 80 caracteres.",
      400,
    );
  }

  return texto;
}

function validarValor(valor: unknown): number {
  if (typeof valor !== "number" || !Number.isFinite(valor) || valor <= 0) {
    throw new AppError("O valor do pagamento deve ser um número maior que zero.", 400);
  }

  return round2(valor);
}

function throwDatabaseError(error: any): never {
  if (error?.code === "P2002") {
    throw new AppError("Este pedido já possui um pagamento registrado.", 409);
  }

  throw error;
}

async function findAll(filtros: FiltrosPagamento) {
  const pagamentos = await repository.findAll(filtros);
  return pagamentos.map(serializePagamento);
}

async function findById(id: number) {
  const pagamento = await repository.findById(id);

  if (!pagamento) {
    throw new AppError("Pagamento não encontrado.", 404);
  }

  return serializePagamento(pagamento);
}

async function findByPedido(idPedido: number) {
  const pagamento = await repository.findByPedido(idPedido);

  if (!pagamento) {
    throw new AppError("Pagamento não encontrado para este pedido.", 404);
  }

  return serializePagamento(pagamento);
}

async function create(data: unknown) {
  const input = getObjectData(data);
  const idPedido = validarId(input.idPedido, "idPedido");
  const formaPagamento = validarFormaPagamento(input.formaPagamento);
  const status =
    input.status === undefined
      ? "Pago"
      : (() => {
          if (!statusPagamentoValido(input.status)) {
            throw new AppError(
              `Status inválido. Valores permitidos: ${STATUS_PAGAMENTO.join(", ")}.`,
              400,
            );
          }
          return input.status;
        })();

  const pedido = await repository.findPedidoById(idPedido);

  if (!pedido) {
    throw new AppError("Pedido não encontrado.", 404);
  }

  if (pedido.statusPedido === "Cancelado") {
    throw new AppError(
      "Não é possível registrar pagamento de um pedido cancelado.",
      409,
    );
  }

  const pagamentoExistente = await repository.findByPedido(idPedido);

  if (pagamentoExistente) {
    throw new AppError("Este pedido já possui um pagamento registrado.", 409);
  }

  const valorEsperado = Number(pedido.valorTotal);

  if (valorEsperado <= 0) {
    throw new AppError(
      "O pedido não possui valor total para ser pago.",
      409,
    );
  }

  if (input.valor !== undefined && validarValor(input.valor) !== valorEsperado) {
    throw new AppError(
      "O valor do pagamento deve ser igual ao valor total do pedido.",
      400,
    );
  }

  try {
    const pagamento = await repository.create({
      valor: valorEsperado,
      formaPagamento,
      status,
      idPedido,
    });

    return serializePagamento(pagamento);
  } catch (error) {
    return throwDatabaseError(error);
  }
}

async function update(id: number, data: unknown) {
  const pagamento = await repository.findById(id);

  if (!pagamento) {
    throw new AppError("Pagamento não encontrado.", 404);
  }

  const input = getObjectData(data);
  const dados: DadosPagamento = {};

  if (hasOwn(input, "formaPagamento")) {
    dados.formaPagamento = validarFormaPagamento(input.formaPagamento);
  }

  if (hasOwn(input, "status")) {
    if (!statusPagamentoValido(input.status)) {
      throw new AppError(
        `Status inválido. Valores permitidos: ${STATUS_PAGAMENTO.join(", ")}.`,
        400,
      );
    }
    dados.status = input.status;
  }

  if (Object.keys(dados).length === 0) {
    throw new AppError("Informe ao menos um campo válido para atualizar.", 400);
  }

  return serializePagamento(await repository.update(id, dados));
}

export default {
  findAll,
  findById,
  findByPedido,
  create,
  update,
};
