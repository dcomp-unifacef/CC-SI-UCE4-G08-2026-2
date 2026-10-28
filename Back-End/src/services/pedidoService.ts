import { AppError } from "../errors/AppError";
import { UpdatePedidoDto } from "../dto/pedido/updatePedidoDto";
import { UpdateItemPedidoDto } from "../dto/pedido/updateItemPedidoDto";
import pedidoRepository from "../repositories/pedidoRepository";
import produtoRepository from "../repositories/produtoRepository";
import usuarioRepository from "../repositories/usuarioRepository";
import type { UsuarioAutenticado } from "../utils/jwt";
import {
  ROLE_CLIENTE,
  ROLE_GARCOM,
  isClienteRole,
  normalizeRole,
} from "../utils/roles";
import {
  getObjectData,
  validatePositiveInt,
  validateText,
} from "../utils/validation";

const STATUS_INICIAL = "Aberto";
const TAMANHO_MAX_STATUS = 80;
const STATUS_VALIDOS = [
  "Aberto",
  "Em preparo",
  "Pronto",
  "Entregue",
  "Pago",
  "Cancelado",
] as const;

const TRANSICOES_STATUS: Record<string, readonly string[]> = {
  Aberto: ["Em preparo", "Pago", "Cancelado"],
  "Em preparo": ["Pronto", "Pago", "Cancelado"],
  Pronto: ["Entregue", "Pago", "Cancelado"],
  Entregue: ["Pago", "Cancelado"],
  Pago: [],
  Cancelado: [],
};

const STATUS_EDICAO_ITENS = ["Aberto", "Em preparo"];

interface ItemSolicitado {
  idProduto: number;
  quantidade: number;
}

function validarStatus(value: unknown, statusAtual?: string): string {
  const statusInformado = validateText(
    value,
    "statusPedido",
    TAMANHO_MAX_STATUS,
  );

  const status = STATUS_VALIDOS.find(
    (item) => normalizeRole(item) === normalizeRole(statusInformado),
  );

  if (!status) {
    throw new AppError(
      `Status inválido. Use um destes valores: ${STATUS_VALIDOS.join(", ")}.`,
      400,
    );
  }

  if (statusAtual && status !== statusAtual) {
    const permitidos = TRANSICOES_STATUS[statusAtual] ?? [];

    if (!permitidos.includes(status)) {
      throw new AppError(
        `Não é possível alterar o status de "${statusAtual}" para "${status}".`,
        409,
      );
    }
  }

  return status;
}

async function ensureUsuarioComTipo(
  id: number,
  campo: string,
  tipoEsperado: string,
) {
  const usuario = await usuarioRepository.findById(id);

  if (!usuario) {
    throw new AppError(`${campo} não encontrado.`, 400);
  }

  if (!usuario.statusUsuario) {
    throw new AppError(`${campo} está inativo.`, 400);
  }

  if (normalizeRole(usuario.tipoUsuario.nome) !== normalizeRole(tipoEsperado)) {
    throw new AppError(`O ${campo.toLowerCase()} deve ter o tipo "${tipoEsperado}".`, 400);
  }

  return usuario;
}

function ensureAcessoAoPedido(
  pedido: { idCliente: number },
  usuario?: UsuarioAutenticado,
) {
  if (
    usuario &&
    isClienteRole(usuario.tipo) &&
    pedido.idCliente !== usuario.idUsuario
  ) {
    throw new AppError("Você só pode acessar os próprios pedidos.", 403);
  }
}

function ensureItensEditaveis(pedido: { statusPedido: string }) {
  if (!STATUS_EDICAO_ITENS.includes(pedido.statusPedido)) {
    throw new AppError(
      "Os itens só podem ser alterados enquanto o pedido está em Aberto ou Em preparo.",
      409,
    );
  }
}

function validarItens(value: unknown): ItemSolicitado[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new AppError("Informe ao menos um item no pedido.", 400);
  }

  return value.map((item, indice) => {
    const dados = getObjectData(item);

    return {
      idProduto: validatePositiveInt(
        dados.idProduto,
        `itens[${indice}].idProduto`,
      ),
      quantidade: validatePositiveInt(
        dados.quantidade,
        `itens[${indice}].quantidade`,
      ),
    };
  });
}

async function buscarProdutoDisponivel(value: unknown) {
  const idProduto = validatePositiveInt(value, "idProduto");
  const produto = await produtoRepository.findById(idProduto);

  if (!produto) {
    throw new AppError(`Produto ${idProduto} não encontrado.`, 400);
  }

  if (!produto.disponivel) {
    throw new AppError(`Produto "${produto.nome}" não está disponível.`, 409);
  }

  return produto;
}

function calcularValores(preco: number, quantidade: number) {
  const valorUnit = Number(preco);
  const subTotal = Number((valorUnit * quantidade).toFixed(2));

  return { valorUnit, subTotal };
}

async function findAll(usuario?: UsuarioAutenticado) {
  if (usuario && isClienteRole(usuario.tipo)) {
    return pedidoRepository.findAll({ idCliente: usuario.idUsuario });
  }

  return pedidoRepository.findAll();
}

async function findById(id: number, usuario?: UsuarioAutenticado) {
  const pedido = await pedidoRepository.findById(id);

  if (!pedido) {
    throw new AppError("Pedido não encontrado.", 404);
  }

  ensureAcessoAoPedido(pedido, usuario);

  return pedido;
}

async function create(data: unknown, usuario?: UsuarioAutenticado) {
  const input = getObjectData(data);

  const idCliente =
    usuario && isClienteRole(usuario.tipo)
      ? usuario.idUsuario
      : validatePositiveInt(input.idCliente, "idCliente");
  const idGarcom = validatePositiveInt(input.idGarcom, "idGarcom");
  const statusPedido =
    input.statusPedido === undefined
      ? STATUS_INICIAL
      : validarStatus(input.statusPedido);
  const itensSolicitados = validarItens(input.itens);

  await ensureUsuarioComTipo(idCliente, "Cliente", ROLE_CLIENTE);
  await ensureUsuarioComTipo(idGarcom, "Garçom", ROLE_GARCOM);

  const idsProdutos = [...new Set(itensSolicitados.map((i) => i.idProduto))];
  const produtos = await produtoRepository.findByIds(idsProdutos);
  const produtosPorId = new Map(produtos.map((p) => [p.idProduto, p]));

  const itens = itensSolicitados.map((item) => {
    const produto = produtosPorId.get(item.idProduto);

    if (!produto) {
      throw new AppError(`Produto ${item.idProduto} não encontrado.`, 400);
    }

    if (!produto.disponivel) {
      throw new AppError(`Produto "${produto.nome}" não está disponível.`, 409);
    }

    const { valorUnit, subTotal } = calcularValores(
      Number(produto.preco),
      item.quantidade,
    );

    return {
      idProduto: item.idProduto,
      quantidade: item.quantidade,
      valorUnit,
      subTotal,
    };
  });

  const valorTotal = Number(
    itens.reduce((total, item) => total + item.subTotal, 0).toFixed(2),
  );

  return pedidoRepository.create({
    valorTotal,
    statusPedido,
    idCliente,
    idGarcom,
    itens,
  });
}

async function update(
  id: number,
  data: unknown,
  usuario?: UsuarioAutenticado,
) {
  const pedido = await findById(id, usuario);

  if (usuario && isClienteRole(usuario.tipo)) {
    throw new AppError("Clientes não podem alterar pedidos.", 403);
  }

  const input = getObjectData(data);
  const dadosAtualizados: UpdatePedidoDto = {};

  if (Object.prototype.hasOwnProperty.call(input, "statusPedido")) {
    dadosAtualizados.statusPedido = validarStatus(
      input.statusPedido,
      pedido.statusPedido,
    );
  }

  if (Object.prototype.hasOwnProperty.call(input, "idCliente")) {
    const idCliente = validatePositiveInt(input.idCliente, "idCliente");
    await ensureUsuarioComTipo(idCliente, "Cliente", ROLE_CLIENTE);
    dadosAtualizados.idCliente = idCliente;
  }

  if (Object.prototype.hasOwnProperty.call(input, "idGarcom")) {
    const idGarcom = validatePositiveInt(input.idGarcom, "idGarcom");
    await ensureUsuarioComTipo(idGarcom, "Garçom", ROLE_GARCOM);
    dadosAtualizados.idGarcom = idGarcom;
  }

  if (Object.keys(dadosAtualizados).length === 0) {
    throw new AppError("Informe ao menos um campo válido para atualizar.", 400);
  }

  return pedidoRepository.update(id, dadosAtualizados);
}

async function addItem(
  idPedido: number,
  data: unknown,
  usuario?: UsuarioAutenticado,
) {
  const pedido = await findById(idPedido, usuario);
  ensureItensEditaveis(pedido);

  const input = getObjectData(data);
  const quantidade = validatePositiveInt(input.quantidade, "quantidade");
  const produto = await buscarProdutoDisponivel(input.idProduto);
  const { valorUnit, subTotal } = calcularValores(
    Number(produto.preco),
    quantidade,
  );

  return pedidoRepository.addItem(idPedido, {
    idProduto: produto.idProduto,
    quantidade,
    valorUnit,
    subTotal,
  });
}

async function updateItem(
  idPedido: number,
  idItemPedido: number,
  data: unknown,
  usuario?: UsuarioAutenticado,
) {
  const pedido = await findById(idPedido, usuario);
  ensureItensEditaveis(pedido);

  const item = await pedidoRepository.findItemById(idPedido, idItemPedido);

  if (!item) {
    throw new AppError("Item do pedido não encontrado.", 404);
  }

  const input = getObjectData(data);
  const dadosAtualizados: UpdateItemPedidoDto & {
    valorUnit?: number;
    subTotal?: number;
  } = {};

  const temIdProduto = Object.prototype.hasOwnProperty.call(input, "idProduto");
  const temQuantidade = Object.prototype.hasOwnProperty.call(
    input,
    "quantidade",
  );

  if (temIdProduto) {
    const produto = await buscarProdutoDisponivel(input.idProduto);
    const quantidade = temQuantidade
      ? validatePositiveInt(input.quantidade, "quantidade")
      : item.quantidade;
    const { valorUnit, subTotal } = calcularValores(
      Number(produto.preco),
      quantidade,
    );

    dadosAtualizados.idProduto = produto.idProduto;
    dadosAtualizados.quantidade = quantidade;
    dadosAtualizados.valorUnit = valorUnit;
    dadosAtualizados.subTotal = subTotal;
  } else if (temQuantidade) {
    const quantidade = validatePositiveInt(input.quantidade, "quantidade");
    const { valorUnit, subTotal } = calcularValores(
      Number(item.valorUnit),
      quantidade,
    );

    dadosAtualizados.quantidade = quantidade;
    dadosAtualizados.valorUnit = valorUnit;
    dadosAtualizados.subTotal = subTotal;
  }

  if (Object.keys(dadosAtualizados).length === 0) {
    throw new AppError("Informe ao menos um campo válido para atualizar.", 400);
  }

  return pedidoRepository.updateItem(idPedido, idItemPedido, dadosAtualizados);
}

async function removeItem(
  idPedido: number,
  idItemPedido: number,
  usuario?: UsuarioAutenticado,
) {
  const pedido = await findById(idPedido, usuario);
  ensureItensEditaveis(pedido);

  const item = await pedidoRepository.findItemById(idPedido, idItemPedido);

  if (!item) {
    throw new AppError("Item do pedido não encontrado.", 404);
  }

  const totalItens = await pedidoRepository.countItens(idPedido);

  if (totalItens <= 1) {
    throw new AppError("O pedido deve ter ao menos um item.", 409);
  }

  return pedidoRepository.removeItem(idPedido, idItemPedido);
}

async function remove(id: number) {
  await findById(id);
  return pedidoRepository.remove(id);
}

export default {
  findAll,
  findById,
  create,
  update,
  addItem,
  updateItem,
  removeItem,
  remove,
};
