import type { UsuarioLogado } from "../types/api";

export interface Sessao {
  usuario: UsuarioLogado;
  token: string;
}

const CHAVE = "chicdog.sessao";

export function lerSessao(): Sessao | null {
  if (typeof window === "undefined") return null;
  try {
    const bruto = window.localStorage.getItem(CHAVE);
    if (!bruto) return null;
    const parsed = JSON.parse(bruto) as Sessao;
    if (!parsed?.usuario || !parsed?.token) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function salvarSessao(sessao: Sessao) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CHAVE, JSON.stringify(sessao));
}

export function limparSessao() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(CHAVE);
}
