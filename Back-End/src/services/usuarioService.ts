import repository from "../repositories/usuarioRepository";
import { hash } from "bcryptjs";
import { AppError } from "../errors/AppError";
import { CreateUsuarioDto } from "../dto/usuario/createUsuarioDto";
import { UpdateUsuarioDto } from "../dto/usuario/updateUsuarioDto";
import { ROLE_CLIENTE } from "../utils/roles";
import {
  getObjectData,
  validatePositiveInt,
  validateText,
} from "../utils/validation";

function validatePassword(value: unknown): string {
  if (
    typeof value !== "string" ||
    value.length === 0 ||
    value.trim().length === 0
  ) {
    throw new AppError("O campo senha é obrigatório.", 400);
  }
  if (value.length > 255) {
    throw new AppError("A senha deve ter no máximo 255 caracteres.", 400);
  }
  // A senha é preservada exatamente como enviada; espaços podem fazer parte dela.
  return value;
}

function validateIdTipoUsuario(value: unknown): number {
  return validatePositiveInt(value, "idTipoUsuario");
}

function throwDatabaseError(error: any): never {
  if (error?.code === "P2002") {
    throw new AppError("Este login de usuário já está em uso.", 409);
  }
  if (error?.code === "P2003") {
    throw new AppError(
      "A relação do usuário com o tipo não pôde ser aplicada.",
      400,
    );
  }
  throw error;
}

async function ensureTipoUsuarioExists(idTipoUsuario: number) {
  const tipoUsuario = await repository.findTipoUsuarioById(idTipoUsuario);
  if (!tipoUsuario) throw new AppError("Tipo de usuário não encontrado.", 400);
}

async function findAll() {
  return repository.findAll();
}

async function findById(id: number) {
  const usuario = await repository.findById(id);
  if (!usuario) throw new AppError("Usuário não encontrado.", 404);
  return usuario;
}

async function resolverTipoUsuario(
  input: Record<string, unknown>,
  isAdmin: boolean,
) {
  if (isAdmin && input.idTipoUsuario !== undefined) {
    return validateIdTipoUsuario(input.idTipoUsuario);
  }

  const tipoCliente = await repository.findTipoUsuarioByNome(ROLE_CLIENTE);

  if (!tipoCliente) {
    throw new AppError("Tipo de usuário Cliente não configurado.", 500);
  }

  return tipoCliente.idTipoUsuario;
}

async function create(
  data: unknown,
  options: { isAdmin?: boolean } = {},
) {
  const input = getObjectData(data);
  const nome = validateText(input.nome, "nome", 80);
  const loginUsuario = validateText(input.loginUsuario, "loginUsuario", 80);
  const senha = validatePassword(input.senha);
  const idTipoUsuario = await resolverTipoUsuario(input, options.isAdmin === true);

  const usuarioExistente = await repository.findByLogin(loginUsuario);
  if (usuarioExistente)
    throw new AppError("Este login de usuário já está em uso.", 409);
  await ensureTipoUsuarioExists(idTipoUsuario);

  const dadosUsuario: CreateUsuarioDto & { statusUsuario: boolean } = {
    nome,
    loginUsuario,
    senha: await hash(senha, 8),
    statusUsuario: true,
    idTipoUsuario,
  };

  try {
    return await repository.create(dadosUsuario);
  } catch (error) {
    return throwDatabaseError(error);
  }
}

async function update(id: number, data: unknown) {
  await findById(id);
  const input = getObjectData(data);
  const dadosAtualizados: UpdateUsuarioDto = {};

  if (Object.prototype.hasOwnProperty.call(input, "nome")) {
    dadosAtualizados.nome = validateText(input.nome, "nome", 80);
  }
  if (Object.prototype.hasOwnProperty.call(input, "loginUsuario")) {
    const loginUsuario = validateText(input.loginUsuario, "loginUsuario", 80);
    const usuarioComLogin = await repository.findByLogin(loginUsuario);
    if (usuarioComLogin && usuarioComLogin.idUsuario !== id) {
      throw new AppError("Este login de usuário já está em uso.", 409);
    }
    dadosAtualizados.loginUsuario = loginUsuario;
  }
  if (Object.prototype.hasOwnProperty.call(input, "senha")) {
    const senha = validatePassword(input.senha);
    dadosAtualizados.senha = await hash(senha, 8);
  }
  if (Object.prototype.hasOwnProperty.call(input, "statusUsuario")) {
    if (typeof input.statusUsuario !== "boolean") {
      throw new AppError("statusUsuario deve ser true ou false.", 400);
    }
    dadosAtualizados.statusUsuario = input.statusUsuario;
  }
  if (Object.prototype.hasOwnProperty.call(input, "idTipoUsuario")) {
    const idTipoUsuario = validateIdTipoUsuario(input.idTipoUsuario);
    await ensureTipoUsuarioExists(idTipoUsuario);
    dadosAtualizados.idTipoUsuario = idTipoUsuario;
  }

  if (Object.keys(dadosAtualizados).length === 0) {
    throw new AppError("Informe ao menos um campo válido para atualizar.", 400);
  }

  try {
    return await repository.update(id, dadosAtualizados);
  } catch (error) {
    return throwDatabaseError(error);
  }
}

async function remove(id: number) {
  await findById(id);
  return repository.deactivate(id);
}

export default {
  findAll,
  findById,
  create,
  update,
  remove,
};
