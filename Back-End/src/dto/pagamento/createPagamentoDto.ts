export interface CreatePagamentoDto {
  idPedido: number;
  formaPagamento: string;
  valor?: number;
  status?: string;
}
