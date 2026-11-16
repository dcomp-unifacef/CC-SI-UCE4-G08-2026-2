// Repository fornece consultas e mutações Prisma para pagamentos e pedidos associados.
import repository, {
  DadosPagamento,
  FiltrosPagamento,
} from "../repositories/pagamentoRepository";
// Erros de negócio e validação convertidos em respostas HTTP pela aplicação.
import { AppError } from "../errors/AppError";
// Regras de pagamento padronizam estados válidos e arredondamento monetário.
import {
  round2,
  STATUS_PAGAMENTO,
  statusPagamentoValido,
} from "../domain/pedidoRules";
// Serializador converte decimais do Prisma para números na resposta HTTP.
import { serializePagamento } from "../utils/serializers";

// Exige corpo JSON em formato objeto antes de acessar seus campos.
function getObjectData(data: unknown): Record<string, unknown> {
  if (data === null || typeof data !== "object" || Array.isArray(data)) {
    throw new AppError("O corpo da requisição deve ser um objeto JSON.", 400);
  }

  return data as Record<string, unknown>;
}

// Distingue propriedade omitida de propriedade presente com valor inválido/nulo.
function hasOwn(data: Record<string, unknown>, campo: string): boolean {
  return Object.prototype.hasOwnProperty.call(data, campo);
}

// Valida identificadores recebidos como números no corpo JSON.
function validarId(valor: unknown, campo: string): number {
  if (typeof valor !== "number" || !Number.isInteger(valor) || valor <= 0) {
    throw new AppError(`${campo} deve ser um inteiro positivo.`, 400);
  }

  return valor;
}

// Valida e normaliza método de pagamento com limite compatível com o modelo.
function validarFormaPagamento(valor: unknown): string {
  if (typeof valor !== "string" || valor.trim().length === 0) {
    throw new AppError("O campo formaPagamento é obrigatório.", 400);
  }

  const texto = valor.trim();

  if (texto.length > 80) {
    throw new AppError(
      "O campo formaPagamento deve ter no máximo 80 caracteres.",
      400,
    );
  }

  return texto;
}

// Valida valor positivo finito e arredonda para precisão de centavos.
function validarValor(valor: unknown): number {
  if (typeof valor !== "number" || !Number.isFinite(valor) || valor <= 0) {
    throw new AppError("O valor do pagamento deve ser um número maior que zero.", 400);
  }

  return round2(valor);
}

// Converte violação de unicidade Prisma em conflito de negócio explícito.
function throwDatabaseError(error: any): never {
  if (error?.code === "P2002") {
    throw new AppError("Este pedido já possui um pagamento registrado.", 409);
  }

  throw error;
}

// Lista pagamentos de acordo com filtros e serializa decimais.
async function findAll(filtros: FiltrosPagamento) {
  const pagamentos = await repository.findAll(filtros);
  return pagamentos.map(serializePagamento);
}

// Localiza pagamento e responde como ausente caso a chave não exista.
async function findById(id: number) {
  const pagamento = await repository.findById(id);

  if (!pagamento) {
    throw new AppError("Pagamento não encontrado.", 404);
  }

  return serializePagamento(pagamento);
}

// Recupera pagamento do pedido informado ou representa ausência com 404.
async function findByPedido(idPedido: number) {
  const pagamento = await repository.findByPedido(idPedido);

  if (!pagamento) {
    throw new AppError("Pagamento não encontrado para este pedido.", 404);
  }

  return serializePagamento(pagamento);
}

// Valida entrada, pedido e valor total antes de criar um registro único de pagamento.
async function create(data: unknown) {
  const input = getObjectData(data);
  const idPedido = validarId(input.idPedido, "idPedido");
  const formaPagamento = validarFormaPagamento(input.formaPagamento);
  // Define status padrão ou aceita apenas valores reconhecidos pelas regras do domínio.
  const status =
    input.status === undefined
      ? "Pago"
      : (() => {
          if (!statusPagamentoValido(input.status)) {
            throw new AppError(
              `Status inválido. Valores permitidos: ${STATUS_PAGAMENTO.join(", ")}.`,
              400,
            );
          }
          return input.status;
        })();

  // Busca dados essenciais para garantir que pedido e total sejam válidos.
  const pedido = await repository.findPedidoById(idPedido);

  // Pedido inexistente não pode receber pagamento.
  if (!pedido) {
    throw new AppError("Pedido não encontrado.", 404);
  }

  // Impede cobrança de pedido cancelado.
  if (pedido.statusPedido === "Cancelado") {
    throw new AppError(
      "Não é possível registrar pagamento de um pedido cancelado.",
      409,
    );
  }

  // A regra de negócio permite no máximo um pagamento por pedido.
  const pagamentoExistente = await repository.findByPedido(idPedido);

  if (pagamentoExistente) {
    throw new AppError("Este pedido já possui um pagamento registrado.", 409);
  }

  // Calcula o valor de cobrança a partir do total persistido, não do valor enviado pelo cliente.
  const valorEsperado = Number(pedido.valorTotal);

  if (valorEsperado <= 0) {
    throw new AppError(
      "O pedido não possui valor total para ser pago.",
      409,
    );
  }

  // Quando o corpo inclui valor, ele precisa coincidir exatamente com o total calculado.
  if (input.valor !== undefined && validarValor(input.valor) !== valorEsperado) {
    throw new AppError(
      "O valor do pagamento deve ser igual ao valor total do pedido.",
      400,
    );
  }

  // Trata também colisão concorrente na restrição única do banco.
  try {
    const pagamento = await repository.create({
      valor: valorEsperado,
      formaPagamento,
      status,
      idPedido,
    });

    return serializePagamento(pagamento);
  } catch (error) {
    return throwDatabaseError(error);
  }
}

// Atualiza forma/status após checar existência e rejeitar campos desconhecidos ou corpo vazio.
async function update(id: number, data: unknown) {
  const pagamento = await repository.findById(id);

  if (!pagamento) {
    throw new AppError("Pagamento não encontrado.", 404);
  }

  const input = getObjectData(data);
  const dados: DadosPagamento = {};

  // Somente forma de pagamento e estado podem mudar neste endpoint.
  if (hasOwn(input, "formaPagamento")) {
    dados.formaPagamento = validarFormaPagamento(input.formaPagamento);
  }

  // O status deve pertencer à lista compartilhada pelo domínio.
  if (hasOwn(input, "status")) {
    if (!statusPagamentoValido(input.status)) {
      throw new AppError(
        `Status inválido. Valores permitidos: ${STATUS_PAGAMENTO.join(", ")}.`,
        400,
      );
    }
    dados.status = input.status;
  }

  // Impede uma atualização vazia e devolve o resultado em formato JSON compatível.
  if (Object.keys(dados).length === 0) {
    throw new AppError("Informe ao menos um campo válido para atualizar.", 400);
  }

  return serializePagamento(await repository.update(id, dados));
}

// API de casos de uso conectada ao pagamentoController.
export default {
  findAll,
  findById,
  findByPedido,
  create,
  update,
};
