// Persistência da sessão autenticada no navegador, consumida pelo AuthContext e pelo cliente HTTP.
// Importa os contratos de dados usados entre interface e API; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import type { UsuarioLogado } from "../types/api";

// Declara contrato de dados Sessao, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
export interface Sessao {
  usuario: UsuarioLogado;
  token: string;
}

// Declara valor CHAVE, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
const CHAVE = "chicdog.sessao";

// Declara função lerSessao, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
export function lerSessao(): Sessao | null {
  // Verifica a condição do fluxo para decidir se os dados e a navegação devem seguir por este ramo.
  if (typeof window === "undefined") return null;
  // Executa a operação sujeita a falhas, como uma chamada à API ou interação com o navegador.
  try {
    // Declara valor bruto, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
    const bruto = window.localStorage.getItem(CHAVE);
    // Verifica a condição do fluxo para decidir se os dados e a navegação devem seguir por este ramo.
    if (!bruto) return null;
    // Declara valor parsed, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
    const parsed = JSON.parse(bruto) as Sessao;
    // Verifica a condição do fluxo para decidir se os dados e a navegação devem seguir por este ramo.
    if (!parsed?.usuario || !parsed?.token) return null;
    // Retorna o resultado/renderização desta etapa ao componente ou chamador que coordena o fluxo.
    return parsed;
  } catch {
    // Retorna o resultado/renderização desta etapa ao componente ou chamador que coordena o fluxo.
    return null;
  }
}

// Declara função salvarSessao, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
export function salvarSessao(sessao: Sessao) {
  // Verifica a condição do fluxo para decidir se os dados e a navegação devem seguir por este ramo.
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CHAVE, JSON.stringify(sessao));
}

// Declara função limparSessao, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
export function limparSessao() {
  // Verifica a condição do fluxo para decidir se os dados e a navegação devem seguir por este ramo.
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(CHAVE);
}
