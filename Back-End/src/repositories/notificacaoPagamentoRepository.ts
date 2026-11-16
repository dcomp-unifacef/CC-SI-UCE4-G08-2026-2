// Acesso Prisma ao modelo de notificações de pagamento, usado pelo respectivo service.
import { prisma } from "../database/client";

// Dados que podem ser persistidos em uma solicitação de pagamento.
export interface DadosNotificacao {
  idPedido: number;
  numeroMesa: number;
  metodoPagamento: string;
  status?: string;
  lida?: boolean;
}

// Critérios de listagem para fila, leitura e vínculo de pedido.
export interface FiltrosNotificacao {
  status?: string;
  lida?: boolean;
  idPedido?: number;
}

// Retorna notificações filtradas com as mais recentes primeiro.
function findAll(filtros: FiltrosNotificacao = {}) {
  const where: Record<string, unknown> = {};

  // Adiciona somente os filtros especificados pelo service.
  if (filtros.status !== undefined) where.status = filtros.status;
  if (filtros.lida !== undefined) where.lida = filtros.lida;
  if (filtros.idPedido !== undefined) where.idPedido = filtros.idPedido;

  return prisma.notificacaoPagamento.findMany({
    where: where as any,
    orderBy: { dataHora: "desc" },
  });
}

// Localiza uma notificação pela chave primária.
function findById(idNotificacao: number) {
  return prisma.notificacaoPagamento.findUnique({
    where: { idNotificacao },
  });
}

// Lista o histórico de notificações de um pedido, da mais recente para a mais antiga.
function findByPedido(idPedido: number) {
  return prisma.notificacaoPagamento.findMany({
    where: { idPedido },
    orderBy: { dataHora: "desc" },
  });
}

// Persiste uma notificação e define status pendente quando não houver estado explícito.
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

// Atualiza campos permitidos da notificação por ID.
function update(idNotificacao: number, data: Partial<DadosNotificacao>) {
  return prisma.notificacaoPagamento.update({
    where: { idNotificacao },
    data,
  });
}

// Marca atendimento e leitura em uma operação, refletindo conclusão da solicitação.
function marcarComoAtendida(idNotificacao: number) {
  return prisma.notificacaoPagamento.update({
    where: { idNotificacao },
    data: { status: "ATENDIDO", lida: true },
  });
}

// Marca somente o indicador de leitura, mantendo o status do atendimento.
function marcarComoLida(idNotificacao: number) {
  return prisma.notificacaoPagamento.update({
    where: { idNotificacao },
    data: { lida: true },
  });
}

// Conta solicitações pendentes ainda não lidas para o indicador da interface.
function contarNaoLidas() {
  return prisma.notificacaoPagamento.count({
    where: { lida: false, status: "PENDENTE" },
  });
}

// API interna do repository consumida pelo notificacaoPagamentoService.
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
