// Funções locais de validação e preparação de dados informados no formulário de pedido.
// Importa o módulo ./carrinho, que fornece dependências usadas neste arquivo; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import type { ItemCarrinho } from "./carrinho";

// Declara contrato de dados ValidarNovoPedidoInput, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
export interface ValidarNovoPedidoInput {
  numeroMesa: number;
  idGarcom: number | null;
  itens: ItemCarrinho[];
  exigeGarcom: boolean;
}

// Declara função validarNovoPedido, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
export function validarNovoPedido(input: ValidarNovoPedidoInput): string | null {
  // Verifica a condição do fluxo para decidir se os dados e a navegação devem seguir por este ramo.
  if (!Number.isInteger(input.numeroMesa) || input.numeroMesa <= 0) {
    // Retorna o resultado/renderização desta etapa ao componente ou chamador que coordena o fluxo.
    return "Informe um número de mesa válido.";
  }
  // Verifica a condição do fluxo para decidir se os dados e a navegação devem seguir por este ramo.
  if (input.itens.length === 0) {
    // Retorna o resultado/renderização desta etapa ao componente ou chamador que coordena o fluxo.
    return "Adicione ao menos um item ao pedido.";
  }
  // Verifica a condição do fluxo para decidir se os dados e a navegação devem seguir por este ramo.
  if (input.exigeGarcom && (!input.idGarcom || !Number.isInteger(input.idGarcom))) {
    // Retorna o resultado/renderização desta etapa ao componente ou chamador que coordena o fluxo.
    return "Selecione o garçom responsável.";
  }
  // Retorna o resultado/renderização desta etapa ao componente ou chamador que coordena o fluxo.
  return null;
}
