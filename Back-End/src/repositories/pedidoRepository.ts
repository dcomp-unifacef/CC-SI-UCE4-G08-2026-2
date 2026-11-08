import { prisma } from "../database/client";
//
const usuarioResumoSelect = {
  idUsuario: true,
  nome: true,
  loginUsuario: true,
  statusUsuario: true,
  tipoUsuario: { select: { nome: true } },
} as const;

const pedidoInclude = {
  cliente: { select: usuarioResumoSelect },
  garcom: { select: usuarioResumoSelect },
  itens: {
    include: {
      produto: {
        select: {
          idProduto: true,
          nome: true,
          preco: true,
          descricao: true,
          disponivel: true,
        },
      },
    },
    orderBy: { idItemPedido: "asc" as const },
  },
  pagamento: true,
} as const;

export interface ItemPedidoPersistido {
  idProduto: number;
  quantidade: number;
  valorUnit: number;
  subTotal: number;
}

export interface DadosPedido {
  idCliente?: number;
  idGarcom?: number;
  idCozinheiro?: number | null;
  tempoEstimado?: number | null;
  statusPedido?: string;
  valorTotal?: number;
  numeroMesa?: number;
}

export interface FiltrosPedido {
  status?: string | string[];
  idCliente?: number;
  idGarcom?: number;
  idCozinheiro?: number;
  page?: number;
  limit?: number;
}

function montarWhere(filtros: FiltrosPedido) {
  const where: Record<string, unknown> = {};

  if (filtros.status) {
    where.statusPedido = Array.isArray(filtros.status)
      ? { in: filtros.status }
      : filtros.status;
  }

  if (filtros.idCliente !== undefined) where.idCliente = filtros.idCliente;
  if (filtros.idGarcom !== undefined) where.idGarcom = filtros.idGarcom;
  if (filtros.idCozinheiro !== undefined) {
    where.idCozinheiro = filtros.idCozinheiro;
  }

  return where;
}

function findAll(filtros: FiltrosPedido = {}) {
  const page = filtros.page && filtros.page > 0 ? filtros.page : 1;
  const limit = filtros.limit && filtros.limit > 0 ? filtros.limit : 50;

  return prisma.pedido.findMany({
    where: montarWhere(filtros) as any,
    include: pedidoInclude,
    orderBy: { dataHora: "desc" },
    skip: (page - 1) * limit,
    take: limit,
  });
}

function findById(idPedido: number) {
  return prisma.pedido.findUnique({
    where: { idPedido },
    include: pedidoInclude,
  });
}

function findAtivoDaMesa(numeroMesa: number) {
  return prisma.pedido.findFirst({
    where: {
      numeroMesa,
      statusPedido: {
        notIn: ["Pago", "Cancelado"],
      },
    },
    include: pedidoInclude,
    orderBy: { dataHora: "desc" },
  });
}

function findProdutosByIds(idsProduto: number[]) {
  if (idsProduto.length === 0) return Promise.resolve([]);

  return prisma.produto.findMany({
    where: { idProduto: { in: idsProduto } },
    select: {
      idProduto: true,
      nome: true,
      preco: true,
      disponivel: true,
    },
  });
}

function findUsuarioById(idUsuario: number) {
  return prisma.usuario.findUnique({
    where: { idUsuario },
    select: {
      idUsuario: true,
      nome: true,
      statusUsuario: true,
      tipoUsuario: { select: { nome: true } },
    },
  });
}

async function recalcularTotal(tx: any, idPedido: number) {
  const soma = await tx.itemPedido.aggregate({
    where: { idPedido },
    _sum: { subTotal: true },
  });

  await tx.pedido.update({
    where: { idPedido },
    data: { valorTotal: soma._sum.subTotal ?? 0 },
  });
}

function create(dados: DadosPedido, itens: ItemPedidoPersistido[]) {
  return prisma.$transaction(async (tx) => {
    const pedido = await tx.pedido.create({
      data: {
        cliente: { connect: { idUsuario: dados.idCliente as number } },
        garcom: { connect: { idUsuario: dados.idGarcom as number } },
        statusPedido: dados.statusPedido ?? "Pendente",
        valorTotal: dados.valorTotal ?? 0,
        numeroMesa: dados.numeroMesa as number,
      },
    });

    await tx.itemPedido.createMany({
      data: itens.map((item) => ({
        ...item,
        idPedido: pedido.idPedido,
      })),
    });

    return tx.pedido.findUniqueOrThrow({
      where: { idPedido: pedido.idPedido },
      include: pedidoInclude,
    });
  });
}

function update(
  idPedido: number,
  dados: DadosPedido,
  itens?: ItemPedidoPersistido[],
) {
  return prisma.$transaction(async (tx) => {
    const dataPrisma: Record<string, unknown> = {};

    if (dados.idCliente !== undefined) {
      dataPrisma.cliente = { connect: { idUsuario: dados.idCliente } };
    }
    if (dados.idGarcom !== undefined) {
      dataPrisma.garcom = { connect: { idUsuario: dados.idGarcom } };
    }
    if (dados.idCozinheiro !== undefined) {
      dataPrisma.cozinheiro =
        dados.idCozinheiro === null
          ? { disconnect: true }
          : { connect: { idUsuario: dados.idCozinheiro } };
    }
    if (dados.tempoEstimado !== undefined) {
      dataPrisma.tempoEstimado = dados.tempoEstimado;
    }
    if (dados.statusPedido !== undefined) {
      dataPrisma.statusPedido = dados.statusPedido;
    }
    if (dados.valorTotal !== undefined) {
      dataPrisma.valorTotal = dados.valorTotal;
    }
    if (dados.numeroMesa !== undefined) {
      dataPrisma.numeroMesa = dados.numeroMesa;
    }

    await tx.pedido.update({
      where: { idPedido },
      data: dataPrisma as any,
    });

    if (itens !== undefined) {
      await tx.itemPedido.deleteMany({ where: { idPedido } });
      await tx.itemPedido.createMany({
        data: itens.map((item) => ({ ...item, idPedido })),
      });
      await recalcularTotal(tx, idPedido);
    }

    return tx.pedido.findUniqueOrThrow({
      where: { idPedido },
      include: pedidoInclude,
    });
  });
}

function updateStatus(idPedido: number, dados: DadosPedido) {
  return prisma.pedido.update({
    where: { idPedido },
    data: dados,
    include: pedidoInclude,
  });
}

function addItem(idPedido: number, item: ItemPedidoPersistido) {
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
  idItemPedido: number,
  idPedido: number,
  item: ItemPedidoPersistido,
) {
  return prisma.$transaction(async (tx) => {
    await tx.itemPedido.update({
      where: { idItemPedido },
      data: {
        quantidade: item.quantidade,
        valorUnit: item.valorUnit,
        subTotal: item.subTotal,
      },
    });

    await recalcularTotal(tx, idPedido);

    return tx.pedido.findUniqueOrThrow({
      where: { idPedido },
      include: pedidoInclude,
    });
  });
}

function removeItem(idItemPedido: number, idPedido: number) {
  return prisma.$transaction(async (tx) => {
    await tx.itemPedido.delete({ where: { idItemPedido } });

    await recalcularTotal(tx, idPedido);

    return tx.pedido.findUniqueOrThrow({
      where: { idPedido },
      include: pedidoInclude,
    });
  });
}

export default {
  findAll,
  findById,
  findAtivoDaMesa,
  findProdutosByIds,
  findUsuarioById,
  create,
  update,
  updateStatus,
  addItem,
  updateItem,
  removeItem,
};
