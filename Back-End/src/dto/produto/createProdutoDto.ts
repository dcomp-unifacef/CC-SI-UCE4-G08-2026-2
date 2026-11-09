export interface CreateProdutoDto {
  nome: string;
  preco: number;
  descricao: string;
  imagem?: string;
  disponivel?: boolean;
}
