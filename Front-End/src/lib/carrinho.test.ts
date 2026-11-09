import { expect, test } from "vitest";
import {
  adicionarItem,
  alterarQuantidade,
  calcularPrevia,
  removerItem,
} from "./carrinho";

const produto = { idProduto: 2, nome: "X-Salada", preco: "18.90" };

test("adicionarItem soma quantidade do mesmo produto", () => {
  const uma = adicionarItem([], produto);
  const duas = adicionarItem(uma, produto);

  expect(duas).toHaveLength(1);
  expect(duas[0].quantidade).toBe(2);
});

test("alterarQuantidade para zero remove o item", () => {
  const itens = adicionarItem([], produto, 3);

  expect(alterarQuantidade(itens, 2, 0)).toEqual([]);
  expect(removerItem(itens, 2)).toEqual([]);
});

test("calcularPrevia soma e arredonda em duas casas", () => {
  const itens = [
    { idProduto: 1, nome: "A", preco: 0.1, quantidade: 1, imagem: "" },
    { idProduto: 2, nome: "B", preco: 0.2, quantidade: 1, imagem: "" },
  ];

  expect(calcularPrevia(itens)).toBe(0.3);
});
