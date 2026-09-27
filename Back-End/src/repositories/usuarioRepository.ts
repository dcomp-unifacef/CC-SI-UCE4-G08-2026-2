import { prisma } from "../database/client";
import { CreateUsuarioDto } from "../dto/usuario/createUsuarioDto";
import { UpdateUsuarioDto } from "../dto/usuario/updateUsuarioDto";

// Senha fica fora desta seleção para nunca ser devolvida pelos endpoints CRUD.
const publicSelect = {
  idUsuario: true,
  nome: true,
  loginUsuario: true,
  statusUsuario: true,
  idTipoUsuario: true,
  tipoUsuario: { select: { nome: true } },
} as const;

function findAll() {
  return prisma.usuario.findMany({
    select: publicSelect,
    orderBy: { nome: "asc" },
  });
}

function findById(idUsuario: number) {
  return prisma.usuario.findUnique({
    where: { idUsuario },
    select: publicSelect,
  });
}

function findByLogin(loginUsuario: string) {
  return prisma.usuario.findUnique({
    where: { loginUsuario },
    select: { idUsuario: true, loginUsuario: true },
  });
}

function findTipoUsuarioById(idTipoUsuario: number) {
  return prisma.tipoUsuario.findUnique({
    where: { idTipoUsuario },
    select: { idTipoUsuario: true },
  });
}

function create(data: CreateUsuarioDto & { senha: string; statusUsuario: boolean }) {
  return prisma.usuario.create({
    data,
    select: publicSelect,
  });
}

function update(idUsuario: number, data: UpdateUsuarioDto) {
  return prisma.usuario.update({
    where: { idUsuario },
    data,
    select: publicSelect,
  });
}

// Desativar preserva pedidos que apontam para este usuário por chave estrangeira.
function deactivate(idUsuario: number) {
  return prisma.usuario.update({
    where: { idUsuario },
    data: { statusUsuario: false },
    select: publicSelect,
  });
}

export default {
  findAll,
  findById,
  findByLogin,
  findTipoUsuarioById,
  create,
  update,
  deactivate,
};
