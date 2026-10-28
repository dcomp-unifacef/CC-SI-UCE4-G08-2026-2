import repository from "../repositories/produtoRepository";
import { AppError } from "../errors/AppError";
import { CreateProdutoDto } from "../dto/produto/createProdutoDto";
import { UpdateProdutoDto } from "../dto/produto/updateProdutoDto";
import { validateText } from "../utils/validation";

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

async function findAll() {
  return repository.findAll();
}

async function findById(id: number) {
  const produto = await repository.findById(id);

  if (!produto) {
    throw new AppError("Produto não encontrado.", 404);
  }

  return produto;
}

async function create(data: CreateProdutoDto) {
  const nome = validateText(data.nome, "nome", 80);
  const preco = validarPreco(data.preco);
  const descricao = validateText(data.descricao, "descricao", 100);
  const disponivel =
    data.disponivel === undefined ? true : validarDisponivel(data.disponivel);

  return repository.create({
    nome,
    preco,
    descricao,
    disponivel,
  });
}

async function update(id: number, data: UpdateProdutoDto) {
  await findById(id);

  const dadosAtualizados: UpdateProdutoDto = {};

  if (Object.prototype.hasOwnProperty.call(data, "nome")) {
    dadosAtualizados.nome = validateText(data.nome, "nome", 80);
  }

  if (Object.prototype.hasOwnProperty.call(data, "preco")) {
    dadosAtualizados.preco = validarPreco(data.preco);
  }

  if (Object.prototype.hasOwnProperty.call(data, "descricao")) {
    dadosAtualizados.descricao = validateText(data.descricao, "descricao", 100);
  }

  if (Object.prototype.hasOwnProperty.call(data, "disponivel")) {
    dadosAtualizados.disponivel = validarDisponivel(data.disponivel);
  }

  if (Object.keys(dadosAtualizados).length === 0) {
    throw new AppError(
      "Informe ao menos um campo válido para atualizar.",
      400,
    );
  }

  return repository.update(id, dadosAtualizados);
}

async function remove(id: number) {
  await findById(id);

  try {
    return await repository.remove(id);
  } catch (error: any) {
    if (error?.code === "P2003") {
      throw new AppError(
        "Não é possível excluir um produto associado a itens de pedido.",
        409,
      );
    }

    throw error;
  }
}

export default {
  findAll,
  findById,
  create,
  update,
  remove,
};
