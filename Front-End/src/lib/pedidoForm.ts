import type { ItemCarrinho } from "./carrinho";

export interface ValidarNovoPedidoInput {
  numeroMesa: number;
  idGarcom: number | null;
  itens: ItemCarrinho[];
  exigeGarcom: boolean;
}

export function validarNovoPedido(input: ValidarNovoPedidoInput): string | null {
  if (!Number.isInteger(input.numeroMesa) || input.numeroMesa <= 0) {
    return "Informe um número de mesa válido.";
  }
  if (input.itens.length === 0) {
    return "Adicione ao menos um item ao pedido.";
  }
  if (input.exigeGarcom && (!input.idGarcom || !Number.isInteger(input.idGarcom))) {
    return "Selecione o garçom responsável.";
  }
  return null;
}
