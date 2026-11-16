// Testes das operações puras do carrinho utilizadas pela tela de pedidos do cliente.
// Importa as ferramentas de teste; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import { expect, test } from "vitest";
// Importa o módulo ./carrinho, que fornece dependências usadas neste arquivo; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import {
  adicionarItem,
  alterarQuantidade,
  calcularPrevia,
  removerItem,
} from "./carrinho";

// Declara valor produto, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
const produto = { idProduto: 2, nome: "X-Salada", preco: "18.90" };

test("adicionarItem soma quantidade do mesmo produto", () => {
  // Declara valor uma, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
  const uma = adicionarItem([], produto);
  // Declara valor duas, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
  const duas = adicionarItem(uma, produto);

  expect(duas).toHaveLength(1);
  expect(duas[0].quantidade).toBe(2);
});

test("alterarQuantidade para zero remove o item", () => {
  // Declara valor itens, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
  const itens = adicionarItem([], produto, 3);

  expect(alterarQuantidade(itens, 2, 0)).toEqual([]);
  expect(removerItem(itens, 2)).toEqual([]);
});

test("calcularPrevia soma e arredonda em duas casas", () => {
  // Declara valor itens, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
  const itens = [
    { idProduto: 1, nome: "A", preco: 0.1, quantidade: 1, imagem: "" },
    { idProduto: 2, nome: "B", preco: 0.2, quantidade: 1, imagem: "" },
  ];

  expect(calcularPrevia(itens)).toBe(0.3);
});
