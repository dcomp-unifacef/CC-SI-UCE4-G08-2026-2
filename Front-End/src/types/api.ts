// Contratos TypeScript dos dados trocados entre as telas, adaptadores de API e servidor.
// Declara contrato de dados UsuarioLogado, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
export interface UsuarioLogado {
  id: number;
  nome: string;
  login: string;
  tipo: string;
}

// Declara contrato de dados RespostaLogin, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
export interface RespostaLogin {
  usuario: UsuarioLogado;
  token: string;
}

// Declara contrato de dados UsuarioApi, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
export interface UsuarioApi {
  idUsuario: number;
  nome: string;
  loginUsuario: string;
  statusUsuario: boolean;
  idTipoUsuario: number;
  tipoUsuario: { nome: string };
}

// Declara contrato de dados Produto, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
export interface Produto {
  idProduto: number;
  nome: string;
  preco: string;
  descricao: string;
  imagem: string;
  disponivel: boolean;
}

// Declara contrato de dados ItemPedido, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
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

// Declara contrato de dados Pedido, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
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

// Declara contrato de dados CancelarPedidoInput, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
export interface CancelarPedidoInput {
  motivo: string;
}

// Declara contrato de dados NotificacaoPagamento, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
export interface NotificacaoPagamento {
  idNotificacao: number;
  idPedido: number;
  numeroMesa: number;
  metodoPagamento: string;
  status: string;
  dataHora: string;
  lida: boolean;
}

// Declara contrato de dados SolicitarPagamentoInput, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
export interface SolicitarPagamentoInput {
  idPedido: number;
  metodoPagamento: "PIX" | "CARTAO";
}

// Declara contrato de dados ContarNaoLidasResponse, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
export interface ContarNaoLidasResponse {
  naoLidas: number;
}

// Declara contrato de dados ItemInput, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
export interface ItemInput {
  idProduto: number;
  quantidade: number;
}

// Declara contrato de dados CriarPedidoInput, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
export interface CriarPedidoInput {
  numeroMesa: number;
  idGarcom?: number;
  idCliente?: number;
  statusPedido?: string;
  itens: ItemInput[];
}

// Declara contrato de dados AtualizarPedidoInput, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
export interface AtualizarPedidoInput {
  statusPedido?: string;
  idCliente?: number;
  idGarcom?: number;
}
