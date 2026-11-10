import repository from "../repositories/notificacaoPagamentoRepository";
import { AppError } from "../errors/AppError";
import { prisma } from "../database/client";

function getObjectData(data: unknown): Record<string, unknown> {
  if (data === null || typeof data !== "object" || Array.isArray(data)) {
    throw new AppError("O corpo da requisição deve ser um objeto JSON.", 400);
  }

  return data as Record<string, unknown>;
}

function validarId(valor: unknown, campo: string): number {
  if (typeof valor !== "number" || !Number.isInteger(valor) || valor <= 0) {
    throw new AppError(`${campo} deve ser um inteiro positivo.`, 400);
  }

  return valor;
}

function validarMetodoPagamento(valor: unknown): string {
  if (typeof valor !== "string" || valor.trim().length === 0) {
    throw new AppError("O método de pagamento é obrigatório.", 400);
  }

  const texto = valor.trim().toUpperCase();

  if (texto !== "PIX" && texto !== "CARTAO") {
    throw new AppError(
      "Método de pagamento inválido. Valores permitidos: PIX, CARTAO.",
      400,
    );
  }

  return texto;
}

async function criarNotificacao(data: unknown) {
  const input = getObjectData(data);
  const idPedido = validarId(input.idPedido, "idPedido");
  const metodoPagamento = validarMetodoPagamento(input.metodoPagamento);

  const pedido = await prisma.pedido.findUnique({
    where: { idPedido },
    select: {
      idPedido: true,
      numeroMesa: true,
      statusPedido: true,
      valorTotal: true,
    },
  });

  if (!pedido) {
    throw new AppError("Pedido não encontrado.", 404);
  }

  if (pedido.statusPedido === "Cancelado") {
    throw new AppError(
      "Não é possível solicitar pagamento de um pedido cancelado.",
      409,
    );
  }

  const notificacao = await repository.create({
    idPedido: pedido.idPedido,
    numeroMesa: pedido.numeroMesa,
    metodoPagamento,
    status: "PENDENTE",
  });

  return {
    idNotificacao: notificacao.idNotificacao,
    idPedido: notificacao.idPedido,
    numeroMesa: notificacao.numeroMesa,
    metodoPagamento: notificacao.metodoPagamento,
    status: notificacao.status,
    dataHora: notificacao.dataHora,
    lida: notificacao.lida,
  };
}

async function listarPendentes() {
  const notificacoes = await repository.findAll({
    status: "PENDENTE",
    lida: false,
  });

  return notificacoes.map((n) => ({
    idNotificacao: n.idNotificacao,
    idPedido: n.idPedido,
    numeroMesa: n.numeroMesa,
    metodoPagamento: n.metodoPagamento,
    status: n.status,
    dataHora: n.dataHora,
    lida: n.lida,
  }));
}

async function contarNaoLidas() {
  return repository.contarNaoLidas();
}

async function marcarComoAtendida(idNotificacao: number) {
  const existente = await repository.findById(idNotificacao);

  if (!existente) {
    throw new AppError("Notificação não encontrada.", 404);
  }

  return repository.marcarComoAtendida(idNotificacao);
}

async function marcarComoLida(idNotificacao: number) {
  const existente = await repository.findById(idNotificacao);

  if (!existente) {
    throw new AppError("Notificação não encontrada.", 404);
  }

  return repository.marcarComoLida(idNotificacao);
}

export default {
  criarNotificacao,
  listarPendentes,
  contarNaoLidas,
  marcarComoAtendida,
  marcarComoLida,
};
