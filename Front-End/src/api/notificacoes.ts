import { apiFetch } from "./client";
import type {
  NotificacaoPagamento,
  SolicitarPagamentoInput,
  ContarNaoLidasResponse,
} from "../types/api";

export async function solicitarPagamento(
  dados: SolicitarPagamentoInput,
): Promise<NotificacaoPagamento> {
  return apiFetch<NotificacaoPagamento>("/notificacoes", {
    method: "POST",
    body: JSON.stringify(dados),
  });
}

export async function listarNotificacoesPendentes(): Promise<
  NotificacaoPagamento[]
> {
  return apiFetch<NotificacaoPagamento[]>("/notificacoes/pendentes");
}

export async function contarNaoLidas(): Promise<ContarNaoLidasResponse> {
  return apiFetch<ContarNaoLidasResponse>("/notificacoes/contar-nao-lidas");
}

export async function marcarComoAtendida(id: number): Promise<NotificacaoPagamento> {
  return apiFetch<NotificacaoPagamento>(`/notificacoes/${id}/atender`, {
    method: "PATCH",
  });
}

export async function marcarComoLida(id: number): Promise<NotificacaoPagamento> {
  return apiFetch<NotificacaoPagamento>(`/notificacoes/${id}/lida`, {
    method: "PATCH",
  });
}

export async function buscarPagamentoPorPedido(
  idPedido: number,
): Promise<unknown> {
  return apiFetch<unknown>(`/pagamentos/pedido/${idPedido}`);
}
