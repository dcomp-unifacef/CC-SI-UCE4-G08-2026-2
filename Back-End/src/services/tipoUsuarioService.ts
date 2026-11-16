import repository from "../repositories/tipoUsuarioRepository";
// Repositório encapsula consultas Prisma de tipos/perfis.
// AppError torna falhas de validação e ausência em respostas HTTP controladas.
import { AppError } from "../errors/AppError";
// DTOs descrevem os campos recebidos pelos controllers.
import { CreateTipoUsuarioDto } from "../dto/tipoUsuario/createTipoUsuarioDto";
import { UpdateTipoUsuarioDto } from "../dto/tipoUsuario/updateTipoUsuarioDto";

// Valida nome de perfil antes de qualquer escrita no repository.
function validarNome(nome: unknown): asserts nome is string {
  if (typeof nome !== "string" || nome.trim().length === 0) {
    throw new AppError("O campo nome é obrigatório.", 400);
  }
  if (nome.trim().length > 50) {
    throw new AppError("O nome deve ter no máximo 50 caracteres.", 400);
  }
}

// Lista perfis via camada de persistência.
async function findAll() {
  return repository.findAll();
}

// Carrega perfil ou interrompe fluxo com 404 para reuso em operações posteriores.
async function findById(id: number) {
  const tipoUsuario = await repository.findById(id);
  if (!tipoUsuario) throw new AppError("Tipo de usuário não encontrado.", 404);
  return tipoUsuario;
}

// Valida e normaliza nome antes da criação do tipo de usuário.
async function create(data: CreateTipoUsuarioDto) {
  const nome = data?.nome;
  validarNome(nome);
  return repository.create(nome.trim());
}

// Garante existência, valida novo nome e atualiza o registro.
async function update(id: number, data: UpdateTipoUsuarioDto) {
  await findById(id);
  const nome = data?.nome;
  validarNome(nome);
  return repository.update(id, nome.trim());
}

// Confirma existência e converte conflito de FK em erro de domínio compreensível.
async function remove(id: number) {
  await findById(id);
  try {
    return await repository.remove(id);
  } catch (error: any) {
    // Um tipo associado a usuários não pode ser apagado por causa da FK.
    if (error?.code === "P2003") {
      throw new AppError(
        "Não é possível excluir um tipo associado a usuários.",
        409,
      );
    }
    throw error;
  }
}

// Expõe casos de uso aos controllers, sem expor diretamente o repository.
export default { findAll, findById, create, update, remove };
