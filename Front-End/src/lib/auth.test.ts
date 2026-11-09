import { expect, test } from "vitest";
import { podeAcessarRota, rotaInicialPorTipo } from "./auth";

test("cada perfil cai na sua rota inicial", () => {
  expect(rotaInicialPorTipo("Garçom")).toBe("/garcom");
  expect(rotaInicialPorTipo("Administrador")).toBe("/admin");
  expect(rotaInicialPorTipo("Cozinheiro")).toBe("/cozinha");
  expect(rotaInicialPorTipo("Cliente")).toBe("/cliente");
  expect(rotaInicialPorTipo("Desconhecido")).toBe("/login");
});

test("a guarda bloqueia rotas de outro perfil", () => {
  expect(podeAcessarRota("Garçom", "/garcom/pedidos/4")).toBe(true);
  expect(podeAcessarRota("Administrador", "/garcom/novo")).toBe(true);
  expect(podeAcessarRota("Administrador", "/admin")).toBe(true);
  expect(podeAcessarRota("Administrador", "/admin/qualquer-coisa")).toBe(true);
  expect(podeAcessarRota("Garçom", "/admin")).toBe(false);
  expect(podeAcessarRota("Cozinheiro", "/cozinha")).toBe(true);
  expect(podeAcessarRota("Cliente", "/cliente")).toBe(true);

  expect(podeAcessarRota("Cliente", "/garcom")).toBe(false);
  expect(podeAcessarRota("Cozinheiro", "/cliente")).toBe(false);
  expect(podeAcessarRota("Garçom", "/cozinha")).toBe(false);
  expect(podeAcessarRota("Cliente", "/desconhecido")).toBe(false);
});
