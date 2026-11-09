export interface ItemCarrinho {
  idProduto: number;
  nome: string;
  preco: number;
  imagem: string;
  quantidade: number;
}

import { resolverImagem } from "./imagens";

export function adicionarItem(
  itens: ItemCarrinho[],
  produto: {
    idProduto: number;
    nome: string;
    preco: string | number;
    imagem?: string;
  },
  quantidade = 1,
): ItemCarrinho[] {
  const preco = Number(produto.preco);
  const existente = itens.find((i) => i.idProduto === produto.idProduto);

  if (existente) {
    return itens.map((i) =>
      i.idProduto === produto.idProduto
        ? { ...i, quantidade: i.quantidade + quantidade }
        : i,
    );
  }

  return [
    ...itens,
    {
      idProduto: produto.idProduto,
      nome: produto.nome,
      preco,
      imagem: resolverImagem(produto.nome, produto.imagem),
      quantidade,
    },
  ];
}

export function alterarQuantidade(
  itens: ItemCarrinho[],
  idProduto: number,
  quantidade: number,
): ItemCarrinho[] {
  if (quantidade <= 0) {
    return itens.filter((i) => i.idProduto !== idProduto);
  }
  return itens.map((i) =>
    i.idProduto === idProduto ? { ...i, quantidade } : i,
  );
}

export function removerItem(itens: ItemCarrinho[], idProduto: number): ItemCarrinho[] {
  return itens.filter((i) => i.idProduto !== idProduto);
}

export function calcularPrevia(itens: ItemCarrinho[]): number {
  const total = itens.reduce((acc, i) => acc + i.preco * i.quantidade, 0);
  return Number(total.toFixed(2));
}
