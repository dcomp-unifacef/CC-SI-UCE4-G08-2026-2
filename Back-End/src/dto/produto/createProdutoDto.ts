// Dados para cadastro de produto; produtoService aplica validações antes da persistência.
export interface CreateProdutoDto {
  // Nome, preço e descrição obrigatórios do item de catálogo.
  nome: string;
  preco: number;
  descricao: string;
  // Imagem e disponibilidade são opcionais e recebem padrão no fluxo de criação.
  imagem?: string;
  disponivel?: boolean;
}
