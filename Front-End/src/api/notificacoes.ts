// Adaptador dos endpoints de notificações de pagamento, usado pelas telas que consultam e atualizam avisos.
// Importa o módulo ./client, que fornece dependências usadas neste arquivo; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import { apiFetch } from "./client";
// Importa os contratos de dados usados entre interface e API; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import type {
  NotificacaoPagamento,
  SolicitarPagamentoInput,
  ContarNaoLidasResponse,
} from "../types/api";

// Declara função solicitarPagamento, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
export async function solicitarPagamento(
  dados: SolicitarPagamentoInput,
): Promise<NotificacaoPagamento> {
  // Retorna o resultado/renderização desta etapa ao componente ou chamador que coordena o fluxo.
  return apiFetch<NotificacaoPagamento>("/notificacoes", {
    method: "POST",
    body: JSON.stringify(dados),
  });
}

// Declara função listarNotificacoesPendentes, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
export async function listarNotificacoesPendentes(): Promise<
  NotificacaoPagamento[]
> {
  // Retorna o resultado/renderização desta etapa ao componente ou chamador que coordena o fluxo.
  return apiFetch<NotificacaoPagamento[]>("/notificacoes/pendentes");
}

// Declara função contarNaoLidas, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
export async function contarNaoLidas(): Promise<ContarNaoLidasResponse> {
  // Retorna o resultado/renderização desta etapa ao componente ou chamador que coordena o fluxo.
  return apiFetch<ContarNaoLidasResponse>("/notificacoes/contar-nao-lidas");
}

// Declara função marcarComoAtendida, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
export async function marcarComoAtendida(id: number): Promise<NotificacaoPagamento> {
  // Retorna o resultado/renderização desta etapa ao componente ou chamador que coordena o fluxo.
  return apiFetch<NotificacaoPagamento>(`/notificacoes/${id}/atender`, {
    method: "PATCH",
  });
}

// Declara função marcarComoLida, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
export async function marcarComoLida(id: number): Promise<NotificacaoPagamento> {
  // Retorna o resultado/renderização desta etapa ao componente ou chamador que coordena o fluxo.
  return apiFetch<NotificacaoPagamento>(`/notificacoes/${id}/lida`, {
    method: "PATCH",
  });
}

// Declara função buscarPagamentoPorPedido, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
export async function buscarPagamentoPorPedido(
  idPedido: number,
): Promise<unknown> {
  // Retorna o resultado/renderização desta etapa ao componente ou chamador que coordena o fluxo.
  return apiFetch<unknown>(`/pagamentos/pedido/${idPedido}`);
}
