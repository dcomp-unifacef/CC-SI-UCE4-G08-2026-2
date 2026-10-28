import { prisma } from "../database/client";
import { CreateProdutoDto } from "../dto/produto/createProdutoDto";
import { UpdateProdutoDto } from "../dto/produto/updateProdutoDto";

function findAll() {
  return prisma.produto.findMany({
    orderBy: {
      nome: "asc",
    },
  });
}

function findById(idProduto: number) {
  return prisma.produto.findUnique({
    where: {
      idProduto,
    },
  });
}

function findByIds(ids: number[]) {
  return prisma.produto.findMany({
    where: {
      idProduto: { in: ids },
    },
  });
}

function create(data: CreateProdutoDto) {
  return prisma.produto.create({
    data,
  });
}

function update(idProduto: number, data: UpdateProdutoDto) {
  return prisma.produto.update({
    where: {
      idProduto,
    },
    data,
  });
}

function remove(idProduto: number) {
  return prisma.produto.delete({
    where: {
      idProduto,
    },
  });
}

export default {
  findAll,
  findById,
  findByIds,
  create,
  update,
  remove,
};
