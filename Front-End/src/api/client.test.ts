import { afterEach, test, expect, vi } from "vitest";
import { apiFetch, definirToken } from "./client";

afterEach(() => {
  definirToken(null);
  vi.unstubAllGlobals();
});

test("apiFetch envia o token e devolve o JSON", async () => {
  const fetchFalso = vi.fn(async () =>
    new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }),
  );
  vi.stubGlobal("fetch", fetchFalso);
  definirToken("abc");

  await expect(apiFetch("/pedidos")).resolves.toEqual({ ok: true });

  const call = fetchFalso.mock.calls[0] as unknown as [unknown, { headers?: unknown }];
  const opcoes = call[1];
  expect(new Headers(opcoes?.headers as HeadersInit).get("Authorization")).toBe("Bearer abc");
});

test("apiFetch transforma erro do back em ApiError com detalhes", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () =>
      new Response(JSON.stringify({ erro: "Mesa ocupada.", idPedido: 7 }), {
        status: 409,
        headers: { "Content-Type": "application/json" },
      }),
    ),
  );

  await expect(apiFetch("/pedidos", { method: "POST", body: "{}" })).rejects.toEqual(
    expect.objectContaining({
      status: 409,
      message: "Mesa ocupada.",
      detalhes: { idPedido: 7 },
    }),
  );
});
