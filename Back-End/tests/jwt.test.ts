import assert from "node:assert/strict";
import { test } from "node:test";

process.env.DATABASE_URL ??= "postgresql://postgres:prompt_solutions@localhost:5432/chicdog";
process.env.JWT_SECRET ??= "segredo-de-teste";

const { signToken, verifyToken } = require("../src/utils/jwt") as typeof import("../src/utils/jwt");

test("assina e verifica um token válido", () => {
  const token = signToken({ idUsuario: 7, tipo: "Administrador" });
  const payload = verifyToken(token);

  assert.equal(payload.idUsuario, 7);
  assert.equal(payload.tipo, "Administrador");
});

test("rejeita token adulterado", () => {
  const token = signToken({ idUsuario: 7, tipo: "Administrador" });
  const adulterado = `${token}alterado`;

  assert.throws(() => verifyToken(adulterado));
});

test("rejeita token assinado com outro segredo", () => {
  const { sign } = require("jsonwebtoken") as typeof import("jsonwebtoken");
  const token = sign({ tipo: "Administrador" }, "outro-segredo", {
    subject: "7",
  });

  assert.throws(() => verifyToken(token));
});
