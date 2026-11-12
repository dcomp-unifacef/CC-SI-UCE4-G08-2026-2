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
  imagem: string;
  disponivel: boolean;
}

export interface ItemPedido {
  idItemPedido: number;
  idPedido: number;
  idProduto: number;
  quantidade: number;
  valorUnit: string;
  subTotal: string;
  produto: {
    idProduto: number;
    nome: string;
    preco: string;
    imagem: string;
  };
}

export interface Pedido {
  idPedido: number;
  valorTotal: string;
  dataHora: string;
  statusPedido: string;
  numeroMesa: number;
  idCliente: number | null;
  idGarcom: number | null;
  motivoCancelamento: string | null;
  cliente: { idUsuario: number; nome: string } | null;
  garcom: { idUsuario: number; nome: string } | null;
  itens: ItemPedido[];
  pagamento: unknown;
}

export interface CancelarPedidoInput {
  motivo: string;
}

export interface NotificacaoPagamento {
  idNotificacao: number;
  idPedido: number;
  numeroMesa: number;
  metodoPagamento: string;
  status: string;
  dataHora: string;
  lida: boolean;
}

export interface SolicitarPagamentoInput {
  idPedido: number;
  metodoPagamento: "PIX" | "CARTAO";
}

export interface ContarNaoLidasResponse {
  naoLidas: number;
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
