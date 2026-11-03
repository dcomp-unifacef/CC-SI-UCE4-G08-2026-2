import { apiFetch } from "./client";
import type { UsuarioApi } from "../types/api";

export async function listarUsuarios(): Promise<UsuarioApi[]> {
  return apiFetch<UsuarioApi[]>("/usuarios");
}
