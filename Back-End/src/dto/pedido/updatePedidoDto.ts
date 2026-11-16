// Reutiliza a entrada comum dos itens que podem ser substituídos no pedido.
import { ItemPedidoInputDto } from "./itemPedidoDto";

// Contrato parcial usado na edição de pedido pelo controller e pelo service.
export interface UpdatePedidoDto {
  // Associações opcionais que podem ser ajustadas enquanto o pedido está pendente.
  idCliente?: number;
  idGarcom?: number;
  idCozinheiro?: number | null;
  // A estimativa pode ser removida explicitamente; itens substituem a lista existente.
  tempoEstimado?: number | null;
  itens?: ItemPedidoInputDto[];
}
