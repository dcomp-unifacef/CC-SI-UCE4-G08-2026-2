// Acesso aos modelos Prisma de pedido, item, produto e usuário para o pedidoService.
import { prisma } from "../database/client";
//
// Projeção mínima de identidade para não retornar dados sensíveis nos relacionamentos.
const usuarioResumoSelect = {
  idUsuario: true,
  nome: true,
  loginUsuario: true,
  statusUsuario: true,
  tipoUsuario: { select: { nome: true } },
} as const;

// Grafo de relações carregado com pedidos para serialização e regras do pedidoService.
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

// Forma já validada pelo service que o repository persiste em cada item da comanda.
export interface ItemPedidoPersistido {
  idProduto: number;
  quantidade: number;
  valorUnit: number;
  subTotal: number;
}

// Campos persistíveis do pedido; o service prepara associações e regras antes de chegar aqui.
export interface DadosPedido {
  idCliente?: number | null;
  idGarcom?: number | null;
  idCozinheiro?: number | null;
  tempoEstimado?: number | null;
  statusPedido?: string;
  motivoCancelamento?: string | null;
  valorTotal?: number;
  numeroMesa?: number;
}

// Filtros de consulta recebidos do controller e transformados em cláusula Prisma.
export interface FiltrosPedido {
  status?: string | string[];
  idCliente?: number;
  idGarcom?: number;
  idCozinheiro?: number;
  numeroMesa?: number;
  data?: string; // YYYY-MM-DD
  page?: number;
  limit?: number;
}

// Monta filtro de banco apenas com critérios fornecidos; suporta status, atores, mesa e data.
function montarWhere(filtros: FiltrosPedido) {
  const where: Record<string, unknown> = {};

  // Status pode ser valor único ou lista; Prisma usa igualdade ou operador in.
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
  if (filtros.numeroMesa !== undefined) where.numeroMesa = filtros.numeroMesa;

  // Restringe período UTC do dia solicitado para a consulta de pedidos.
  if (filtros.data) {
    const data = filtros.data;
    const inicio = `${data}T00:00:00.000Z`;
    const fim = `${data}T23:59:59.999Z`;
    where.dataHora = { gte: inicio, lte: fim };
  }

  return where;
}

// Lista pedidos paginados e ordenados do mais recente para o mais antigo.
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

// Carrega pedido por chave primária com relacionamentos necessários ao service.
function findById(idPedido: number) {
  return prisma.pedido.findUnique({
    where: { idPedido },
    include: pedidoInclude,
  });
}

// Encontra o pedido ainda ativo mais recente de determinada mesa.
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

// Busca dados de catálogo para montar itens sem confiar em preços enviados pelo cliente.
function findProdutosByIds(idsProduto: number[]) {
  // Evita consulta sem efeito quando a lista de IDs está vazia.
  if (idsProduto.length === 0) return Promise.resolve([]);

  return prisma.produto.findMany({
    where: { idProduto: { in: idsProduto } },
    select: {
      idProduto: true,
      nome: true,
      preco: true,
      imagem: true,
      descricao: true,
      disponivel: true,
    },
  });
}

// Consulta identidade e perfil associados a um ID para as verificações de negócio do service.
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

// Recalcula o total pelo agregado persistido e atualiza o pedido dentro da transação ativa.
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

// Cria pedido e itens atomicamente, retornando o agregado completo para a serialização.
function create(dados: DadosPedido, itens: ItemPedidoPersistido[]) {
  return prisma.$transaction(async (tx) => {
    // Grava a entidade principal e conecta relações opcionais de cliente/garçom.
    const pedido = await tx.pedido.create({
      data: {
        cliente:
          dados.idCliente !== undefined && dados.idCliente !== null
            ? { connect: { idUsuario: dados.idCliente } }
            : undefined,
        garcom:
          dados.idGarcom !== undefined && dados.idGarcom !== null
            ? { connect: { idUsuario: dados.idGarcom } }
            : undefined,
        statusPedido: dados.statusPedido ?? "Pendente",
        valorTotal: dados.valorTotal ?? 0,
        numeroMesa: dados.numeroMesa as number,
      },
    });

    // Cria todas as linhas relacionadas usando o ID gerado para a comanda.
    await tx.itemPedido.createMany({
      data: itens.map((item) => ({
        ...item,
        idPedido: pedido.idPedido,
      })),
    });

    // Busca o pedido recém-criado com o mesmo formato usado nas leituras.
    return tx.pedido.findUniqueOrThrow({
      where: { idPedido: pedido.idPedido },
      include: pedidoInclude,
    });
  });
}

// Atualiza dados e, quando enviados, substitui itens e recalcula total em uma transação.
function update(
  idPedido: number,
  dados: DadosPedido,
  itens?: ItemPedidoPersistido[],
) {
  return prisma.$transaction(async (tx) => {
    // Constrói somente os campos fornecidos para evitar sobrescrever dados omitidos.
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

    // Aplica alterações da entidade principal dentro da transação.
    await tx.pedido.update({
      where: { idPedido },
      data: dataPrisma as any,
    });

    // Substitui todas as linhas somente se o service forneceu uma nova coleção de itens.
    if (itens !== undefined) {
      await tx.itemPedido.deleteMany({ where: { idPedido } });
      await tx.itemPedido.createMany({
        data: itens.map((item) => ({ ...item, idPedido })),
      });
      await recalcularTotal(tx, idPedido);
    }

    // Retorna a entidade persistida com relacionamentos após a atualização.
    return tx.pedido.findUniqueOrThrow({
      where: { idPedido },
      include: pedidoInclude,
    });
  });
}

// Persiste exclusivamente a atualização de campos de estado/status preparada pelo service.
function updateStatus(idPedido: number, dados: DadosPedido) {
  return prisma.pedido.update({
    where: { idPedido },
    data: dados,
    include: pedidoInclude,
  });
}

// Insere item novo e recalcula total atomicamente antes de devolver pedido atualizado.
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

// Atualiza quantidade e valores de uma linha existente e mantém total sincronizado.
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

// Exclui uma linha e recalcula o agregado monetário na mesma transação.
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

// Interface pública importada pelo pedidoService; funções internas ficam encapsuladas.
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
