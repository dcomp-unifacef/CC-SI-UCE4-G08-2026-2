// Adaptadores de saída entre tipos numéricos Decimal do Prisma e JSON da API.
// São usados por services para manter formato consistente em pedidos, itens, pagamentos e produtos.
// Converte valor monetário/numérico devolvido pelo banco para number, preservando null e undefined.
function toNumber(value: any): any {
  if (value === null || value === undefined) return value;
  if (typeof value === "object" && typeof value.toNumber === "function") {
    return value.toNumber();
  }
  return Number(value);
}

// Normaliza preço do produto e preserva demais propriedades selecionadas pelo repository.
export function serializeProduto(produto: any) {
  if (!produto) return produto;
  return {
    ...produto,
    preco: toNumber(produto.preco),
  };
}

// Normaliza valor do pagamento para resposta HTTP.
export function serializePagamento(pagamento: any) {
  if (!pagamento) return pagamento;
  return {
    ...pagamento,
    valor: toNumber(pagamento.valor),
  };
}

// Normaliza preço e subtotal do item e também serializa o produto relacionado.
export function serializeItemPedido(item: any) {
  if (!item) return item;
  return {
    ...item,
    valorUnit: toNumber(item.valorUnit),
    subTotal: toNumber(item.subTotal),
    produto: serializeProduto(item.produto),
  };
}

// Serializa total, itens e pagamento associados, mantendo outras relações do pedido intactas.
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

// Aplica serialização de pedido a cada elemento retornado pela consulta de lista.
export function serializeListaPedidos(pedidos: any[]) {
  return pedidos.map(serializePedido);
}
