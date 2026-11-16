// Testes das regras de leitura e validação da mesa configurada para o tablet.
// Importa as ferramentas de teste; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import { expect, test } from "vitest";
// Importa o módulo ./mesa, que fornece dependências usadas neste arquivo; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import { mesaDaUrl, resolverMesa, validarMesa } from "./mesa";

test("validarMesa aceita apenas inteiro positivo", () => {
  expect(validarMesa("4")).toBe(4);
  expect(validarMesa("0")).toBeNull();
  expect(validarMesa("-1")).toBeNull();
  expect(validarMesa("abc")).toBeNull();
  expect(validarMesa("")).toBeNull();
});

test("mesaDaUrl lê ?mesa=", () => {
  expect(mesaDaUrl("?mesa=3")).toBe(3);
  expect(mesaDaUrl("?outro=1")).toBeNull();
  expect(mesaDaUrl("?mesa=0")).toBeNull();
});

test("URL vence o valor guardado", () => {
  expect(resolverMesa("?mesa=5", "3")).toBe(5);
  expect(resolverMesa("", "3")).toBe(3);
  expect(resolverMesa("", null)).toBeNull();
});
