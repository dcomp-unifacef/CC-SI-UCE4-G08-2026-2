import {
  ehAdministrador,
  normalizarPerfil,
  PERFIS,
} from "./perfis";

export const STATUS_PEDIDO = [
  "Pendente",
  "Em preparo",
  "Pronto",
  "Entregue",
  "Cancelado",
] as const;

export type StatusPedido = (typeof STATUS_PEDIDO)[number];

export const STATUS_PAGAMENTO = ["Pendente", "Pago", "Cancelado"] as const;

export type StatusPagamento = (typeof STATUS_PAGAMENTO)[number];

const TRANSICOES: Record<StatusPedido, StatusPedido[]> = {
  Pendente: ["Em preparo", "Cancelado"],
  "Em preparo": ["Pronto", "Cancelado"],
  Pronto: ["Entregue", "Cancelado"],
  Entregue: [],
  Cancelado: [],
};

export function statusPedidoValido(valor: unknown): valor is StatusPedido {
  return (
    typeof valor === "string" &&
    (STATUS_PEDIDO as readonly string[]).includes(valor)
  );
}

export function statusPagamentoValido(valor: unknown): valor is StatusPagamento {
  return (
    typeof valor === "string" &&
    (STATUS_PAGAMENTO as readonly string[]).includes(valor)
  );
}

export function podeTransicionar(
  atual: string,
  novo: StatusPedido,
): boolean {
  if (!statusPedidoValido(atual)) return false;
  return TRANSICOES[atual].includes(novo);
}

export function podeEditarPedido(status: string): boolean {
  return status === "Pendente";
}

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
      perfilNormalizado === normalizarPerfil(PERFIS.GARCOM) &&
      atual === "Pendente"
    );
  }

  return false;
}

export function round2(valor: number): number {
  return Math.round((valor + Number.EPSILON) * 100) / 100;
}

export function calcularSubtotal(
  valorUnitario: number,
  quantidade: number,
): number {
  return round2(valorUnitario * quantidade);
}

export function calcularTotal(itens: Array<{ subTotal: number }>): number {
  return round2(
    itens.reduce((total, item) => total + Number(item.subTotal), 0),
  );
}
