// Campos mutáveis de um pagamento existente; o service valida os dados antes do repository.
export interface UpdatePagamentoDto {
  // Forma registrada para o pagamento, quando enviada.
  formaPagamento?: string;
  // Situação de pagamento reconhecida pelas regras de domínio.
  status?: string;
}
