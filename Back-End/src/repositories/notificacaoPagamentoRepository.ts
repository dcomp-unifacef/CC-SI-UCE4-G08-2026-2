import { prisma } from "../database/client";

export interface DadosNotificacao {
  idPedido: number;
  numeroMesa: number;
  metodoPagamento: string;
  status?: string;
  lida?: boolean;
}

export interface FiltrosNotificacao {
  status?: string;
  lida?: boolean;
  idPedido?: number;
}

function findAll(filtros: FiltrosNotificacao = {}) {
  const where: Record<string, unknown> = {};

  if (filtros.status !== undefined) where.status = filtros.status;
  if (filtros.lida !== undefined) where.lida = filtros.lida;
  if (filtros.idPedido !== undefined) where.idPedido = filtros.idPedido;

  return prisma.notificacaoPagamento.findMany({
    where: where as any,
    orderBy: { dataHora: "desc" },
  });
}

function findById(idNotificacao: number) {
  return prisma.notificacaoPagamento.findUnique({
    where: { idNotificacao },
  });
}

function findByPedido(idPedido: number) {
  return prisma.notificacaoPagamento.findMany({
    where: { idPedido },
    orderBy: { dataHora: "desc" },
  });
}

function create(data: {
  idPedido: number;
  numeroMesa: number;
  metodoPagamento: string;
  status?: string;
}) {
  return prisma.notificacaoPagamento.create({
    data: {
      idPedido: data.idPedido,
      numeroMesa: data.numeroMesa,
      metodoPagamento: data.metodoPagamento,
      status: data.status ?? "PENDENTE",
    },
  });
}

function update(idNotificacao: number, data: Partial<DadosNotificacao>) {
  return prisma.notificacaoPagamento.update({
    where: { idNotificacao },
    data,
  });
}

function marcarComoAtendida(idNotificacao: number) {
  return prisma.notificacaoPagamento.update({
    where: { idNotificacao },
    data: { status: "ATENDIDO", lida: true },
  });
}

function marcarComoLida(idNotificacao: number) {
  return prisma.notificacaoPagamento.update({
    where: { idNotificacao },
    data: { lida: true },
  });
}

function contarNaoLidas() {
  return prisma.notificacaoPagamento.count({
    where: { lida: false, status: "PENDENTE" },
  });
}

export default {
  findAll,
  findById,
  findByPedido,
  create,
  update,
  marcarComoAtendida,
  marcarComoLida,
  contarNaoLidas,
};
