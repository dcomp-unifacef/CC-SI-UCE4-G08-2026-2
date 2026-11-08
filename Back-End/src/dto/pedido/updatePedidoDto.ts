import { ItemPedidoInputDto } from "./itemPedidoDto";

export interface UpdatePedidoDto {
  idCliente?: number;
  idGarcom?: number;
  idCozinheiro?: number | null;
  tempoEstimado?: number | null;
  itens?: ItemPedidoInputDto[];
}
