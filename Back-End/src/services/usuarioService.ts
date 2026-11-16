import repository from "../repositories/usuarioRepository";
// Repository abstrai o modelo Prisma e protege campos sensíveis nas leituras.
// Hash é aplicado a novas senhas antes que cheguem ao banco.
import { hash } from "bcryptjs";
// Erros de validação e conflitos são expostos à API com status apropriado.
import { AppError } from "../errors/AppError";
// DTOs tipam os campos graváveis do usuário.
import { CreateUsuarioDto } from "../dto/usuario/createUsuarioDto";
import { UpdateUsuarioDto } from "../dto/usuario/updateUsuarioDto";

// Garante que o corpo HTTP seja um objeto antes de ler propriedades.
function getObjectData(data: unknown): Record<string, unknown> {
  if (data === null || typeof data !== "object" || Array.isArray(data)) {
    throw new AppError("O corpo da requisição deve ser um objeto JSON.", 400);
  }
  return data as Record<string, unknown>;
}

// Normaliza texto obrigatório e valida limites usados em nome/login.
function validateText(
  value: unknown,
  field: string,
  maxLength: number,
): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new AppError(`O campo ${field} é obrigatório.`, 400);
  }
  const normalized = value.trim();
  if (normalized.length > maxLength) {
    throw new AppError(
      `O campo ${field} deve ter no máximo ${maxLength} caracteres.`,
      400,
    );
  }
  return normalized;
}

// Valida senha sem removê-la de espaços e conserva exatamente o valor autenticado.
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

// Valida chave de perfil recebida pelo corpo antes de consultar o repository.
function validateIdTipoUsuario(value: unknown): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value <= 0) {
    throw new AppError("idTipoUsuario deve ser um inteiro positivo.", 400);
  }
  return value;
}

// Converte códigos Prisma de unicidade e referência em erros de domínio conhecidos.
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

// Confirma que o perfil relacionado existe antes de criar ou trocar associação.
async function ensureTipoUsuarioExists(idTipoUsuario: number) {
  const tipoUsuario = await repository.findTipoUsuarioById(idTipoUsuario);
  if (!tipoUsuario) throw new AppError("Tipo de usuário não encontrado.", 400);
}

// Lista usuários usando a projeção pública do repository.
async function findAll() {
  return repository.findAll();
}

// Recupera usuário ou lança 404 para reuso em atualização e desativação.
async function findById(id: number) {
  const usuario = await repository.findById(id);
  if (!usuario) throw new AppError("Usuário não encontrado.", 404);
  return usuario;
}

// Valida dados, checa unicidade e perfil, gera hash e cria usuário ativo.
async function create(data: unknown) {
  const input = getObjectData(data);
  const nome = validateText(input.nome, "nome", 80);
  const loginUsuario = validateText(input.loginUsuario, "loginUsuario", 80);
  const senha = validatePassword(input.senha);
  const idTipoUsuario = validateIdTipoUsuario(input.idTipoUsuario);

  // A consulta antecipada melhora a mensagem; a captura ainda protege contra corrida de unicidade.
  const usuarioExistente = await repository.findByLogin(loginUsuario);
  if (usuarioExistente)
    throw new AppError("Este login de usuário já está em uso.", 409);
  await ensureTipoUsuarioExists(idTipoUsuario);

  // O hash substitui a senha original na estrutura enviada à camada de persistência.
  const dadosUsuario: CreateUsuarioDto & { statusUsuario: boolean } = {
    nome,
    loginUsuario,
    senha: await hash(senha, 8),
    statusUsuario: true,
    idTipoUsuario,
  };

  // Converte erros de banco conhecidos e preserva demais falhas para tratamento central.
  try {
    return await repository.create(dadosUsuario);
  } catch (error) {
    return throwDatabaseError(error);
  }
}

// Valida e aplica apenas campos presentes, sem permitir atualização vazia.
async function update(id: number, data: unknown) {
  await findById(id);
  const input = getObjectData(data);
  const dadosAtualizados: UpdateUsuarioDto = {};

  // As verificações por propriedade preservam semântica de PATCH para campos opcionais.
  if (Object.prototype.hasOwnProperty.call(input, "nome")) {
    dadosAtualizados.nome = validateText(input.nome, "nome", 80);
  }
  // Login é único: permite conservar o próprio valor, mas rejeita colisão com outro usuário.
  if (Object.prototype.hasOwnProperty.call(input, "loginUsuario")) {
    const loginUsuario = validateText(input.loginUsuario, "loginUsuario", 80);
    const usuarioComLogin = await repository.findByLogin(loginUsuario);
    if (usuarioComLogin && usuarioComLogin.idUsuario !== id) {
      throw new AppError("Este login de usuário já está em uso.", 409);
    }
    dadosAtualizados.loginUsuario = loginUsuario;
  }
  // Senha nova é validada e substituída por hash antes da escrita.
  if (Object.prototype.hasOwnProperty.call(input, "senha")) {
    const senha = validatePassword(input.senha);
    dadosAtualizados.senha = await hash(senha, 8);
  }
  // Estado deve ser booleano para impedir valores truthy/falsy ambíguos.
  if (Object.prototype.hasOwnProperty.call(input, "statusUsuario")) {
    if (typeof input.statusUsuario !== "boolean") {
      throw new AppError("statusUsuario deve ser true ou false.", 400);
    }
    dadosAtualizados.statusUsuario = input.statusUsuario;
  }
  // Troca de perfil exige tipo válido e existente.
  if (Object.prototype.hasOwnProperty.call(input, "idTipoUsuario")) {
    const idTipoUsuario = validateIdTipoUsuario(input.idTipoUsuario);
    await ensureTipoUsuarioExists(idTipoUsuario);
    dadosAtualizados.idTipoUsuario = idTipoUsuario;
  }

  // Recusa corpo que não alteraria nenhum campo reconhecido.
  if (Object.keys(dadosAtualizados).length === 0) {
    throw new AppError("Informe ao menos um campo válido para atualizar.", 400);
  }

  // Atualiza no repository e converte conflitos de banco da mesma forma que a criação.
  try {
    return await repository.update(id, dadosAtualizados);
  } catch (error) {
    return throwDatabaseError(error);
  }
}

// Desativa logicamente para preservar referências históricas e pedidos associados.
async function remove(id: number) {
  await findById(id);
  return repository.deactivate(id);
}

// Métodos consumidos pelo controller de usuários.
export default {
  findAll,
  findById,
  create,
  update,
  remove,
};
