// Este módulo contém regras puras de estados, permissões e valores usadas pelo serviço de pedidos.
// A normalização e os perfis compartilhados mantêm as decisões coerentes com autenticação/autorização.
import {
  ehAdministrador,
  normalizarPerfil,
  PERFIS,
} from "./perfis";

// Estados aceitos pelo fluxo de pedido; a tupla também origina o tipo StatusPedido.
export const STATUS_PEDIDO = [
  "Pendente",
  "Em preparo",
  "Pronto",
  "Entregue",
  "Cancelado",
] as const;

// Tipo derivado dos estados válidos para impedir valores arbitrários nas regras tipadas.
export type StatusPedido = (typeof STATUS_PEDIDO)[number];

// Estados reconhecidos para pagamentos, compartilhados pelo serviço de pagamentos.
export const STATUS_PAGAMENTO = ["Pendente", "Pago", "Cancelado"] as const;

// Tipo derivado da lista para validar e propagar status de pagamento.
export type StatusPagamento = (typeof STATUS_PAGAMENTO)[number];

// Define o grafo permitido de transições; estados terminais têm listas vazias.
const TRANSICOES: Record<StatusPedido, StatusPedido[]> = {
  Pendente: ["Em preparo", "Cancelado"],
  "Em preparo": ["Pronto", "Cancelado"],
  Pronto: ["Entregue", "Cancelado"],
  Entregue: [],
  Cancelado: [],
};

// Verifica valores externos sem confiar no tipo declarado pela requisição.
export function statusPedidoValido(valor: unknown): valor is StatusPedido {
  return (
    typeof valor === "string" &&
    (STATUS_PEDIDO as readonly string[]).includes(valor)
  );
}

// Confere se um valor recebido é um dos estados conhecidos de pagamento.
export function statusPagamentoValido(valor: unknown): valor is StatusPagamento {
  return (
    typeof valor === "string" &&
    (STATUS_PAGAMENTO as readonly string[]).includes(valor)
  );
}

// Aceita somente arestas existentes no fluxo de estados do pedido.
export function podeTransicionar(
  atual: string,
  novo: StatusPedido,
): boolean {
  if (!statusPedidoValido(atual)) return false;
  return TRANSICOES[atual].includes(novo);
}

// Restringe alterações de conteúdo do pedido ao estado inicial pendente.
export function podeEditarPedido(status: string): boolean {
  return status === "Pendente";
}

// Combina transição válida com o perfil responsável por realizá-la.
export function perfilPodeAlterarStatus(
  perfil: string,
  atual: string,
  novo: StatusPedido,
): boolean {
  if (!podeTransicionar(atual, novo)) return false;

  if (ehAdministrador(perfil) || normalizarPerfil(perfil) === normalizarPerfil(PERFIS.GERENTE)) {
    return true;
  }

  const perfilNormalizado = normalizarPerfil(perfil);

  if (novo === "Em preparo") {
    return (
      perfilNormalizado === normalizarPerfil(PERFIS.GARCOM) ||
      perfilNormalizado === normalizarPerfil(PERFIS.COZINHEIRO)
    );
  }

  if (novo === "Pronto") {
    return perfilNormalizado === normalizarPerfil(PERFIS.COZINHEIRO);
  }

  if (novo === "Entregue") {
    return perfilNormalizado === normalizarPerfil(PERFIS.GARCOM);
  }

  if (novo === "Cancelado") {
    return (
      perfilNormalizado === normalizarPerfil(PERFIS.GARCOM) ||
      perfilNormalizado === normalizarPerfil(PERFIS.COZINHEIRO)
    );
  }

  return false;
}

// Arredonda valores monetários a duas casas, compensando imprecisões binárias comuns.
export function round2(valor: number): number {
  return Math.round((valor + Number.EPSILON) * 100) / 100;
}

// Calcula o valor de uma linha de pedido a partir do preço e da quantidade.
export function calcularSubtotal(
  valorUnitario: number,
  quantidade: number,
): number {
  return round2(valorUnitario * quantidade);
}

// Soma subtotais já calculados para obter o total do pedido com precisão em centavos.
export function calcularTotal(itens: Array<{ subTotal: number }>): number {
  return round2(
    itens.reduce((total, item) => total + Number(item.subTotal), 0),
  );
}
