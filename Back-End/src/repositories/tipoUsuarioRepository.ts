import { prisma } from "../database/client";

function findAll() {
  return prisma.tipoUsuario.findMany({ orderBy: { nome: "asc" } });
}

function findById(idTipoUsuario: number) {
  return prisma.tipoUsuario.findUnique({ where: { idTipoUsuario } });
}

function create(nome: string) {
  return prisma.tipoUsuario.create({ data: { nome } });
}

function update(idTipoUsuario: number, nome: string) {
  return prisma.tipoUsuario.update({ where: { idTipoUsuario }, data: { nome } });
}

function remove(idTipoUsuario: number) {
  return prisma.tipoUsuario.delete({ where: { idTipoUsuario } });
}

export default { findAll, findById, create, update, remove };
