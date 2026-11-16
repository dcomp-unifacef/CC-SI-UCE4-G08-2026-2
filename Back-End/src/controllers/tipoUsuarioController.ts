import service from "../services/tipoUsuarioService";
// Service coordena validações de perfil e repository Prisma.
// Erro HTTP para parâmetros inválidos.
import { AppError } from "../errors/AppError";
// Tipos dos corpos aceitos nas operações de criação e atualização.
import { CreateTipoUsuarioDto } from "../dto/tipoUsuario/createTipoUsuarioDto";
import { UpdateTipoUsuarioDto } from "../dto/tipoUsuario/updateTipoUsuarioDto";

// Valida ID recebido na URL e fornece chave numérica ao service.
function parseId(raw: string): number {
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError("O id deve ser um inteiro positivo.", 400);
  }
  return id;
}

// Lista os tipos de usuário existentes.
export async function retrieveAll(req: any, res: any, next: any) {
  try {
    return res.json(await service.findAll());
  } catch (error) {
    return next(error);
  }
}

// Recupera perfil por identificador e propaga ausência como erro controlado.
export async function retrieveOne(req: any, res: any, next: any) {
  try {
    return res.json(await service.findById(parseId(req.params.id)));
  } catch (error) {
    return next(error);
  }
}

// Cria um perfil a partir do DTO e indica sucesso com status 201.
export async function create(req: any, res: any, next: any) {
  try {
    const data = req.body as CreateTipoUsuarioDto;
    return res.status(201).json(await service.create(data));
  } catch (error) {
    return next(error);
  }
}

// Atualiza nome de perfil depois de validar o ID.
export async function update(req: any, res: any, next: any) {
  try {
    const data = req.body as UpdateTipoUsuarioDto;
    return res.json(await service.update(parseId(req.params.id), data));
  } catch (error) {
    return next(error);
  }
}

// Remove perfil, com conflitos de chave estrangeira tratados pelo service.
export async function remove(req: any, res: any, next: any) {
  try {
    await service.remove(parseId(req.params.id));
    return res.status(204).end();
  } catch (error) {
    return next(error);
  }
}
