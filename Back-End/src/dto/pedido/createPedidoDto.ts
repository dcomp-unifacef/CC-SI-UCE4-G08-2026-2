// Reutiliza o formato compacto de produto/quantidade aceito em cada linha do pedido.
import { ItemPedidoInputDto } from "./itemPedidoDto";

// Contrato de criação recebido pelo controller e validado pelo pedidoService.
export interface CreatePedidoDto {
  // Cliente associado ao pedido.
  idCliente: number;
  // Atendimento pode associar garçom e cozinheiro; os campos são opcionais na entrada.
  idGarcom?: number;
  idCozinheiro?: number | null;
  // Estimativa em minutos e itens que compõem a comanda.
  tempoEstimado?: number;
  itens: ItemPedidoInputDto[];
}
