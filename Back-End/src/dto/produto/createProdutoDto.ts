export interface CreateProdutoDto {
  nome: string;
  preco: number;
  descricao: string;
  disponivel?: boolean;
}
