// Adaptador de usuários, conectando as telas às operações correspondentes da API.
// Importa o módulo ./client, que fornece dependências usadas neste arquivo; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import { apiFetch } from "./client";
// Importa os contratos de dados usados entre interface e API; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import type { UsuarioApi } from "../types/api";

// Declara função listarUsuarios, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
export async function listarUsuarios(): Promise<UsuarioApi[]> {
  // Retorna o resultado/renderização desta etapa ao componente ou chamador que coordena o fluxo.
  return apiFetch<UsuarioApi[]>("/usuarios");
}
