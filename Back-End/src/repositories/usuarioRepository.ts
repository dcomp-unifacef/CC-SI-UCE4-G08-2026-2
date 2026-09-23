const { prisma } = require("../database/client");

function findAll() {
  return prisma.usuario.findMany({
    orderBy: {
      nome: "asc",
    },
  });
}

function findById(idUsuario: number) {
  return prisma.usuario.findUnique({
    where: { idUsuario },
  });
}

function findByLogin(loginUsuario: string) {
  return prisma.usuario.findUnique({
    where: { loginUsuario },
  });
}

function create(data: any) {
  return prisma.usuario.create({
    data,
  });
}

function update(idUsuario: number, data: any) {
  return prisma.usuario.update({
    where: { idUsuario },
    data,
  });
}

function remove(idUsuario: number) {
  return prisma.usuario.delete({
    where: { idUsuario },
  });
}

module.exports = {
  findAll,
  findById,
  findByLogin,
  create,
  update,
  remove,
};
