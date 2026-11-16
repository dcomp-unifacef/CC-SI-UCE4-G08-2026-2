// Runner nativo do Node cria casos de teste para regras puras do domínio.
import { test } from "node:test";
// Asserções estritas verificam valores e tipos sem coerção.
import assert from "node:assert/strict";
// Funções sob teste representam estados, permissões e cálculos usados pelo pedidoService.
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
// Perfis de domínio usados para verificar a matriz de autorização das transições.
import { PERFIS } from "../src/domain/perfis";

// Verifica que apenas status reconhecidos e textuais passam na validação de pedido.
test("valida os status permitidos de pedido", () => {
  assert.equal(statusPedidoValido("Pendente"), true);
  assert.equal(statusPedidoValido("Em preparo"), true);
  assert.equal(statusPedidoValido("Entregue"), true);
  assert.equal(statusPedidoValido("Finalizado"), false);
  assert.equal(statusPedidoValido(1), false);
});

// Garante que pagamentos rejeitem estados fora do vocabulário de domínio.
test("valida os status permitidos de pagamento", () => {
  assert.equal(statusPagamentoValido("Pago"), true);
  assert.equal(statusPagamentoValido("Pendente"), true);
  assert.equal(statusPagamentoValido("Atrasado"), false);
});

// Confere transições válidas, terminais e saltos não permitidos entre etapas do pedido.
test("respeita as transições do fluxo de pedido", () => {
  assert.equal(podeTransicionar("Pendente", "Em preparo"), true);
  assert.equal(podeTransicionar("Em preparo", "Pronto"), true);
  assert.equal(podeTransicionar("Pronto", "Entregue"), true);
  assert.equal(podeTransicionar("Entregue", "Cancelado"), false);
  assert.equal(podeTransicionar("Cancelado", "Pendente"), false);
  assert.equal(podeTransicionar("Pendente", "Entregue"), false);
});

// Confirma que conteúdo do pedido só pode ser editado antes do preparo.
test("só permite editar pedidos pendentes", () => {
  assert.equal(podeEditarPedido("Pendente"), true);
  assert.equal(podeEditarPedido("Em preparo"), false);
  assert.equal(podeEditarPedido("Cancelado"), false);
});

// Exercita permissões próprias do garçom para encaminhar e cancelar pedidos.
test("garçom envia para preparo e cancela pedidos (com motivo)", () => {
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
    true,
  );
  assert.equal(
    perfilPodeAlterarStatus(PERFIS.GARCOM, "Em preparo", "Pronto"),
    false,
  );
});

// Exercita permissões do cozinheiro para iniciar, concluir e cancelar preparo.
test("cozinheiro inicia, conclui e cancela a preparação (com motivo)", () => {
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
    true,
  );
});

// Garante que gerente e administrador possam executar qualquer transição que seja válida.
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

// Verifica arredondamento monetário e soma de subtotais usada na comanda.
test("calcula subtotais e total com arredondamento de centavos", () => {
  assert.equal(round2(10.005), 10.01);
  assert.equal(calcularSubtotal(12.5, 2), 25);
  assert.equal(calcularSubtotal(18.9, 3), 56.7);
  assert.equal(
    calcularTotal([{ subTotal: 25 }, { subTotal: 56.7 }, { subTotal: 6 }]),
    87.7,
  );
});
