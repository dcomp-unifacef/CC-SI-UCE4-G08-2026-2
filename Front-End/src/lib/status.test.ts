import { expect, test } from "vitest";
import { acoesDeStatus, pedidoAtivo, podeEditarItens } from "./status";

test("pedidoAtivo ignora Pago e Cancelado", () => {
  expect(pedidoAtivo("Aberto")).toBe(true);
  expect(pedidoAtivo("Em preparo")).toBe(true);
  expect(pedidoAtivo("Pago")).toBe(false);
  expect(pedidoAtivo("Cancelado")).toBe(false);
});

test("podeEditarItens só em Aberto", () => {
  expect(podeEditarItens("Aberto")).toBe(true);
  expect(podeEditarItens("Em preparo")).toBe(false);
});

test("ações de status seguem as transições do back", () => {
  expect(acoesDeStatus("Aberto").map((a) => a.novoStatus)).toEqual(["Em preparo", "Cancelado"]);
  expect(acoesDeStatus("Em preparo").map((a) => a.novoStatus)).toEqual(["Pronto", "Cancelado"]);
  expect(acoesDeStatus("Pronto").map((a) => a.novoStatus)).toEqual(["Entregue", "Cancelado"]);
  expect(acoesDeStatus("Entregue").map((a) => a.novoStatus)).toEqual(["Cancelado"]);
  expect(acoesDeStatus("Pago")).toEqual([]);
  expect(acoesDeStatus("Cancelado")).toEqual([]);
});
