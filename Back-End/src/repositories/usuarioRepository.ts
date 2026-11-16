import { prisma } from "../database/client";
// Cliente Prisma usado pelo serviço de usuários para consultas e alterações persistentes.
// DTOs definem os campos graváveis que o usuarioService validou.
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

// Lista usuários sem retornar hashes de senha e com nome do perfil para exibição.
function findAll() {
  return prisma.usuario.findMany({
    select: publicSelect,
    orderBy: { nome: "asc" },
  });
}

// Consulta usuário por chave primária usando projeção pública segura.
function findById(idUsuario: number) {
  return prisma.usuario.findUnique({
    where: { idUsuario },
    select: publicSelect,
  });
}

// Confere unicidade do login sem carregar credenciais sensíveis.
function findByLogin(loginUsuario: string) {
  return prisma.usuario.findUnique({
    where: { loginUsuario },
    select: { idUsuario: true, loginUsuario: true },
  });
}

// Verifica existência de perfil pelo ID antes de criar/atualizar usuário.
function findTipoUsuarioById(idTipoUsuario: number) {
  return prisma.tipoUsuario.findUnique({
    where: { idTipoUsuario },
    select: { idTipoUsuario: true },
  });
}

// Cria usuário com senha já processada pelo service e devolve somente campos públicos.
function create(data: CreateUsuarioDto & { senha: string; statusUsuario: boolean }) {
  return prisma.usuario.create({
    data,
    select: publicSelect,
  });
}

// Atualiza usuário e conserva a projeção sem senha na resposta.
function update(idUsuario: number, data: UpdateUsuarioDto) {
  return prisma.usuario.update({
    where: { idUsuario },
    data,
    select: publicSelect,
  });
}

// Desativar preserva pedidos que apontam para este usuário por chave estrangeira.
// Atualiza estado de atividade em vez de apagar o registro relacionado.
function deactivate(idUsuario: number) {
  return prisma.usuario.update({
    where: { idUsuario },
    data: { statusUsuario: false },
    select: publicSelect,
  });
}

// Exporta métodos que compõem a camada de persistência chamada por usuarioService.
export default {
  findAll,
  findById,
  findByLogin,
  findTipoUsuarioById,
  create,
  update,
  deactivate,
};
