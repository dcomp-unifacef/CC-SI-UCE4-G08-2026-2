// Contrato do corpo aceito para registrar pagamento; é validado no pagamentoService.
export interface CreatePagamentoDto {
  // Pedido que está sendo quitado e método escolhido pelo cliente/atendente.
  idPedido: number;
  formaPagamento: string;
  // Valor opcional informado pelo cliente, conferido pelo service com o total do pedido.
  valor?: number;
  // Estado opcional; se omitido, o fluxo de criação assume pagamento concluído.
  status?: string;
}
