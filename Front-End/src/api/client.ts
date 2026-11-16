// Cliente HTTP comum: injeta token, centraliza URL, parsing de respostas e tratamento de sessão expirada para os adaptadores da API.
// Importa os contratos de dados usados entre interface e API; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import type { RespostaLogin } from "../types/api";

// Declara classe ApiError, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
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

// Declara estado mutável tokenAtual, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
let tokenAtual: string | null = null;
// Declara estado mutável tratadorSessaoExpirada, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
let tratadorSessaoExpirada: (() => void) | null = null;

// Declara função definirToken, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
export function definirToken(token: string | null) {
  tokenAtual = token;
}

// Declara função definirTratadorSessaoExpirada, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
export function definirTratadorSessaoExpirada(handler: (() => void) | null) {
  tratadorSessaoExpirada = handler;
}

// Declara valor BASE, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
const BASE =
  (import.meta.env.VITE_API_URL as string | undefined) ?? "/api";

// Declara função apiFetch, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
export async function apiFetch<T>(
  caminho: string,
  opcoes: RequestInit = {},
): Promise<T> {
  // Declara valor headers, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
  const headers = new Headers(opcoes.headers ?? {});

  // Verifica a condição do fluxo para decidir se os dados e a navegação devem seguir por este ramo.
  if (opcoes.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  // Verifica a condição do fluxo para decidir se os dados e a navegação devem seguir por este ramo.
  if (tokenAtual) {
    headers.set("Authorization", `Bearer ${tokenAtual}`);
  }

  // Declara valor resposta, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
  const resposta = await fetch(`${BASE}${caminho}`, { ...opcoes, headers });

  // Verifica a condição do fluxo para decidir se os dados e a navegação devem seguir por este ramo.
  if (resposta.status === 204) {
    // Retorna o resultado/renderização desta etapa ao componente ou chamador que coordena o fluxo.
    return undefined as T;
  }

  // Declara estado mutável dados, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
  let dados: unknown = null;

  // Declara valor texto, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
  const texto = await resposta.text();

  // Verifica a condição do fluxo para decidir se os dados e a navegação devem seguir por este ramo.
  if (texto) {
    // Executa a operação sujeita a falhas, como uma chamada à API ou interação com o navegador.
    try {
      dados = JSON.parse(texto);
    } catch {
      dados = null;
    }
  }

  // Verifica a condição do fluxo para decidir se os dados e a navegação devem seguir por este ramo.
  if (!resposta.ok) {
    // Verifica a condição do fluxo para decidir se os dados e a navegação devem seguir por este ramo.
    if (resposta.status === 401 && tratadorSessaoExpirada) {
      tratadorSessaoExpirada();
    }

    // Declara valor corpo, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
    const corpo = (dados ?? {}) as Record<string, unknown>;
    // Define a exportação pública deste módulo para integração com as demais partes da aplicação.
    const { erro, ...detalhes } = corpo;
    // Propaga a falha para que o chamador ou a interface possa tratá-la.
    throw new ApiError(
      resposta.status,
      typeof erro === "string" ? erro : "Falha na requisição.",
      Object.keys(detalhes).length ? detalhes : undefined,
    );
  }

  // Retorna o resultado/renderização desta etapa ao componente ou chamador que coordena o fluxo.
  return dados as T;
}

// Expõe o componente, tipo ou valor que integra este módulo ao restante da aplicação.
export { type RespostaLogin };
