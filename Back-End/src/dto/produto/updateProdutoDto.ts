// Atualização parcial dos campos de catálogo, validada e encaminhada pelo produtoService.
export interface UpdateProdutoDto {
  // Todos os campos são opcionais para permitir alterar somente os informados.
  nome?: string;
  preco?: number;
  descricao?: string;
  imagem?: string;
  disponivel?: boolean;
}
