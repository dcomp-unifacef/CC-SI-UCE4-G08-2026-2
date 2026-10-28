import { AppError } from "../errors/AppError";
import { UpdatePagamentoDto } from "../dto/pagamento/updatePagamentoDto";
import pagamentoRepository from "../repositories/pagamentoRepository";
import pedidoRepository from "../repositories/pedidoRepository";
import type { UsuarioAutenticado } from "../utils/jwt";
import { isClienteRole } from "../utils/roles";
import {
  getObjectData,
  validatePositiveInt,
  validateText,
} from "../utils/validation";

const TAMANHO_MAX_FORMA = 80;

function validarValor(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    throw new AppError("O valor deve ser um número maior que zero.", 400);
  }

  return Number(value.toFixed(2));
}

function validarValorDoPedido(value: unknown, valorTotal: unknown): number {
  const valor = validarValor(value);
  const total = Number(Number(valorTotal).toFixed(2));

  if (valor !== total) {
    throw new AppError(
      "O valor do pagamento deve ser igual ao total do pedido.",
      400,
    );
  }

  return valor;
}

function validarFormaPagamento(value: unknown): string {
  return validateText(value, "formaPagamento", TAMANHO_MAX_FORMA);
}

function ensureAcessoAoPagamento(
  pagamento: { pedido: { idCliente: number } },
  usuario?: UsuarioAutenticado,
) {
  if (
    usuario &&
    isClienteRole(usuario.tipo) &&
    pagamento.pedido.idCliente !== usuario.idUsuario
  ) {
    throw new AppError("Você só pode acessar os próprios pagamentos.", 403);
  }
}

async function findAll(usuario?: UsuarioAutenticado) {
  if (usuario && isClienteRole(usuario.tipo)) {
    return pagamentoRepository.findAll({ idCliente: usuario.idUsuario });
  }

  return pagamentoRepository.findAll();
}

async function findById(id: number, usuario?: UsuarioAutenticado) {
  const pagamento = await pagamentoRepository.findById(id);

  if (!pagamento) {
    throw new AppError("Pagamento não encontrado.", 404);
  }

  ensureAcessoAoPagamento(pagamento, usuario);

  return pagamento;
}

async function create(data: unknown, usuario?: UsuarioAutenticado) {
  const input = getObjectData(data);

  const idPedido = validatePositiveInt(input.idPedido, "idPedido");
  const formaPagamento = validarFormaPagamento(input.formaPagamento);

  const pedido = await pedidoRepository.findById(idPedido);

  if (!pedido) {
    throw new AppError("Pedido não encontrado.", 400);
  }

  if (
    usuario &&
    isClienteRole(usuario.tipo) &&
    pedido.idCliente !== usuario.idUsuario
  ) {
    throw new AppError("Você só pode pagar os próprios pedidos.", 403);
  }

  if (pedido.statusPedido === "Pago") {
    throw new AppError("Este pedido já está pago.", 409);
  }

  if (pedido.statusPedido === "Cancelado") {
    throw new AppError("Não é possível pagar um pedido cancelado.", 409);
  }

  if (pedido.pagamento) {
    throw new AppError("Este pedido já possui um pagamento.", 409);
  }

  const valor =
    input.valor === undefined
      ? Number(Number(pedido.valorTotal).toFixed(2))
      : validarValorDoPedido(input.valor, pedido.valorTotal);

  try {
    return await pagamentoRepository.create({
      idPedido,
      formaPagamento,
      valor,
    });
  } catch (error: any) {
    if (error?.code === "P2002") {
      throw new AppError("Este pedido já possui um pagamento.", 409);
    }

    throw error;
  }
}

async function update(
  id: number,
  data: unknown,
  usuario?: UsuarioAutenticado,
) {
  if (usuario && isClienteRole(usuario.tipo)) {
    throw new AppError("Clientes não podem alterar pagamentos.", 403);
  }

  const pagamento = await findById(id, usuario);
  const input = getObjectData(data);
  const dadosAtualizados: UpdatePagamentoDto = {};

  if (Object.prototype.hasOwnProperty.call(input, "formaPagamento")) {
    dadosAtualizados.formaPagamento = validarFormaPagamento(
      input.formaPagamento,
    );
  }

  if (Object.prototype.hasOwnProperty.call(input, "valor")) {
    dadosAtualizados.valor = validarValorDoPedido(
      input.valor,
      pagamento.pedido.valorTotal,
    );
  }

  if (Object.keys(dadosAtualizados).length === 0) {
    throw new AppError("Informe ao menos um campo válido para atualizar.", 400);
  }

  return pagamentoRepository.update(id, dadosAtualizados);
}

async function remove(id: number) {
  await findById(id);
  return pagamentoRepository.remove(id);
}

export default {
  findAll,
  findById,
  create,
  update,
  remove,
};
