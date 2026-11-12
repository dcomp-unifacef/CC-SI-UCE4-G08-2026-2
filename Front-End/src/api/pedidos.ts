import { apiFetch } from "./client";
import { ApiError } from "./client";
import type {
  AtualizarPedidoInput,
  CancelarPedidoInput,
  CriarPedidoInput,
  Pedido,
} from "../types/api";

export interface FiltrosListarPedidos {
  data?: string; // YYYY-MM-DD
  status?: string | string[];
  numeroMesa?: number;
  page?: number;
  limit?: number;
}

export async function listarPedidos(
  filtros?: FiltrosListarPedidos,
): Promise<Pedido[]> {
  const params = new URLSearchParams();

  if (filtros?.numeroMesa) {
    params.set("numeroMesa", String(filtros.numeroMesa));
  }

  if (filtros?.data) {
    params.set("data", filtros.data);
  }

  if (filtros?.status !== undefined) {
    const statuses = Array.isArray(filtros.status)
      ? filtros.status
      : [filtros.status];
    statuses.forEach((status) => params.append("status", status));
  }

  if (filtros?.page) {
    params.set("page", String(filtros.page));
  }

  if (filtros?.limit) {
    params.set("limit", String(filtros.limit));
  }

  const query = params.toString();
  return apiFetch<Pedido[]>(`/pedidos${query ? `?${query}` : ""}`);
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

export async function atualizarStatusPedido(
  id: number,
  statusPedido: string,
): Promise<Pedido> {
  return apiFetch<Pedido>(`/pedidos/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status: statusPedido }),
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

export async function cancelarPedido(
  id: number,
  dados: CancelarPedidoInput,
): Promise<Pedido> {
  return apiFetch<Pedido>(`/pedidos/${id}/cancelar`, {
    method: "PATCH",
    body: JSON.stringify(dados),
  });
}
