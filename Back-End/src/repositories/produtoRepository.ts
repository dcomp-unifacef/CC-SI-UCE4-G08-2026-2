// Prisma fornece a persistência do catálogo consumida pelo produtoService.
import { prisma } from "../database/client";
// Tipos de entrada de produto orientam a escrita; os DTOs de usuário abaixo permanecem importados sem uso neste módulo.
import { CreateProdutoDto } from "../dto/produto/createProdutoDto";
import { UpdateProdutoDto } from "../dto/produto/updateProdutoDto";
// DTOs de usuário importados neste arquivo e mantidos como no código existente.
import { CreateUsuarioDto } from "../dto/usuario/createUsuarioDto";
import { UpdateUsuarioDto } from "../dto/usuario/updateUsuarioDto";

// Lista o catálogo em ordem alfabética para apresentação.
function findAll() {
  return prisma.produto.findMany({
    orderBy: {
      nome: "asc",
    },
  });
}

// Consulta um produto pela chave primária.
function findById(idProduto: number) {
  return prisma.produto.findUnique({
    where: {
      idProduto,
    },
  });
}

// Cria produto e normaliza imagem ausente para string vazia antes da persistência.
function create(data: CreateProdutoDto) {
  return prisma.produto.create({
    data: {
      ...data,
      imagem: data.imagem ?? "",
    },
  });
}

// Atualiza os campos já filtrados/validados pelo produtoService.
function update(idProduto: number, data: UpdateProdutoDto) {
  return prisma.produto.update({
    where: {
      idProduto,
    },
    data,
  });
}

// Remove produto pela chave; conflitos de relacionamento são tratados acima, se aplicável.
function remove(idProduto: number) {
  return prisma.produto.delete({
    where: {
      idProduto,
    },
  });
}

// Exporta operações usadas pelo service e mantém Prisma encapsulado.
export default {
  findAll,
  findById,
  create,
  update,
  remove,
};
