// Testes do cliente HTTP: verificam a montagem de requisições e o tratamento de respostas e erros da API.
// Importa as ferramentas de teste; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import { afterEach, test, expect, vi } from "vitest";
// Importa o módulo ./client, que fornece dependências usadas neste arquivo; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import { apiFetch, definirToken } from "./client";

afterEach(() => {
  definirToken(null);
  vi.unstubAllGlobals();
});

test("apiFetch envia o token e devolve o JSON", async () => {
  // Declara valor fetchFalso, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
  const fetchFalso = vi.fn(async () =>
    new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }),
  );
  vi.stubGlobal("fetch", fetchFalso);
  definirToken("abc");

  await expect(apiFetch("/pedidos")).resolves.toEqual({ ok: true });

  // Declara valor call, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
  const call = fetchFalso.mock.calls[0] as unknown as [unknown, { headers?: unknown }];
  // Declara valor opcoes, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
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
