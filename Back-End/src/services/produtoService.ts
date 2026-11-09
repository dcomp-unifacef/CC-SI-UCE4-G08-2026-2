import repository from "../repositories/produtoRepository";
import { AppError } from "../errors/AppError";
import { CreateProdutoDto } from "../dto/produto/createProdutoDto";
import { UpdateProdutoDto } from "../dto/produto/updateProdutoDto";
import { serializeProduto } from "../utils/serializers";

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

function validarPreco(valor: unknown): number {
  if (typeof valor !== "number" || !Number.isFinite(valor) || valor <= 0) {
    throw new AppError("O preço deve ser um número maior que zero.", 400);
  }

  return valor;
}

function validarDisponivel(valor: unknown): boolean {
  if (typeof valor !== "boolean") {
    throw new AppError("O campo disponivel deve ser true ou false.", 400);
  }

  return valor;
}

function validarImagem(valor: unknown): string {
  if (valor === undefined || valor === null) return "";
  if (typeof valor !== "string") {
    throw new AppError("O campo imagem deve ser uma URL.", 400);
  }

  return valor.trim();
}

async function findAll() {
  const produtos = await repository.findAll();
  return produtos.map(serializeProduto);
}

async function findById(id: number) {
  const produto = await repository.findById(id);

  if (!produto) {
    throw new AppError("Produto não encontrado.", 404);
  }

  return serializeProduto(produto);
}

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

async function update(id: number, data: UpdateProdutoDto) {
  await findById(id);

  const dadosAtualizados: UpdateProdutoDto = {};

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

  if (Object.keys(dadosAtualizados).length === 0) {
    throw new AppError(
      "Informe ao menos um campo válido para atualizar.",
      400,
    );
  }

  return serializeProduto(await repository.update(id, dadosAtualizados));
}

async function remove(id: number) {
  await findById(id);
  return serializeProduto(await repository.remove(id));
}

export default {
  findAll,
  findById,
  create,
  update,
  remove,
};
