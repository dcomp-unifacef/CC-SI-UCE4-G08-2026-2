import { test } from "node:test";
import assert from "node:assert/strict";
import {
  calcularSubtotal,
  calcularTotal,
  podeEditarPedido,
  podeTransicionar,
  perfilPodeAlterarStatus,
  round2,
  statusPagamentoValido,
  statusPedidoValido,
} from "../src/domain/pedidoRules";
import { PERFIS } from "../src/domain/perfis";

test("valida os status permitidos de pedido", () => {
  assert.equal(statusPedidoValido("Pendente"), true);
  assert.equal(statusPedidoValido("Em preparo"), true);
  assert.equal(statusPedidoValido("Entregue"), true);
  assert.equal(statusPedidoValido("Finalizado"), false);
  assert.equal(statusPedidoValido(1), false);
});

test("valida os status permitidos de pagamento", () => {
  assert.equal(statusPagamentoValido("Pago"), true);
  assert.equal(statusPagamentoValido("Pendente"), true);
  assert.equal(statusPagamentoValido("Atrasado"), false);
});

test("respeita as transições do fluxo de pedido", () => {
  assert.equal(podeTransicionar("Pendente", "Em preparo"), true);
  assert.equal(podeTransicionar("Em preparo", "Pronto"), true);
  assert.equal(podeTransicionar("Pronto", "Entregue"), true);
  assert.equal(podeTransicionar("Entregue", "Cancelado"), false);
  assert.equal(podeTransicionar("Cancelado", "Pendente"), false);
  assert.equal(podeTransicionar("Pendente", "Entregue"), false);
});

test("só permite editar pedidos pendentes", () => {
  assert.equal(podeEditarPedido("Pendente"), true);
  assert.equal(podeEditarPedido("Em preparo"), false);
  assert.equal(podeEditarPedido("Cancelado"), false);
});

test("garçom envia para preparo e cancela apenas pedido pendente", () => {
  assert.equal(
    perfilPodeAlterarStatus(PERFIS.GARCOM, "Pendente", "Em preparo"),
    true,
  );
  assert.equal(
    perfilPodeAlterarStatus(PERFIS.GARCOM, "Pendente", "Cancelado"),
    true,
  );
  assert.equal(
    perfilPodeAlterarStatus(PERFIS.GARCOM, "Em preparo", "Cancelado"),
    false,
  );
  assert.equal(
    perfilPodeAlterarStatus(PERFIS.GARCOM, "Em preparo", "Pronto"),
    false,
  );
});

test("cozinheiro inicia e conclui a preparação", () => {
  assert.equal(
    perfilPodeAlterarStatus(PERFIS.COZINHEIRO, "Pendente", "Em preparo"),
    true,
  );
  assert.equal(
    perfilPodeAlterarStatus(PERFIS.COZINHEIRO, "Em preparo", "Pronto"),
    true,
  );
  assert.equal(
    perfilPodeAlterarStatus(PERFIS.COZINHEIRO, "Em preparo", "Cancelado"),
    false,
  );
});

test("gerente e administrador podem executar qualquer transição válida", () => {
  assert.equal(
    perfilPodeAlterarStatus(PERFIS.GERENTE, "Em preparo", "Cancelado"),
    true,
  );
  assert.equal(
    perfilPodeAlterarStatus(PERFIS.ADMINISTRADOR, "Pronto", "Entregue"),
    true,
  );
});

test("calcula subtotais e total com arredondamento de centavos", () => {
  assert.equal(round2(10.005), 10.01);
  assert.equal(calcularSubtotal(12.5, 2), 25);
  assert.equal(calcularSubtotal(18.9, 3), 56.7);
  assert.equal(
    calcularTotal([{ subTotal: 25 }, { subTotal: 56.7 }, { subTotal: 6 }]),
    87.7,
  );
});
