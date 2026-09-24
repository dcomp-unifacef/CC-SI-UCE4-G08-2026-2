import repository from "../repositories/tipoUsuarioRepository";
import { AppError } from "../errors/AppError";

function validarNome(nome: unknown): asserts nome is string {
  if (typeof nome !== "string" || nome.trim().length === 0) {
    throw new AppError("O campo nome é obrigatório.", 400);
  }
  if (nome.trim().length > 50) {
    throw new AppError("O nome deve ter no máximo 50 caracteres.", 400);
  }
}

async function findAll() {
  return repository.findAll();
}

async function findById(id: number) {
  const tipoUsuario = await repository.findById(id);
  if (!tipoUsuario) throw new AppError("Tipo de usuário não encontrado.", 404);
  return tipoUsuario;
}

async function create(nome: unknown) {
  validarNome(nome);
  return repository.create(nome.trim());
}

async function update(id: number, nome: unknown) {
  await findById(id);
  validarNome(nome);
  return repository.update(id, nome.trim());
}

async function remove(id: number) {
  await findById(id);
  try {
    return await repository.remove(id);
  } catch (error: any) {
    // Um tipo associado a usuários não pode ser apagado por causa da FK.
    if (error?.code === "P2003") {
      throw new AppError("Não é possível excluir um tipo associado a usuários.", 409);
    }
    throw error;
  }
}

export default { findAll, findById, create, update, remove };
