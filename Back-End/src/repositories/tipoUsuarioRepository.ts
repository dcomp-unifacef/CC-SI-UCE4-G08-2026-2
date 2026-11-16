import { prisma } from "../database/client";
// Cliente Prisma compartilhado para persistência dos tipos/perfis de usuário.

// Retorna os tipos cadastrados em ordem alfabética.
function findAll() {
  return prisma.tipoUsuario.findMany({ orderBy: { nome: "asc" } });
}

// Localiza um perfil pela chave para verificações no service.
function findById(idTipoUsuario: number) {
  return prisma.tipoUsuario.findUnique({ where: { idTipoUsuario } });
}

// Cria tipo com nome previamente validado pelo tipoUsuarioService.
function create(nome: string) {
  return prisma.tipoUsuario.create({ data: { nome } });
}

// Altera o nome de um perfil existente.
function update(idTipoUsuario: number, nome: string) {
  return prisma.tipoUsuario.update({ where: { idTipoUsuario }, data: { nome } });
}

// Exclui o tipo; restrições de chave estrangeira são traduzidas pelo service.
function remove(idTipoUsuario: number) {
  return prisma.tipoUsuario.delete({ where: { idTipoUsuario } });
}

// API de persistência consumida pelo tipoUsuarioService.
export default { findAll, findById, create, update, remove };
