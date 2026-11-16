// Repository encapsula leitura e escrita de notificações pelo Prisma.
import repository from "../repositories/notificacaoPagamentoRepository";
// Erros de domínio/entrada são encaminhados ao handler global do Express.
import { AppError } from "../errors/AppError";
// Pedido é consultado para validar existência/estado e copiar mesa na solicitação.
import { prisma } from "../database/client";

// Valida objeto de entrada para evitar leituras inseguras de req.body.
function getObjectData(data: unknown): Record<string, unknown> {
  if (data === null || typeof data !== "object" || Array.isArray(data)) {
    throw new AppError("O corpo da requisição deve ser um objeto JSON.", 400);
  }

  return data as Record<string, unknown>;
}

// Aceita somente IDs numéricos positivos nos corpos usados por este service.
function validarId(valor: unknown, campo: string): number {
  if (typeof valor !== "number" || !Number.isInteger(valor) || valor <= 0) {
    throw new AppError(`${campo} deve ser um inteiro positivo.`, 400);
  }

  return valor;
}

// Normaliza e limita método às opções que a interface de pagamento suporta.
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

// Confere pedido, impede solicitações de cancelados e cria notificação pendente.
async function criarNotificacao(data: unknown) {
  const input = getObjectData(data);
  const idPedido = validarId(input.idPedido, "idPedido");
  const metodoPagamento = validarMetodoPagamento(input.metodoPagamento);

  // Busca apenas os campos necessários para validar pedido e compor o registro da notificação.
  const pedido = await prisma.pedido.findUnique({
    where: { idPedido },
    select: {
      idPedido: true,
      numeroMesa: true,
      statusPedido: true,
      valorTotal: true,
    },
  });

  // Não há solicitação de cobrança válida sem pedido existente.
  if (!pedido) {
    throw new AppError("Pedido não encontrado.", 404);
  }

  // Pedido cancelado não pode iniciar fluxo de pagamento.
  if (pedido.statusPedido === "Cancelado") {
    throw new AppError(
      "Não é possível solicitar pagamento de um pedido cancelado.",
      409,
    );
  }

  // Persiste o evento associado à mesa e devolve uma projeção estável para o controller.
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

// Filtra notificações pendentes não lidas e mapeia somente os campos de resposta.
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

// Delega contagem de notificações não lidas ao repository.
async function contarNaoLidas() {
  return repository.contarNaoLidas();
}

// Confirma existência e marca notificação como atendida no repository.
async function marcarComoAtendida(idNotificacao: number) {
  const existente = await repository.findById(idNotificacao);

  if (!existente) {
    throw new AppError("Notificação não encontrada.", 404);
  }

  return repository.marcarComoAtendida(idNotificacao);
}

// Confirma existência e marca somente leitura da notificação.
async function marcarComoLida(idNotificacao: number) {
  const existente = await repository.findById(idNotificacao);

  if (!existente) {
    throw new AppError("Notificação não encontrada.", 404);
  }

  return repository.marcarComoLida(idNotificacao);
}

// Casos de uso oferecidos ao controller do recurso de notificações.
export default {
  criarNotificacao,
  listarPendentes,
  contarNaoLidas,
  marcarComoAtendida,
  marcarComoLida,
};
