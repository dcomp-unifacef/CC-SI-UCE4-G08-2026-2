import type { Prisma } from "@prisma/client";
import { prisma } from "../database/client";
import { UpdatePedidoDto } from "../dto/pedido/updatePedidoDto";

const pedidoInclude = {
  cliente: { select: { idUsuario: true, nome: true } },
  garcom: { select: { idUsuario: true, nome: true } },
  itens: {
    include: {
      produto: { select: { idProduto: true, nome: true, preco: true } },
    },
  },
  pagamento: true,
} as const;

export interface ItemPedidoCalculado {
  idProduto: number;
  quantidade: number;
  valorUnit: number;
  subTotal: number;
}

export interface ItemPedidoAtualizacao {
  idProduto?: number;
  quantidade?: number;
  valorUnit?: number;
  subTotal?: number;
}

interface CreatePedidoData {
  valorTotal: number;
  statusPedido: string;
  idCliente: number;
  idGarcom: number;
  itens: ItemPedidoCalculado[];
}

interface PedidoFiltro {
  idCliente?: number;
}

async function recalcularTotal(
  tx: Prisma.TransactionClient,
  idPedido: number,
) {
  const agregado = await tx.itemPedido.aggregate({
    where: { idPedido },
    _sum: { subTotal: true },
  });

  const valorTotal = Number(agregado._sum.subTotal ?? 0);

  await tx.pedido.update({
    where: { idPedido },
    data: { valorTotal },
  });
}

function findAll(filtro: PedidoFiltro = {}) {
  return prisma.pedido.findMany({
    where: filtro,
    include: pedidoInclude,
    orderBy: { dataHora: "desc" },
  });
}

function findById(idPedido: number) {
  return prisma.pedido.findUnique({
    where: { idPedido },
    include: pedidoInclude,
  });
}

function findItemById(idPedido: number, idItemPedido: number) {
  return prisma.itemPedido.findFirst({
    where: { idItemPedido, idPedido },
  });
}

function countItens(idPedido: number) {
  return prisma.itemPedido.count({ where: { idPedido } });
}

function create(data: CreatePedidoData) {
  return prisma.pedido.create({
    data: {
      valorTotal: data.valorTotal,
      statusPedido: data.statusPedido,
      idCliente: data.idCliente,
      idGarcom: data.idGarcom,
      itens: { create: data.itens },
    },
    include: pedidoInclude,
  });
}

function update(idPedido: number, data: UpdatePedidoDto) {
  return prisma.pedido.update({
    where: { idPedido },
    data,
    include: pedidoInclude,
  });
}

function addItem(idPedido: number, item: ItemPedidoCalculado) {
  return prisma.$transaction(async (tx) => {
    await tx.itemPedido.create({
      data: { ...item, idPedido },
    });

    await recalcularTotal(tx, idPedido);

    return tx.pedido.findUniqueOrThrow({
      where: { idPedido },
      include: pedidoInclude,
    });
  });
}

function updateItem(
  idPedido: number,
  idItemPedido: number,
  data: ItemPedidoAtualizacao,
) {
  return prisma.$transaction(async (tx) => {
    await tx.itemPedido.update({
      where: { idItemPedido },
      data,
    });

    await recalcularTotal(tx, idPedido);

    return tx.pedido.findUniqueOrThrow({
      where: { idPedido },
      include: pedidoInclude,
    });
  });
}

function removeItem(idPedido: number, idItemPedido: number) {
  return prisma.$transaction(async (tx) => {
    await tx.itemPedido.delete({ where: { idItemPedido } });

    await recalcularTotal(tx, idPedido);

    return tx.pedido.findUniqueOrThrow({
      where: { idPedido },
      include: pedidoInclude,
    });
  });
}

function remove(idPedido: number) {
  return prisma.$transaction(async (tx) => {
    await tx.pagamento.deleteMany({ where: { idPedido } });
    await tx.itemPedido.deleteMany({ where: { idPedido } });

    return tx.pedido.delete({ where: { idPedido } });
  });
}

export default {
  findAll,
  findById,
  findItemById,
  countItens,
  create,
  update,
  addItem,
  updateItem,
  removeItem,
  remove,
};
