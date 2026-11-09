import { expect, test } from "vitest";
import { validarNovoPedido } from "./pedidoForm";

const item = { idProduto: 1, nome: "A", preco: 10, quantidade: 1, imagem: "" };

test("exige mesa válida, carrinho e garçom quando necessário", () => {
  expect(validarNovoPedido({ numeroMesa: 0, idGarcom: null, itens: [item], exigeGarcom: false })).toMatch(/mesa/i);
  expect(validarNovoPedido({ numeroMesa: 4, idGarcom: null, itens: [], exigeGarcom: false })).toMatch(/item/i);
  expect(validarNovoPedido({ numeroMesa: 4, idGarcom: null, itens: [item], exigeGarcom: true })).toMatch(/garçom/i);
  expect(validarNovoPedido({ numeroMesa: 4, idGarcom: null, itens: [item], exigeGarcom: false })).toBeNull();
});
