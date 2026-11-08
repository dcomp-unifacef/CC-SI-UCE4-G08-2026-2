import type { RespostaLogin } from "../types/api";

export class ApiError extends Error {
  status: number;
  detalhes?: Record<string, unknown>;

  constructor(status: number, message: string, detalhes?: Record<string, unknown>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.detalhes = detalhes;
  }
}

let tokenAtual: string | null = null;
let tratadorSessaoExpirada: (() => void) | null = null;

export function definirToken(token: string | null) {
  tokenAtual = token;
}

export function definirTratadorSessaoExpirada(handler: (() => void) | null) {
  tratadorSessaoExpirada = handler;
}

const BASE =
  (import.meta.env.VITE_API_URL as string | undefined) ?? "/api";

export async function apiFetch<T>(
  caminho: string,
  opcoes: RequestInit = {},
): Promise<T> {
  const headers = new Headers(opcoes.headers ?? {});

  if (opcoes.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (tokenAtual) {
    headers.set("Authorization", `Bearer ${tokenAtual}`);
  }

  const resposta = await fetch(`${BASE}${caminho}`, { ...opcoes, headers });

  if (resposta.status === 204) {
    return undefined as T;
  }

  let dados: unknown = null;

  const texto = await resposta.text();

  if (texto) {
    try {
      dados = JSON.parse(texto);
    } catch {
      dados = null;
    }
  }

  if (!resposta.ok) {
    if (resposta.status === 401 && tratadorSessaoExpirada) {
      tratadorSessaoExpirada();
    }

    const corpo = (dados ?? {}) as Record<string, unknown>;
    const { erro, ...detalhes } = corpo;
    throw new ApiError(
      resposta.status,
      typeof erro === "string" ? erro : "Falha na requisição.",
      Object.keys(detalhes).length ? detalhes : undefined,
    );
  }

  return dados as T;
}

export { type RespostaLogin };
