import assert from "node:assert/strict";
import { test } from "node:test";
import { AppError } from "../src/errors/AppError";
import { formatarErro } from "../src/utils/httpError";

test("formatarErro espalha os detalhes do AppError", () => {
  const resultado = formatarErro(
    new AppError("Mesa ocupada.", 409, { idPedido: 7 }),
  );

  assert.equal(resultado.status, 409);
  assert.deepEqual(resultado.body, { erro: "Mesa ocupada.", idPedido: 7 });
});

test("formatarErro mantém o corpo simples quando não há detalhes", () => {
  const resultado = formatarErro(new AppError("Não encontrado.", 404));

  assert.deepEqual(resultado.body, { erro: "Não encontrado." });
});

test("formatarErro traduz JSON inválido e erro desconhecido", () => {
  const json = Object.assign(new SyntaxError("Unexpected token"), { body: {} });

  assert.deepEqual(formatarErro(json), {
    status: 400,
    body: { erro: "JSON inválido no corpo da requisição." },
  });
  assert.deepEqual(formatarErro(new Error("boom")), {
    status: 500,
    body: { erro: "Erro interno do servidor." },
  });
});
