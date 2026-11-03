import { apiFetch } from "./client";
import { ApiError } from "./client";
import type {
  AtualizarPedidoInput,
  CriarPedidoInput,
  Pedido,
} from "../types/api";

export async function listarPedidos(): Promise<Pedido[]> {
  return apiFetch<Pedido[]>("/pedidos");
}

export async function buscarPedido(id: number): Promise<Pedido> {
  return apiFetch<Pedido>(`/pedidos/${id}`);
}

export async function buscarPedidoAtivoDaMesa(
  numeroMesa: number,
): Promise<Pedido | null> {
  try {
    return await apiFetch<Pedido>(`/pedidos/mesa/${numeroMesa}/ativo`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }
    throw error;
  }
}

export async function criarPedido(dados: CriarPedidoInput): Promise<Pedido> {
  return apiFetch<Pedido>("/pedidos", {
    method: "POST",
    body: JSON.stringify(dados),
  });
}

export async function atualizarPedido(
  id: number,
  dados: AtualizarPedidoInput,
): Promise<Pedido> {
  return apiFetch<Pedido>(`/pedidos/${id}`, {
    method: "PUT",
    body: JSON.stringify(dados),
  });
}

export async function adicionarItem(
  id: number,
  dados: { idProduto: number; quantidade: number },
): Promise<Pedido> {
  return apiFetch<Pedido>(`/pedidos/${id}/itens`, {
    method: "POST",
    body: JSON.stringify(dados),
  });
}

export async function alterarItem(
  id: number,
  idItem: number,
  dados: Partial<{ idProduto: number; quantidade: number }>,
): Promise<Pedido> {
  return apiFetch<Pedido>(`/pedidos/${id}/itens/${idItem}`, {
    method: "PUT",
    body: JSON.stringify(dados),
  });
}

export async function removerItem(id: number, idItem: number): Promise<Pedido> {
  return apiFetch<Pedido>(`/pedidos/${id}/itens/${idItem}`, {
    method: "DELETE",
  });
}
