// Cliente Prisma compartilhado, usado para persistir e consultar os modelos de pagamento e pedido.
import { prisma } from "../database/client";

// Campos que o service pode gravar/alterar após validar regras de negócio.
export interface DadosPagamento {
  valor?: number;
  formaPagamento?: string;
  status?: string;
  idPedido?: number;
}

// Filtros opcionais produzidos pelo controller para pesquisas no banco.
export interface FiltrosPagamento {
  idPedido?: number;
  status?: string;
}

// Busca pagamentos com filtros opcionais e ordenação cronológica inversa.
function findAll(filtros: FiltrosPagamento = {}) {
  const where: Record<string, unknown> = {};

  // Copia apenas critérios fornecidos para não limitar a consulta inadvertidamente.
  if (filtros.idPedido !== undefined) where.idPedido = filtros.idPedido;
  if (filtros.status !== undefined) where.status = filtros.status;

  return prisma.pagamento.findMany({
    where: where as any,
    orderBy: { dataHora: "desc" },
  });
}

// Recupera pagamento pela chave primária.
function findById(idPagamento: number) {
  return prisma.pagamento.findUnique({
    where: { idPagamento },
  });
}

// Recupera o pagamento único associado ao pedido.
function findByPedido(idPedido: number) {
  return prisma.pagamento.findUnique({
    where: { idPedido },
  });
}

// Fornece campos do pedido necessários às validações de valor e estado no pagamentoService.
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

// Persiste registro já validado, incluindo a associação com pedido.
function create(data: {
  valor: number;
  formaPagamento: string;
  status: string;
  idPedido: number;
}) {
  return prisma.pagamento.create({ data });
}

// Atualiza os campos permitidos de um pagamento por identificador.
function update(idPagamento: number, data: DadosPagamento) {
  return prisma.pagamento.update({
    where: { idPagamento },
    data,
  });
}

// Expõe operações de persistência ao service, sem acoplá-lo diretamente ao Prisma.
export default {
  findAll,
  findById,
  findByPedido,
  findPedidoById,
  create,
  update,
};
