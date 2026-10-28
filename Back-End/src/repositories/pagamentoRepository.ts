import { prisma } from "../database/client";
import { UpdatePagamentoDto } from "../dto/pagamento/updatePagamentoDto";

const pagamentoInclude = {
  pedido: {
    select: {
      idPedido: true,
      valorTotal: true,
      statusPedido: true,
      idCliente: true,
    },
  },
} as const;

interface CreatePagamentoData {
  idPedido: number;
  formaPagamento: string;
  valor: number;
}

interface PagamentoFiltro {
  idCliente?: number;
}

function findAll(filtro: PagamentoFiltro = {}) {
  return prisma.pagamento.findMany({
    where:
      filtro.idCliente === undefined
        ? undefined
        : { pedido: { idCliente: filtro.idCliente } },
    include: pagamentoInclude,
    orderBy: { dataHora: "desc" },
  });
}

function findById(idPagamento: number) {
  return prisma.pagamento.findUnique({
    where: { idPagamento },
    include: pagamentoInclude,
  });
}

function create(data: CreatePagamentoData) {
  return prisma.$transaction(async (tx) => {
    await tx.pedido.update({
      where: { idPedido: data.idPedido },
      data: { statusPedido: "Pago" },
    });

    return tx.pagamento.create({
      data,
      include: pagamentoInclude,
    });
  });
}

function update(idPagamento: number, data: UpdatePagamentoDto) {
  return prisma.pagamento.update({
    where: { idPagamento },
    data,
    include: pagamentoInclude,
  });
}

function remove(idPagamento: number) {
  return prisma.pagamento.delete({ where: { idPagamento } });
}

export default {
  findAll,
  findById,
  create,
  update,
  remove,
};
