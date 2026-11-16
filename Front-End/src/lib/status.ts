// Regras de negócio locais para identificar pedidos ativos e ações válidas por status.
// Declara função pedidoAtivo, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
export function pedidoAtivo(status: string): boolean {
  // Declara valor s, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
  const s = status.trim().toLowerCase();
  // Retorna o resultado/renderização desta etapa ao componente ou chamador que coordena o fluxo.
  return s !== "pago" && s !== "cancelado";
}

// Declara função podeEditarItens, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
export function podeEditarItens(status: string): boolean {
  // Retorna o resultado/renderização desta etapa ao componente ou chamador que coordena o fluxo.
  return status.trim().toLowerCase() === "aberto";
}

// Declara contrato de dados AcaoStatus, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
export interface AcaoStatus {
  rotulo: string;
  novoStatus: string;
  confirmar?: boolean;
}

// Declara função acoesDeStatus, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
export function acoesDeStatus(status: string): AcaoStatus[] {
  // Declara valor s, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
  const s = status.trim();
  // Seleciona o comportamento apropriado conforme o estado ou valor recebido.
  switch (s) {
    // Trata esta alternativa de estado/valor dentro da decisão do fluxo.
    case "Aberto":
      // Retorna o resultado/renderização desta etapa ao componente ou chamador que coordena o fluxo.
      return [
        { rotulo: "Iniciar preparo", novoStatus: "Em preparo" },
        { rotulo: "Cancelar pedido", novoStatus: "Cancelado", confirmar: true },
      ];
    // Trata esta alternativa de estado/valor dentro da decisão do fluxo.
    case "Em preparo":
      // Retorna o resultado/renderização desta etapa ao componente ou chamador que coordena o fluxo.
      return [
        { rotulo: "Marcar como pronto", novoStatus: "Pronto" },
        { rotulo: "Cancelar pedido", novoStatus: "Cancelado", confirmar: true },
      ];
    // Trata esta alternativa de estado/valor dentro da decisão do fluxo.
    case "Pronto":
      // Retorna o resultado/renderização desta etapa ao componente ou chamador que coordena o fluxo.
      return [
        { rotulo: "Entregue", novoStatus: "Entregue" },
        { rotulo: "Cancelar pedido", novoStatus: "Cancelado", confirmar: true },
      ];
    // Trata esta alternativa de estado/valor dentro da decisão do fluxo.
    case "Entregue":
      // Retorna o resultado/renderização desta etapa ao componente ou chamador que coordena o fluxo.
      return [{ rotulo: "Cancelar pedido", novoStatus: "Cancelado", confirmar: true }];
    default:
      // Retorna o resultado/renderização desta etapa ao componente ou chamador que coordena o fluxo.
      return [];
  }
}
