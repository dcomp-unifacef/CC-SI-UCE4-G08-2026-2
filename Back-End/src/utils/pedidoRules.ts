export const STATUS_ENCERRADOS = ["Pago", "Cancelado"] as const;

export interface PedidoAtivoResumo {
  idPedido: number;
  idCliente: number | null;
  statusPedido: string;
}

export type DecisaoCriacao =
  | { tipo: "criar" }
  | { tipo: "entrar"; idPedido: number }
  | { tipo: "conflito"; idPedido: number };

function normalizarStatus(statusPedido: string): string {
  return statusPedido.trim().toLowerCase();
}

export function isPedidoAtivo(statusPedido: string): boolean {
  const status = normalizarStatus(statusPedido);

  return !STATUS_ENCERRADOS.some(
    (encerrado) => normalizarStatus(encerrado) === status,
  );
}

export function podeEditarItens(statusPedido: string): boolean {
  return normalizarStatus(statusPedido) === "aberto";
}

export function decidirCriacao(
  ativo: PedidoAtivoResumo | null,
  contexto: { ehCliente: boolean },
): DecisaoCriacao {
  if (!ativo) {
    return { tipo: "criar" };
  }

  if (
    contexto.ehCliente &&
    ativo.idCliente === null &&
    podeEditarItens(ativo.statusPedido)
  ) {
    return { tipo: "entrar", idPedido: ativo.idPedido };
  }

  return { tipo: "conflito", idPedido: ativo.idPedido };
}
