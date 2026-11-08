import { ItemPedidoInputDto } from "./itemPedidoDto";

export interface CreatePedidoDto {
  idCliente: number;
  idGarcom?: number;
  idCozinheiro?: number | null;
  tempoEstimado?: number;
  itens: ItemPedidoInputDto[];
}
