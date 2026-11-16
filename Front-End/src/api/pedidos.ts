// Adaptador dos endpoints de pedidos: lista, consulta, cria e altera pedidos e seus itens para as telas operacionais.
// Importa o módulo ./client, que fornece dependências usadas neste arquivo; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import { apiFetch } from "./client";
// Importa o módulo ./client, que fornece dependências usadas neste arquivo; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import { ApiError } from "./client";
// Importa os contratos de dados usados entre interface e API; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import type {
  AtualizarPedidoInput,
  CancelarPedidoInput,
  CriarPedidoInput,
  Pedido,
} from "../types/api";

// Declara contrato de dados FiltrosListarPedidos, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
export interface FiltrosListarPedidos {
  data?: string; // YYYY-MM-DD
  status?: string | string[];
  numeroMesa?: number;
  page?: number;
  limit?: number;
}

// Declara função listarPedidos, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
export async function listarPedidos(
  filtros?: FiltrosListarPedidos,
): Promise<Pedido[]> {
  // Declara valor params, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
  const params = new URLSearchParams();

  // Verifica a condição do fluxo para decidir se os dados e a navegação devem seguir por este ramo.
  if (filtros?.numeroMesa) {
    params.set("numeroMesa", String(filtros.numeroMesa));
  }

  // Verifica a condição do fluxo para decidir se os dados e a navegação devem seguir por este ramo.
  if (filtros?.data) {
    params.set("data", filtros.data);
  }

  // Verifica a condição do fluxo para decidir se os dados e a navegação devem seguir por este ramo.
  if (filtros?.status !== undefined) {
    // Declara valor statuses, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
    const statuses = Array.isArray(filtros.status)
      ? filtros.status
      : [filtros.status];
    statuses.forEach((status) => params.append("status", status));
  }

  // Verifica a condição do fluxo para decidir se os dados e a navegação devem seguir por este ramo.
  if (filtros?.page) {
    params.set("page", String(filtros.page));
  }

  // Verifica a condição do fluxo para decidir se os dados e a navegação devem seguir por este ramo.
  if (filtros?.limit) {
    params.set("limit", String(filtros.limit));
  }

  // Declara valor query, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
  const query = params.toString();
  // Retorna o resultado/renderização desta etapa ao componente ou chamador que coordena o fluxo.
  return apiFetch<Pedido[]>(`/pedidos${query ? `?${query}` : ""}`);
}

// Declara função buscarPedido, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
export async function buscarPedido(id: number): Promise<Pedido> {
  // Retorna o resultado/renderização desta etapa ao componente ou chamador que coordena o fluxo.
  return apiFetch<Pedido>(`/pedidos/${id}`);
}

// Declara função buscarPedidoAtivoDaMesa, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
export async function buscarPedidoAtivoDaMesa(
  numeroMesa: number,
): Promise<Pedido | null> {
  // Executa a operação sujeita a falhas, como uma chamada à API ou interação com o navegador.
  try {
    // Retorna o resultado/renderização desta etapa ao componente ou chamador que coordena o fluxo.
    return await apiFetch<Pedido>(`/pedidos/mesa/${numeroMesa}/ativo`);
  } catch (error) {
    // Verifica a condição do fluxo para decidir se os dados e a navegação devem seguir por este ramo.
    if (error instanceof ApiError && error.status === 404) {
      // Retorna o resultado/renderização desta etapa ao componente ou chamador que coordena o fluxo.
      return null;
    }
    // Propaga a falha para que o chamador ou a interface possa tratá-la.
    throw error;
  }
}

// Declara função criarPedido, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
export async function criarPedido(dados: CriarPedidoInput): Promise<Pedido> {
  // Retorna o resultado/renderização desta etapa ao componente ou chamador que coordena o fluxo.
  return apiFetch<Pedido>("/pedidos", {
    method: "POST",
    body: JSON.stringify(dados),
  });
}

// Declara função atualizarPedido, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
export async function atualizarPedido(
  id: number,
  dados: AtualizarPedidoInput,
): Promise<Pedido> {
  // Retorna o resultado/renderização desta etapa ao componente ou chamador que coordena o fluxo.
  return apiFetch<Pedido>(`/pedidos/${id}`, {
    method: "PUT",
    body: JSON.stringify(dados),
  });
}

// Declara função atualizarStatusPedido, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
export async function atualizarStatusPedido(
  id: number,
  statusPedido: string,
): Promise<Pedido> {
  // Retorna o resultado/renderização desta etapa ao componente ou chamador que coordena o fluxo.
  return apiFetch<Pedido>(`/pedidos/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status: statusPedido }),
  });
}

// Declara função adicionarItem, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
export async function adicionarItem(
  id: number,
  dados: { idProduto: number; quantidade: number },
): Promise<Pedido> {
  // Retorna o resultado/renderização desta etapa ao componente ou chamador que coordena o fluxo.
  return apiFetch<Pedido>(`/pedidos/${id}/itens`, {
    method: "POST",
    body: JSON.stringify(dados),
  });
}

// Declara função alterarItem, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
export async function alterarItem(
  id: number,
  idItem: number,
  dados: Partial<{ idProduto: number; quantidade: number }>,
): Promise<Pedido> {
  // Retorna o resultado/renderização desta etapa ao componente ou chamador que coordena o fluxo.
  return apiFetch<Pedido>(`/pedidos/${id}/itens/${idItem}`, {
    method: "PUT",
    body: JSON.stringify(dados),
  });
}

// Declara função removerItem, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
export async function removerItem(id: number, idItem: number): Promise<Pedido> {
  // Retorna o resultado/renderização desta etapa ao componente ou chamador que coordena o fluxo.
  return apiFetch<Pedido>(`/pedidos/${id}/itens/${idItem}`, {
    method: "DELETE",
  });
}

// Declara função cancelarPedido, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
export async function cancelarPedido(
  id: number,
  dados: CancelarPedidoInput,
): Promise<Pedido> {
  // Retorna o resultado/renderização desta etapa ao componente ou chamador que coordena o fluxo.
  return apiFetch<Pedido>(`/pedidos/${id}/cancelar`, {
    method: "PATCH",
    body: JSON.stringify(dados),
  });
}
