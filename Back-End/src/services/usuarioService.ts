const repository = require("../repositories/usuarioRepository");

async function findAll() {
  return repository.findAll();
}

async function findById(id: number) {
  const usuario = await repository.findById(id);
  if (!usuario) {
    throw new Error("Usuário não encontrado.");
  }
  return usuario;
}

async function create(data: any) {
  const usuarioExistente = await repository.findByLogin(data.loginUsuario);
  if (usuarioExistente) {
    throw new Error("Este login de usuário já está em uso.");
  }
  return repository.create(data);
}

async function update(id: number, data: any) {
  await findById(id);
  return repository.update(id, data);
}

async function remove(id: number) {
  await findById(id);
  return repository.remove(id);
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove,
};
