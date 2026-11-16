// Testes das transformações e validações do formulário de pedido.
// Importa as ferramentas de teste; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import { expect, test } from "vitest";
// Importa o módulo ./pedidoForm, que fornece dependências usadas neste arquivo; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import { validarNovoPedido } from "./pedidoForm";

// Declara valor item, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
const item = { idProduto: 1, nome: "A", preco: 10, quantidade: 1, imagem: "" };

test("exige mesa válida, carrinho e garçom quando necessário", () => {
  expect(validarNovoPedido({ numeroMesa: 0, idGarcom: null, itens: [item], exigeGarcom: false })).toMatch(/mesa/i);
  expect(validarNovoPedido({ numeroMesa: 4, idGarcom: null, itens: [], exigeGarcom: false })).toMatch(/item/i);
  expect(validarNovoPedido({ numeroMesa: 4, idGarcom: null, itens: [item], exigeGarcom: true })).toMatch(/garçom/i);
  expect(validarNovoPedido({ numeroMesa: 4, idGarcom: null, itens: [item], exigeGarcom: false })).toBeNull();
});
