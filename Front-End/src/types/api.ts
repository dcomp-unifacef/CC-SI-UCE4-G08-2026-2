export interface UsuarioLogado {
  id: number;
  nome: string;
  login: string;
  tipo: string;
}

export interface RespostaLogin {
  usuario: UsuarioLogado;
  token: string;
}

export interface UsuarioApi {
  idUsuario: number;
  nome: string;
  loginUsuario: string;
  statusUsuario: boolean;
  idTipoUsuario: number;
  tipoUsuario: { nome: string };
}

export interface Produto {
  idProduto: number;
  nome: string;
  preco: string;
  descricao: string;
  disponivel: boolean;
}

export interface ItemPedido {
  idItemPedido: number;
  idPedido: number;
  idProduto: number;
  quantidade: number;
  valorUnit: string;
  subTotal: string;
  produto: { idProduto: number; nome: string; preco: string };
}

export interface Pedido {
  idPedido: number;
  valorTotal: string;
  dataHora: string;
  statusPedido: string;
  numeroMesa: number;
  idCliente: number | null;
  idGarcom: number | null;
  cliente: { idUsuario: number; nome: string } | null;
  garcom: { idUsuario: number; nome: string } | null;
  itens: ItemPedido[];
  pagamento: unknown;
}

export interface ItemInput {
  idProduto: number;
  quantidade: number;
}

export interface CriarPedidoInput {
  numeroMesa: number;
  idGarcom?: number;
  idCliente?: number;
  statusPedido?: string;
  itens: ItemInput[];
}

export interface AtualizarPedidoInput {
  statusPedido?: string;
  idCliente?: number;
  idGarcom?: number;
}
