// Repository faz a persistência transacional de pedidos e itens com Prisma.
import repository, {
  DadosPedido,
  FiltrosPedido,
  ItemPedidoPersistido,
} from "../repositories/pedidoRepository";
// Erros HTTP controlados comunicam validações e conflitos de negócio aos controllers.
import { AppError } from "../errors/AppError";
// DTO define o formato externo de produto e quantidade recebido nos itens.
import { ItemPedidoInputDto } from "../dto/pedido/itemPedidoDto";
// Regras puras de estados, transições, permissões e cálculos monetários compartilhadas no domínio.
import {
  calcularSubtotal,
  calcularTotal,
  podeEditarPedido,
  podeTransicionar,
  perfilPodeAlterarStatus,
  STATUS_PEDIDO,
  statusPedidoValido,
} from "../domain/pedidoRules";
// Funções de perfil aplicam regras de visibilidade e associação de responsabilidades.
import { ehCliente, normalizarPerfil, PERFIS } from "../domain/perfis";
// Converte resultados do Prisma para formato público, incluindo valores decimais.
import { serializeListaPedidos, serializePedido } from "../utils/serializers";

// Contexto mínimo anexado pelo middleware e encaminhado pelo controller para regras de acesso.
export interface UsuarioAutenticado {
  id: number;
  tipo: string;
}

// Confere que dados recebidos pela API são objeto JSON antes de acessar suas propriedades.
function getObjectData(data: unknown): Record<string, unknown> {
  if (data === null || typeof data !== "object" || Array.isArray(data)) {
    throw new AppError("O corpo da requisição deve ser um objeto JSON.", 400);
  }

  return data as Record<string, unknown>;
}

// Distingue propriedade omitida de propriedade presente em atualizações parciais.
function hasOwn(data: Record<string, unknown>, campo: string): boolean {
  return Object.prototype.hasOwnProperty.call(data, campo);
}

// Valida chaves e quantidades com o mesmo requisito de inteiro positivo.
function validarId(valor: unknown, campo: string): number {
  if (typeof valor !== "number" || !Number.isInteger(valor) || valor <= 0) {
    throw new AppError(`${campo} deve ser um inteiro positivo.`, 400);
  }

  return valor;
}

// Aplica a regra comum de quantidade positiva para um item de pedido.
function validarQuantidade(valor: unknown): number {
  return validarId(valor, "A quantidade");
}

// Valida tempo estimado em minutos e limita valores incompatíveis com a operação.
function validarTempoEstimado(valor: unknown): number {
  if (typeof valor !== "number" || !Number.isInteger(valor) || valor <= 0) {
    throw new AppError("tempoEstimado deve ser um inteiro positivo (minutos).", 400);
  }

  if (valor > 600) {
    throw new AppError("tempoEstimado deve ser no máximo 600 minutos.", 400);
  }

  return valor;
}

// Valida a coleção de itens e agrega linhas repetidas do mesmo produto.
function validarItens(valor: unknown): ItemPedidoInputDto[] {
  if (!Array.isArray(valor) || valor.length === 0) {
    throw new AppError("O pedido deve possuir ao menos um item.", 400);
  }

  // Consolida duplicidades para persistir uma única linha por produto.
  const agrupados = new Map<number, number>();

  // Cada item é validado individualmente antes de acumular quantidade.
  for (const item of valor) {
    const input = getObjectData(item);
    const idProduto = validarId(input.idProduto, "idProduto");
    const quantidade = validarQuantidade(input.quantidade);

    agrupados.set(idProduto, (agrupados.get(idProduto) ?? 0) + quantidade);
  }

  // Converte o mapa de agregação de volta ao contrato aceito pelo restante do service.
  return Array.from(agrupados, ([idProduto, quantidade]) => ({
    idProduto,
    quantidade,
  }));
}

// Valida um único item usado nas operações de inclusão.
function validarItem(valor: unknown): ItemPedidoInputDto {
  const input = getObjectData(valor);
  const idProduto = validarId(input.idProduto, "idProduto");
  const quantidade = validarQuantidade(input.quantidade);

  return { idProduto, quantidade };
}

// Confirma que o usuário existe e está ativo antes de associá-lo ao pedido.
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

// Carrega catálogo, rejeita produtos ausentes/indisponíveis e deriva preço/subtotal persistível.
async function montarItens(
  itensInput: ItemPedidoInputDto[],
): Promise<ItemPedidoPersistido[]> {
  // Busca todos os produtos numa consulta e indexa resultados para validação de cada linha.
  const produtos = await repository.findProdutosByIds(
    itensInput.map((item) => item.idProduto),
  );
  const mapaProdutos = new Map(
    produtos.map((produto) => [produto.idProduto, produto]),
  );

  // Monta valores persistidos a partir do catálogo do banco, sem confiar em preços externos.
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

// Recupera pedido obrigatório e padroniza erro 404 para reuso nos casos de uso.
async function buscarPedido(id: number) {
  const pedido = await repository.findById(id);

  if (!pedido) {
    throw new AppError("Pedido não encontrado.", 404);
  }

  return pedido;
}

// Lista pedidos e força clientes autenticados a consultar exclusivamente os próprios.
async function findAll(
  filtros: FiltrosPedido,
  usuario?: UsuarioAutenticado,
) {
  const filtrosAjustados = { ...filtros };

  // Sobrepõe filtro informado para impedir que cliente amplie a própria visibilidade.
  if (usuario && ehCliente(usuario.tipo)) {
    filtrosAjustados.idCliente = usuario.id;
  }

  return serializeListaPedidos(await repository.findAll(filtrosAjustados));
}

// Monta fila operacional com os estados que aguardam preparo ou estão em preparo.
async function findFila() {
  return serializeListaPedidos(
    await repository.findAll({ status: ["Pendente", "Em preparo"] }),
  );
}

// Recupera pedido aberto da mesa e serializa o resultado ou mantém ausência como null.
async function buscarAtivoDaMesa(numeroMesa: number) {
  const pedido = await repository.findAtivoDaMesa(numeroMesa);
  if (!pedido) return null;
  return serializePedido(pedido);
}

// Busca pedido, aplica controle de propriedade para cliente e serializa resposta pública.
async function findById(id: number, usuario?: UsuarioAutenticado) {
  const pedido = await buscarPedido(id);

  if (usuario && ehCliente(usuario.tipo) && pedido.idCliente !== usuario.id) {
    throw new AppError("Você só pode consultar os próprios pedidos.", 403);
  }

  return serializePedido(pedido);
}

// Valida criação, relações de usuários, produtos e totais antes da gravação atômica no repository.
async function create(data: unknown, usuarioAutenticado: UsuarioAutenticado) {
  // Converte corpo JSON em mapa para validar os campos individualmente.
  const input = getObjectData(data);
  // Determina os vínculos: cliente pode não ser informado e garçom pode vir da identidade logada.
  const idCliente =
    input.idCliente === undefined || input.idCliente === null
      ? null
      : validarId(input.idCliente, "idCliente");
  const idGarcom =
    input.idGarcom === undefined || input.idGarcom === null
      ? ehCliente(usuarioAutenticado.tipo)
        ? null
        : usuarioAutenticado.id
      : validarId(input.idGarcom, "idGarcom");
  // Cozinheiro e estimativa são opcionais, mas quando presentes devem ser válidos.
  const idCozinheiro =
    input.idCozinheiro === undefined || input.idCozinheiro === null
      ? null
      : validarId(input.idCozinheiro, "idCozinheiro");
  const tempoEstimado =
    input.tempoEstimado === undefined || input.tempoEstimado === null
      ? null
      : validarTempoEstimado(input.tempoEstimado);

  // Mesa e itens são obrigatórios para criar uma comanda válida.
  const numeroMesa = validarId(input.numeroMesa, "numeroMesa");
  const itensInput = validarItens(input.itens);

  // Cada associação informada deve apontar para usuário ativo.
  if (idCliente !== null) {
    await garantirUsuarioAtivo(idCliente, "Cliente");
  }
  if (idGarcom !== null) {
    await garantirUsuarioAtivo(idGarcom, "Garçom");
  }
  if (idCozinheiro !== null) {
    await garantirUsuarioAtivo(idCozinheiro, "Cozinheiro");
  }

  // Os produtos e preços são carregados do catálogo; total não vem do cliente.
  const itens = await montarItens(itensInput);
  const valorTotal = calcularTotal(itens);

  // Repository cria pedido e itens em transação e o service normaliza a resposta.
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
}

// Altera campos selecionados de pedido pendente e, se necessário, substitui seus itens.
async function update(id: number, data: unknown) {
  const pedido = await buscarPedido(id);

  // O fluxo bloqueia qualquer edição depois que o pedido sai do estado pendente.
  if (!podeEditarPedido(pedido.statusPedido)) {
    throw new AppError(
      "O pedido só pode ser alterado enquanto estiver com status Pendente.",
      409,
    );
  }

  const input = getObjectData(data);
  const dados: DadosPedido = {};
  let itens: ItemPedidoPersistido[] | undefined;

  // Associações e estimativa são opcionais; campos explicitamente nulos podem ser removidos.
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

  // Recalcula itens e total somente quando uma coleção nova foi enviada.
  if (hasOwn(input, "itens")) {
    const itensInput = validarItens(input.itens);
    itens = await montarItens(itensInput);
    dados.valorTotal = calcularTotal(itens);
  }

  // Rejeita corpo sem qualquer alteração reconhecida.
  if (Object.keys(dados).length === 0 && itens === undefined) {
    throw new AppError("Informe ao menos um campo válido para atualizar.", 400);
  }

  return serializePedido(await repository.update(id, dados, itens));
}

// Valida transição e papel antes de gravar novo estado do pedido.
async function alterarStatus(
  id: number,
  data: unknown,
  usuario: UsuarioAutenticado,
) {
  const pedido = await buscarPedido(id);
  const input = getObjectData(data);
  // Aceita aliases de campo usados pelo contrato e valida o estado de destino.
  const novoStatus =
    input.status ?? input.statusPedido;

  if (!statusPedidoValido(novoStatus)) {
    throw new AppError(
      `Status inválido. Valores permitidos: ${STATUS_PEDIDO.join(", ")}.`,
      400,
    );
  }

  // O grafo de domínio rejeita transições fora do fluxo permitido.
  if (!podeTransicionar(pedido.statusPedido, novoStatus)) {
    throw new AppError(
      `Não é possível alterar o status de "${pedido.statusPedido}" para "${novoStatus}".`,
      409,
    );
  }

  // A permissão depende tanto do estado de origem/destino quanto do perfil autenticado.
  if (!perfilPodeAlterarStatus(usuario.tipo, pedido.statusPedido, novoStatus)) {
    throw new AppError(
      "O perfil do usuário autenticado não pode realizar esta alteração de status.",
      403,
    );
  }

  const dados: DadosPedido = { statusPedido: novoStatus };

  // Vincula automaticamente o cozinheiro autenticado ao pedido ao iniciar/concluir preparo.
  if (
    (novoStatus === "Em preparo" || novoStatus === "Pronto") &&
    pedido.idCozinheiro === null &&
    normalizarPerfil(usuario.tipo) === normalizarPerfil(PERFIS.COZINHEIRO)
  ) {
    dados.idCozinheiro = usuario.id;
  }

  return serializePedido(await repository.updateStatus(id, dados));
}

// Acrescenta item a pedido pendente, somando quantidades quando o produto já existe.
async function adicionarItem(id: number, data: unknown) {
  const pedido = await buscarPedido(id);

  // A edição de itens é permitida somente antes do início do preparo.
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

  // Se produto já estiver na comanda, atualiza a linha existente e seu subtotal.
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

  // Produto ainda não associado é incluído como nova linha no repository.
  return serializePedido(await repository.addItem(id, item));
}

// Atualiza quantidade de linha existente e recalcula o subtotal com preço já registrado.
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

  // Localiza linha dentro do pedido para não alterar item de outra comanda.
  const item = pedido.itens.find(
    (itemPedido) => itemPedido.idItemPedido === idItemPedido,
  );

  if (!item) {
    throw new AppError("Item do pedido não encontrado.", 404);
  }

  // A quantidade é o único valor de entrada; preço unitário permanece consistente com o item.
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

// Remove item de pedido pendente, mantendo ao menos uma linha na comanda.
async function removerItem(id: number, idItemPedido: number) {
  const pedido = await buscarPedido(id);

  if (!podeEditarPedido(pedido.statusPedido)) {
    throw new AppError(
      "Itens só podem ser removidos enquanto o pedido estiver Pendente.",
      409,
    );
  }

  // Impede remover item pertencente a outro pedido ou inexistente.
  const item = pedido.itens.find(
    (itemPedido) => itemPedido.idItemPedido === idItemPedido,
  );

  if (!item) {
    throw new AppError("Item do pedido não encontrado.", 404);
  }

  // Pedido não pode ficar sem itens após a remoção.
  if (pedido.itens.length <= 1) {
    throw new AppError("O pedido deve possuir ao menos um item.", 400);
  }

  return serializePedido(await repository.removeItem(idItemPedido, id));
}

// Valida o texto obrigatório que documenta o motivo do cancelamento.
function validarMotivo(valor: unknown): string {
  if (typeof valor !== "string" || valor.trim().length === 0) {
    throw new AppError("O motivo do cancelamento é obrigatório.", 400);
  }

  return valor.trim();
}

// Cancela pedido se a transição e o perfil forem permitidos, registrando justificativa.
async function cancelar(
  id: number,
  usuario: UsuarioAutenticado,
  motivo: unknown,
) {
  const pedido = await buscarPedido(id);

  // Confere transição antes de gravar estado terminal.
  if (!podeTransicionar(pedido.statusPedido, "Cancelado")) {
    throw new AppError(
      `Um pedido com status "${pedido.statusPedido}" não pode ser cancelado.`,
      409,
    );
  }

  // O papel autenticado precisa poder cancelar a partir do estado atual.
  if (!perfilPodeAlterarStatus(usuario.tipo, pedido.statusPedido, "Cancelado")) {
    throw new AppError(
      "O perfil do usuário autenticado não pode cancelar este pedido.",
      403,
    );
  }

  // Persiste cancelamento e motivo no mesmo update e serializa a resposta.
  const motivoCancelamento = validarMotivo(motivo);

  return serializePedido(
    await repository.updateStatus(id, {
      statusPedido: "Cancelado",
      motivoCancelamento,
    }),
  );
}

// Interface pública de casos de uso consumida pelo pedidoController.
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
