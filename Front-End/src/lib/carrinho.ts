// Operações puras para inserir, alterar, remover e totalizar itens do carrinho da interface cliente.
// Declara contrato de dados ItemCarrinho, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
export interface ItemCarrinho {
  idProduto: number;
  nome: string;
  preco: number;
  imagem: string;
  quantidade: number;
}

// Importa o módulo ./imagens, que fornece dependências usadas neste arquivo; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import { resolverImagem } from "./imagens";

// Declara função adicionarItem, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
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
  // Declara valor preco, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
  const preco = Number(produto.preco);
  // Declara valor existente, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
  const existente = itens.find((i) => i.idProduto === produto.idProduto);

  // Verifica a condição do fluxo para decidir se os dados e a navegação devem seguir por este ramo.
  if (existente) {
    // Retorna o resultado/renderização desta etapa ao componente ou chamador que coordena o fluxo.
    return itens.map((i) =>
      i.idProduto === produto.idProduto
        ? { ...i, quantidade: i.quantidade + quantidade }
        : i,
    );
  }

  // Retorna o resultado/renderização desta etapa ao componente ou chamador que coordena o fluxo.
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

// Declara função alterarQuantidade, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
export function alterarQuantidade(
  itens: ItemCarrinho[],
  idProduto: number,
  quantidade: number,
): ItemCarrinho[] {
  // Verifica a condição do fluxo para decidir se os dados e a navegação devem seguir por este ramo.
  if (quantidade <= 0) {
    // Retorna o resultado/renderização desta etapa ao componente ou chamador que coordena o fluxo.
    return itens.filter((i) => i.idProduto !== idProduto);
  }
  // Retorna o resultado/renderização desta etapa ao componente ou chamador que coordena o fluxo.
  return itens.map((i) =>
    i.idProduto === idProduto ? { ...i, quantidade } : i,
  );
}

// Declara função removerItem, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
export function removerItem(itens: ItemCarrinho[], idProduto: number): ItemCarrinho[] {
  // Retorna o resultado/renderização desta etapa ao componente ou chamador que coordena o fluxo.
  return itens.filter((i) => i.idProduto !== idProduto);
}

// Declara função calcularPrevia, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
export function calcularPrevia(itens: ItemCarrinho[]): number {
  // Declara valor total, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
  const total = itens.reduce((acc, i) => acc + i.preco * i.quantidade, 0);
  // Retorna o resultado/renderização desta etapa ao componente ou chamador que coordena o fluxo.
  return Number(total.toFixed(2));
}
