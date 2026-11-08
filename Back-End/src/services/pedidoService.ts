import repository, {
  DadosPedido,
  FiltrosPedido,
  ItemPedidoPersistido,
} from "../repositories/pedidoRepository";
import { AppError } from "../errors/AppError";
import { ItemPedidoInputDto } from "../dto/pedido/itemPedidoDto";
import {
  calcularSubtotal,
  calcularTotal,
  podeEditarPedido,
  podeTransicionar,
  perfilPodeAlterarStatus,
  STATUS_PEDIDO,
  statusPedidoValido,
} from "../domain/pedidoRules";
import { ehCliente, normalizarPerfil, PERFIS } from "../domain/perfis";
import { serializeListaPedidos, serializePedido } from "../utils/serializers";

export interface UsuarioAutenticado {
  id: number;
  tipo: string;
}

function getObjectData(data: unknown): Record<string, unknown> {
  if (data === null || typeof data !== "object" || Array.isArray(data)) {
    throw new AppError("O corpo da requisição deve ser um objeto JSON.", 400);
  }

  return data as Record<string, unknown>;
}

function hasOwn(data: Record<string, unknown>, campo: string): boolean {
  return Object.prototype.hasOwnProperty.call(data, campo);
}

function validarId(valor: unknown, campo: string): number {
  if (typeof valor !== "number" || !Number.isInteger(valor) || valor <= 0) {
    throw new AppError(`${campo} deve ser um inteiro positivo.`, 400);
  }

  return valor;
}

function validarQuantidade(valor: unknown): number {
  return validarId(valor, "A quantidade");
}

function validarTempoEstimado(valor: unknown): number {
  if (typeof valor !== "number" || !Number.isInteger(valor) || valor <= 0) {
    throw new AppError("tempoEstimado deve ser um inteiro positivo (minutos).", 400);
  }

  if (valor > 600) {
    throw new AppError("tempoEstimado deve ser no máximo 600 minutos.", 400);
  }

  return valor;
}

function validarItens(valor: unknown): ItemPedidoInputDto[] {
  if (!Array.isArray(valor) || valor.length === 0) {
    throw new AppError("O pedido deve possuir ao menos um item.", 400);
  }

  const agrupados = new Map<number, number>();

  for (const item of valor) {
    const input = getObjectData(item);
    const idProduto = validarId(input.idProduto, "idProduto");
    const quantidade = validarQuantidade(input.quantidade);

    agrupados.set(idProduto, (agrupados.get(idProduto) ?? 0) + quantidade);
  }

  return Array.from(agrupados, ([idProduto, quantidade]) => ({
    idProduto,
    quantidade,
  }));
}

function validarItem(valor: unknown): ItemPedidoInputDto {
  const input = getObjectData(valor);
  const idProduto = validarId(input.idProduto, "idProduto");
  const quantidade = validarQuantidade(input.quantidade);

  return { idProduto, quantidade };
}

async function garantirUsuarioAtivo(id: number, campo: string) {
  const usuario = await repository.findUsuarioById(id);

  if (!usuario) {
    throw new AppError(`${campo} não encontrado.`, 400);
  }

  if (!usuario.statusUsuario) {
    throw new AppError(`${campo} está inativo.`, 400);
  }

  return usuario;
}

async function montarItens(
  itensInput: ItemPedidoInputDto[],
): Promise<ItemPedidoPersistido[]> {
  const produtos = await repository.findProdutosByIds(
    itensInput.map((item) => item.idProduto),
  );
  const mapaProdutos = new Map(
    produtos.map((produto) => [produto.idProduto, produto]),
  );

  return itensInput.map((item) => {
    const produto = mapaProdutos.get(item.idProduto);

    if (!produto) {
      throw new AppError(`Produto ${item.idProduto} não encontrado.`, 400);
    }

    if (!produto.disponivel) {
      throw new AppError(
        `O produto "${produto.nome}" não está disponível.`,
        400,
      );
    }

    const valorUnit = Number(produto.preco);

    return {
      idProduto: produto.idProduto,
      quantidade: item.quantidade,
      valorUnit,
      subTotal: calcularSubtotal(valorUnit, item.quantidade),
    };
  });
}

async function buscarPedido(id: number) {
  const pedido = await repository.findById(id);

  if (!pedido) {
    throw new AppError("Pedido não encontrado.", 404);
  }

  return pedido;
}

async function findAll(
  filtros: FiltrosPedido,
  usuario?: UsuarioAutenticado,
) {
  const filtrosAjustados = { ...filtros };

  if (usuario && ehCliente(usuario.tipo)) {
    filtrosAjustados.idCliente = usuario.id;
  }

  return serializeListaPedidos(await repository.findAll(filtrosAjustados));
}

async function findFila() {
  return serializeListaPedidos(
    await repository.findAll({ status: ["Pendente", "Em preparo"] }),
  );
}

async function buscarAtivoDaMesa(numeroMesa: number) {
  const pedido = await repository.findAtivoDaMesa(numeroMesa);
  if (!pedido) return null;
  return serializePedido(pedido);
}

async function findById(id: number, usuario?: UsuarioAutenticado) {
  const pedido = await buscarPedido(id);

  if (usuario && ehCliente(usuario.tipo) && pedido.idCliente !== usuario.id) {
    throw new AppError("Você só pode consultar os próprios pedidos.", 403);
  }

  return serializePedido(pedido);
}

async function create(data: unknown, usuarioAutenticado: UsuarioAutenticado) {
  const input = getObjectData(data);
  const idCliente = validarId(input.idCliente, "idCliente");
  const idGarcom =
    input.idGarcom === undefined
      ? usuarioAutenticado.id
      : validarId(input.idGarcom, "idGarcom");
  const idCozinheiro =
    input.idCozinheiro === undefined || input.idCozinheiro === null
      ? null
      : validarId(input.idCozinheiro, "idCozinheiro");
  const tempoEstimado =
    input.tempoEstimado === undefined || input.tempoEstimado === null
      ? null
      : validarTempoEstimado(input.tempoEstimado);

  const numeroMesa = validarId(input.numeroMesa, "numeroMesa");
  const itensInput = validarItens(input.itens);

  await garantirUsuarioAtivo(idCliente, "Cliente");
  await garantirUsuarioAtivo(idGarcom, "Garçom");
  if (idCozinheiro !== null) {
    await garantirUsuarioAtivo(idCozinheiro, "Cozinheiro");
  }

  const itens = await montarItens(itensInput);
  const valorTotal = calcularTotal(itens);

  try {
    const pedido = await repository.create(
      {
        idCliente,
        idGarcom,
        idCozinheiro,
        tempoEstimado,
        statusPedido: "Pendente",
        valorTotal,
        numeroMesa,
      },
      itens,
    );

    return serializePedido(pedido);
  } catch (error: any) {
    if (error?.code === "P2002") {
      throw new AppError(
        "Já existe um pedido ativo para esta mesa. Finalize ou cancele o pedido atual antes de criar um novo.",
        409,
      );
    }
    throw error;
  }
}

async function update(id: number, data: unknown) {
  const pedido = await buscarPedido(id);

  if (!podeEditarPedido(pedido.statusPedido)) {
    throw new AppError(
      "O pedido só pode ser alterado enquanto estiver com status Pendente.",
      409,
    );
  }

  const input = getObjectData(data);
  const dados: DadosPedido = {};
  let itens: ItemPedidoPersistido[] | undefined;

  if (hasOwn(input, "idCliente")) {
    const idCliente = validarId(input.idCliente, "idCliente");
    await garantirUsuarioAtivo(idCliente, "Cliente");
    dados.idCliente = idCliente;
  }

  if (hasOwn(input, "idGarcom")) {
    const idGarcom = validarId(input.idGarcom, "idGarcom");
    await garantirUsuarioAtivo(idGarcom, "Garçom");
    dados.idGarcom = idGarcom;
  }

  if (hasOwn(input, "idCozinheiro")) {
    if (input.idCozinheiro === null) {
      dados.idCozinheiro = null;
    } else {
      const idCozinheiro = validarId(input.idCozinheiro, "idCozinheiro");
      await garantirUsuarioAtivo(idCozinheiro, "Cozinheiro");
      dados.idCozinheiro = idCozinheiro;
    }
  }

  if (hasOwn(input, "tempoEstimado")) {
    if (input.tempoEstimado === null) {
      dados.tempoEstimado = null;
    } else {
      dados.tempoEstimado = validarTempoEstimado(input.tempoEstimado);
    }
  }

  if (hasOwn(input, "itens")) {
    const itensInput = validarItens(input.itens);
    itens = await montarItens(itensInput);
    dados.valorTotal = calcularTotal(itens);
  }

  if (Object.keys(dados).length === 0 && itens === undefined) {
    throw new AppError("Informe ao menos um campo válido para atualizar.", 400);
  }

  return serializePedido(await repository.update(id, dados, itens));
}

async function alterarStatus(
  id: number,
  data: unknown,
  usuario: UsuarioAutenticado,
) {
  const pedido = await buscarPedido(id);
  const input = getObjectData(data);
  const novoStatus = input.status;

  if (!statusPedidoValido(novoStatus)) {
    throw new AppError(
      `Status inválido. Valores permitidos: ${STATUS_PEDIDO.join(", ")}.`,
      400,
    );
  }

  if (!podeTransicionar(pedido.statusPedido, novoStatus)) {
    throw new AppError(
      `Não é possível alterar o status de "${pedido.statusPedido}" para "${novoStatus}".`,
      409,
    );
  }

  if (!perfilPodeAlterarStatus(usuario.tipo, pedido.statusPedido, novoStatus)) {
    throw new AppError(
      "O perfil do usuário autenticado não pode realizar esta alteração de status.",
      403,
    );
  }

  const dados: DadosPedido = { statusPedido: novoStatus };

  if (
    (novoStatus === "Em preparo" || novoStatus === "Pronto") &&
    pedido.idCozinheiro === null &&
    normalizarPerfil(usuario.tipo) === normalizarPerfil(PERFIS.COZINHEIRO)
  ) {
    dados.idCozinheiro = usuario.id;
  }

  return serializePedido(await repository.updateStatus(id, dados));
}

async function adicionarItem(id: number, data: unknown) {
  const pedido = await buscarPedido(id);

  if (!podeEditarPedido(pedido.statusPedido)) {
    throw new AppError(
      "Itens só podem ser adicionados enquanto o pedido estiver Pendente.",
      409,
    );
  }

  const itemInput = validarItem(data);
  const [item] = await montarItens([itemInput]);
  const itemExistente = pedido.itens.find(
    (itemPedido) => itemPedido.idProduto === item.idProduto,
  );

  if (itemExistente) {
    const quantidade = itemExistente.quantidade + item.quantidade;

    return serializePedido(
      await repository.updateItem(itemExistente.idItemPedido, id, {
        idProduto: item.idProduto,
        quantidade,
        valorUnit: item.valorUnit,
        subTotal: calcularSubtotal(item.valorUnit, quantidade),
      }),
    );
  }

  return serializePedido(await repository.addItem(id, item));
}

async function atualizarItem(
  id: number,
  idItemPedido: number,
  data: unknown,
) {
  const pedido = await buscarPedido(id);

  if (!podeEditarPedido(pedido.statusPedido)) {
    throw new AppError(
      "Itens só podem ser alterados enquanto o pedido estiver Pendente.",
      409,
    );
  }

  const item = pedido.itens.find(
    (itemPedido) => itemPedido.idItemPedido === idItemPedido,
  );

  if (!item) {
    throw new AppError("Item do pedido não encontrado.", 404);
  }

  const input = getObjectData(data);
  const quantidade = validarQuantidade(input.quantidade);
  const valorUnit = Number(item.valorUnit);

  return serializePedido(
    await repository.updateItem(idItemPedido, id, {
      idProduto: item.idProduto,
      quantidade,
      valorUnit,
      subTotal: calcularSubtotal(valorUnit, quantidade),
    }),
  );
}

async function removerItem(id: number, idItemPedido: number) {
  const pedido = await buscarPedido(id);

  if (!podeEditarPedido(pedido.statusPedido)) {
    throw new AppError(
      "Itens só podem ser removidos enquanto o pedido estiver Pendente.",
      409,
    );
  }

  const item = pedido.itens.find(
    (itemPedido) => itemPedido.idItemPedido === idItemPedido,
  );

  if (!item) {
    throw new AppError("Item do pedido não encontrado.", 404);
  }

  if (pedido.itens.length <= 1) {
    throw new AppError("O pedido deve possuir ao menos um item.", 400);
  }

  return serializePedido(await repository.removeItem(idItemPedido, id));
}

async function cancelar(id: number, usuario: UsuarioAutenticado) {
  const pedido = await buscarPedido(id);

  if (!podeTransicionar(pedido.statusPedido, "Cancelado")) {
    throw new AppError(
      `Um pedido com status "${pedido.statusPedido}" não pode ser cancelado.`,
      409,
    );
  }

  if (!perfilPodeAlterarStatus(usuario.tipo, pedido.statusPedido, "Cancelado")) {
    throw new AppError(
      "O perfil do usuário autenticado não pode cancelar este pedido.",
      403,
    );
  }

  return serializePedido(
    await repository.updateStatus(id, { statusPedido: "Cancelado" }),
  );
}

export default {
  findAll,
  findFila,
  buscarAtivoDaMesa,
  findById,
  create,
  update,
  alterarStatus,
  adicionarItem,
  atualizarItem,
  removerItem,
  cancelar,
};
