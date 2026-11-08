import { prisma } from "../database/client";

export interface DadosPagamento {
  valor?: number;
  formaPagamento?: string;
  status?: string;
  idPedido?: number;
}

export interface FiltrosPagamento {
  idPedido?: number;
  status?: string;
}

function findAll(filtros: FiltrosPagamento = {}) {
  const where: Record<string, unknown> = {};

  if (filtros.idPedido !== undefined) where.idPedido = filtros.idPedido;
  if (filtros.status !== undefined) where.status = filtros.status;

  return prisma.pagamento.findMany({
    where: where as any,
    orderBy: { dataHora: "desc" },
  });
}

function findById(idPagamento: number) {
  return prisma.pagamento.findUnique({
    where: { idPagamento },
  });
}

function findByPedido(idPedido: number) {
  return prisma.pagamento.findUnique({
    where: { idPedido },
  });
}

function findPedidoById(idPedido: number) {
  return prisma.pedido.findUnique({
    where: { idPedido },
    select: {
      idPedido: true,
      statusPedido: true,
      valorTotal: true,
      idCliente: true,
      idGarcom: true,
    },
  });
}

function create(data: {
  valor: number;
  formaPagamento: string;
  status: string;
  idPedido: number;
}) {
  return prisma.pagamento.create({ data });
}

function update(idPagamento: number, data: DadosPagamento) {
  return prisma.pagamento.update({
    where: { idPagamento },
    data,
  });
}

export default {
  findAll,
  findById,
  findByPedido,
  findPedidoById,
  create,
  update,
};
