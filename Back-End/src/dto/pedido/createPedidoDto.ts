export interface CreateItemPedidoDto {
  idProduto: number;
  quantidade: number;
}

export interface CreatePedidoDto {
  numeroMesa: number;
  idCliente?: number;
  idGarcom?: number;
  statusPedido?: string;
  itens: CreateItemPedidoDto[];
}
