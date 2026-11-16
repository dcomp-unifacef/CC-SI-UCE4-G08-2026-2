// Forma de entrada de um item: o preço vem do cadastro do produto, não do cliente.
export interface ItemPedidoInputDto {
  idProduto: number;
  quantidade: number;
}

// Dados editáveis de uma linha existente; o service preserva o preço vigente do item.
export interface UpdateItemPedidoDto {
  quantidade: number;
}
