// Adaptador de autenticação: traduz operações de login para chamadas ao cliente HTTP compartilhado.
// Importa o módulo ./client, que fornece dependências usadas neste arquivo; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import { apiFetch } from "./client";
// Importa os contratos de dados usados entre interface e API; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import type { RespostaLogin } from "../types/api";

// Declara função entrar, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
export async function entrar(
  loginUsuario: string,
  senha: string,
): Promise<RespostaLogin> {
  // Retorna o resultado/renderização desta etapa ao componente ou chamador que coordena o fluxo.
  return apiFetch<RespostaLogin>("/usuarios/login", {
    method: "POST",
    body: JSON.stringify({ loginUsuario, senha }),
  });
}
