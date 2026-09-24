// 1. Substituindo os 'require' por 'import' padrão do TypeScript
import repository from "../repositories/usuarioRepository";
import { hash } from "bcryptjs";
import { AppError } from "../errors/AppError"; // Ajuste o caminho se necessário

async function findAll() {
  return repository.findAll();
}

async function findById(id: number) {
  const usuario = await repository.findById(id);
  
  if (!usuario) {
    // Usando seu AppError customizado (404 Not Found)
    throw new AppError("Usuário não encontrado.", 404);
  }
  
  return usuario;
}

async function create(data: any) {
  const usuarioExistente = await repository.findByLogin(data.loginUsuario);
  
  if (usuarioExistente) {
    // Usando seu AppError customizado (400 Bad Request)
    throw new AppError("Este login de usuário já está em uso.", 400);
  }

  // 2. Criptografando a senha antes de salvar no banco de dados
  if (data.senha) {
    data.senha = await hash(data.senha, 8);
  }

  // Garante que o status do usuário seja ativo (true) por padrão no cadastro
  data.statusUsuario = true;

  const novoUsuario = await repository.create(data);

  // Removemos a senha do retorno por privacidade/segurança
  if (novoUsuario) {
    delete novoUsuario.senha;
  }

  return novoUsuario;
}

async function update(id: number, data: any) {
  // O findById já vai disparar o erro 404 caso o ID não exista
  await findById(id);

  // Se o usuário estiver atualizando a senha, criptografa a nova senha também
  if (data.senha) {
    data.senha = await hash(data.senha, 8);
  }

  return repository.update(id, data);
}

async function remove(id: number) {
  await findById(id);
  return repository.remove(id);
}

// 3. Substituindo 'module.exports' pelo export padrão do ES Modules / TypeScript
export default {
  findAll,
  findById,
  create,
  update,
  remove,
};
