import { apiFetch } from "./client";
import type { Produto } from "../types/api";

export async function listarProdutos(): Promise<Produto[]> {
  return apiFetch<Produto[]>("/produtos");
}
