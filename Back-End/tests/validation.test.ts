import assert from "node:assert/strict";
import { test } from "node:test";
import { AppError } from "../src/errors/AppError";
import {
  getObjectData,
  validatePositiveInt,
  validateText,
} from "../src/utils/validation";

test("validateText remove espaços e aceita texto válido", () => {
  assert.equal(validateText("  Cachorro-quente  ", "nome", 80), "Cachorro-quente");
});

test("validateText rejeita texto vazio e texto longo", () => {
  assert.throws(() => validateText("   ", "nome", 80), AppError);
  assert.throws(() => validateText("a".repeat(81), "nome", 80), AppError);
});

test("validatePositiveInt aceita inteiros positivos e rejeita inválidos", () => {
  assert.equal(validatePositiveInt(3, "id"), 3);
  assert.throws(() => validatePositiveInt(0, "id"), AppError);
  assert.throws(() => validatePositiveInt(-1, "id"), AppError);
  assert.throws(() => validatePositiveInt(1.5, "id"), AppError);
  assert.throws(() => validatePositiveInt("1", "id"), AppError);
});

test("getObjectData rejeita null, listas e primitivos", () => {
  assert.deepEqual(getObjectData({ nome: "Ana" }), { nome: "Ana" });
  assert.throws(() => getObjectData(null), AppError);
  assert.throws(() => getObjectData([]), AppError);
  assert.throws(() => getObjectData("texto"), AppError);
});
