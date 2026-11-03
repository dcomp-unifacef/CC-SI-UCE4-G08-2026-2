import { apiFetch } from "./client";
import type { RespostaLogin } from "../types/api";

export async function entrar(
  loginUsuario: string,
  senha: string,
): Promise<RespostaLogin> {
  return apiFetch<RespostaLogin>("/usuarios/login", {
    method: "POST",
    body: JSON.stringify({ loginUsuario, senha }),
  });
}
