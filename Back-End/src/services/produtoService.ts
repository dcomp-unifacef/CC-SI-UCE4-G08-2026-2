// Repository concentra consultas e gravações do catálogo via Prisma.
import repository from "../repositories/produtoRepository";
// Erros com status HTTP para dados inválidos e produtos ausentes.
import { AppError } from "../errors/AppError";
// Contratos estáticos dos dados recebidos nos fluxos de escrita.
import { CreateProdutoDto } from "../dto/produto/createProdutoDto";
import { UpdateProdutoDto } from "../dto/produto/updateProdutoDto";
// Converte Decimal do Prisma para números antes de devolver resposta JSON.
import { serializeProduto } from "../utils/serializers";

// Valida texto obrigatório e limites de tamanho usados no catálogo.
function validarTexto(
  valor: unknown,
  campo: string,
  tamanhoMaximo: number,
): string {
  if (typeof valor !== "string" || valor.trim().length === 0) {
    throw new AppError(`O campo ${campo} é obrigatório.`, 400);
  }

  const texto = valor.trim();

  if (texto.length > tamanhoMaximo) {
    throw new AppError(
      `O campo ${campo} deve ter no máximo ${tamanhoMaximo} caracteres.`,
      400,
    );
  }

  return texto;
}

// Valida que preço seja número finito positivo antes de persistir.
function validarPreco(valor: unknown): number {
  if (typeof valor !== "number" || !Number.isFinite(valor) || valor <= 0) {
    throw new AppError("O preço deve ser um número maior que zero.", 400);
  }

  return valor;
}

// Garante que disponibilidade seja um booleano JSON.
function validarDisponivel(valor: unknown): boolean {
  if (typeof valor !== "boolean") {
    throw new AppError("O campo disponivel deve ser true ou false.", 400);
  }

  return valor;
}

// Aceita imagem omitida/nula como vazio e valida representação textual quando enviada.
function validarImagem(valor: unknown): string {
  if (valor === undefined || valor === null) return "";
  if (typeof valor !== "string") {
    throw new AppError("O campo imagem deve ser uma URL.", 400);
  }

  return valor.trim();
}

// Lista catálogo e adapta valores retornados pelo Prisma para a API.
async function findAll() {
  const produtos = await repository.findAll();
  return produtos.map(serializeProduto);
}

// Busca produto e converte ausência em 404 antes de serializar o resultado.
async function findById(id: number) {
  const produto = await repository.findById(id);

  if (!produto) {
    throw new AppError("Produto não encontrado.", 404);
  }

  return serializeProduto(produto);
}

// Valida todos os campos, define disponibilidade padrão e cria produto no repository.
async function create(data: CreateProdutoDto) {
  const nome = validarTexto(data.nome, "nome", 80);
  const preco = validarPreco(data.preco);
  const descricao = validarTexto(data.descricao, "descricao", 100);
  const disponivel =
    data.disponivel === undefined ? true : validarDisponivel(data.disponivel);
  const imagem = validarImagem(data.imagem);

  const produto = await repository.create({
    nome,
    preco,
    descricao,
    imagem,
    disponivel,
  });

  return serializeProduto(produto);
}

// Atualiza somente propriedades explicitamente presentes, rejeitando corpo sem mudanças.
async function update(id: number, data: UpdateProdutoDto) {
  // Confirma existência antes de processar a alteração.
  await findById(id);

  const dadosAtualizados: UpdateProdutoDto = {};

  // Cada verificação de presença permite update parcial sem apagar campos omitidos.
  if (Object.prototype.hasOwnProperty.call(data, "nome")) {
    dadosAtualizados.nome = validarTexto(data.nome, "nome", 80);
  }

  if (Object.prototype.hasOwnProperty.call(data, "preco")) {
    dadosAtualizados.preco = validarPreco(data.preco);
  }

  if (Object.prototype.hasOwnProperty.call(data, "descricao")) {
    dadosAtualizados.descricao = validarTexto(data.descricao, "descricao", 100);
  }

  if (Object.prototype.hasOwnProperty.call(data, "disponivel")) {
    dadosAtualizados.disponivel = validarDisponivel(data.disponivel);
  }

  if (Object.prototype.hasOwnProperty.call(data, "imagem")) {
    dadosAtualizados.imagem = validarImagem(data.imagem);
  }

  // Recusa atualização vazia para evitar escrita sem intenção definida.
  if (Object.keys(dadosAtualizados).length === 0) {
    throw new AppError(
      "Informe ao menos um campo válido para atualizar.",
      400,
    );
  }

  return serializeProduto(await repository.update(id, dadosAtualizados));
}

// Verifica existência, exclui no repository e serializa o resultado persistido.
async function remove(id: number) {
  await findById(id);
  return serializeProduto(await repository.remove(id));
}

// Superfície de casos de uso consumida pelo produtoController.
export default {
  findAll,
  findById,
  create,
  update,
  remove,
};
