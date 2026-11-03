import assert from "node:assert/strict";
import { test } from "node:test";
import {
  decidirCriacao,
  isPedidoAtivo,
  podeEditarItens,
} from "../src/utils/pedidoRules";

test("isPedidoAtivo aceita todos os status menos Pago e Cancelado", () => {
  for (const status of ["Aberto", "Em preparo", "Pronto", "Entregue"]) {
    assert.equal(isPedidoAtivo(status), true);
  }

  assert.equal(isPedidoAtivo("Pago"), false);
  assert.equal(isPedidoAtivo("Cancelado"), false);
});

test("podeEditarItens só aceita Aberto", () => {
  assert.equal(podeEditarItens("Aberto"), true);
  assert.equal(podeEditarItens("Em preparo"), false);
  assert.equal(podeEditarItens("Pronto"), false);
});

test("sem pedido ativo a criação segue", () => {
  assert.deepEqual(decidirCriacao(null, { ehCliente: true }), { tipo: "criar" });
  assert.deepEqual(decidirCriacao(null, { ehCliente: false }), { tipo: "criar" });
});

test("cliente entra em pedido da mesa sem cliente enquanto está Aberto", () => {
  const ativo = { idPedido: 7, idCliente: null, statusPedido: "Aberto" };

  assert.deepEqual(decidirCriacao(ativo, { ehCliente: true }), {
    tipo: "entrar",
    idPedido: 7,
  });
});

test("cliente não entra em pedido sem cliente já em preparo", () => {
  const ativo = { idPedido: 7, idCliente: null, statusPedido: "Em preparo" };

  assert.deepEqual(decidirCriacao(ativo, { ehCliente: true }), {
    tipo: "conflito",
    idPedido: 7,
  });
});

test("pedido de outro cliente ou criado por staff é conflito", () => {
  const deOutroCliente = { idPedido: 8, idCliente: 3, statusPedido: "Aberto" };
  const semCliente = { idPedido: 9, idCliente: null, statusPedido: "Aberto" };

  assert.deepEqual(decidirCriacao(deOutroCliente, { ehCliente: true }), {
    tipo: "conflito",
    idPedido: 8,
  });
  assert.deepEqual(decidirCriacao(semCliente, { ehCliente: false }), {
    tipo: "conflito",
    idPedido: 9,
  });
});
