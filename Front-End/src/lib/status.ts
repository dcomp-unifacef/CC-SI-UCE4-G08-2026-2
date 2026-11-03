export function pedidoAtivo(status: string): boolean {
  const s = status.trim().toLowerCase();
  return s !== "pago" && s !== "cancelado";
}

export function podeEditarItens(status: string): boolean {
  return status.trim().toLowerCase() === "aberto";
}

export interface AcaoStatus {
  rotulo: string;
  novoStatus: string;
  confirmar?: boolean;
}

export function acoesDeStatus(status: string): AcaoStatus[] {
  const s = status.trim();
  switch (s) {
    case "Aberto":
      return [
        { rotulo: "Iniciar preparo", novoStatus: "Em preparo" },
        { rotulo: "Cancelar pedido", novoStatus: "Cancelado", confirmar: true },
      ];
    case "Em preparo":
      return [
        { rotulo: "Marcar como pronto", novoStatus: "Pronto" },
        { rotulo: "Cancelar pedido", novoStatus: "Cancelado", confirmar: true },
      ];
    case "Pronto":
      return [
        { rotulo: "Entregue", novoStatus: "Entregue" },
        { rotulo: "Cancelar pedido", novoStatus: "Cancelado", confirmar: true },
      ];
    case "Entregue":
      return [{ rotulo: "Cancelar pedido", novoStatus: "Cancelado", confirmar: true }];
    default:
      return [];
  }
}
