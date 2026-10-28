export interface CreateItemPedidoDto {
  idProduto: number;
  quantidade: number;
}

export interface CreatePedidoDto {
  idCliente: number;
  idGarcom: number;
  statusPedido?: string;
  itens: CreateItemPedidoDto[];
}
