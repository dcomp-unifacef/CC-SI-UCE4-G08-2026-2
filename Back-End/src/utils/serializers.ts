function toNumber(value: any): any {
  if (value === null || value === undefined) return value;
  if (typeof value === "object" && typeof value.toNumber === "function") {
    return value.toNumber();
  }
  return Number(value);
}

export function serializeProduto(produto: any) {
  if (!produto) return produto;
  return {
    ...produto,
    preco: toNumber(produto.preco),
  };
}

export function serializePagamento(pagamento: any) {
  if (!pagamento) return pagamento;
  return {
    ...pagamento,
    valor: toNumber(pagamento.valor),
  };
}

export function serializeItemPedido(item: any) {
  if (!item) return item;
  return {
    ...item,
    valorUnit: toNumber(item.valorUnit),
    subTotal: toNumber(item.subTotal),
    produto: serializeProduto(item.produto),
  };
}

export function serializePedido(pedido: any) {
  if (!pedido) return pedido;
  return {
    ...pedido,
    valorTotal: toNumber(pedido.valorTotal),
    itens: Array.isArray(pedido.itens)
      ? pedido.itens.map(serializeItemPedido)
      : pedido.itens,
    pagamento: serializePagamento(pedido.pagamento),
  };
}

export function serializeListaPedidos(pedidos: any[]) {
  return pedidos.map(serializePedido);
}
