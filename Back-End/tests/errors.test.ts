import assert from "node:assert/strict";
import { test } from "node:test";
import { AppError } from "../src/errors/AppError";
import { NotFoundError } from "../src/errors/NotFoundError";

test("AppError guarda mensagem e status", () => {
  const error = new AppError("Falha controlada.", 409);

  assert.equal(error.message, "Falha controlada.");
  assert.equal(error.statusCode, 409);
  assert.equal(error.name, "AppError");
  assert.ok(error instanceof Error);
});

test("NotFoundError usa status 404", () => {
  const error = new NotFoundError();

  assert.equal(error.statusCode, 404);
  assert.equal(error.name, "NotFoundError");
});
