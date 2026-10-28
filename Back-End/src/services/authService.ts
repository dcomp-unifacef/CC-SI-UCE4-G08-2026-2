import { prisma } from "../database/client";
import { compare } from "bcryptjs";
import { AppError } from "../errors/AppError";
import { signToken } from "../utils/jwt";

interface IAuthInput {
  loginUsuario: string;
  senha: string;
}

export async function executeLogin({ loginUsuario, senha }: IAuthInput) {
  const usuario = await prisma.usuario.findUnique({
    where: { loginUsuario },
    include: { tipoUsuario: true }
  });

  if (!usuario) {
    throw new AppError("Login ou senha incorretos.", 401);
  }

  if (!usuario.statusUsuario) {
    throw new AppError("Usuário inativo. Entre em contato com o administrador.", 403);
  }

  const senhaBate = await compare(senha, usuario.senha);

  if (!senhaBate) {
    throw new AppError("Login ou senha incorretos.", 401);
  }

  const token = signToken({
    idUsuario: usuario.idUsuario,
    tipo: usuario.tipoUsuario.nome,
  });

  return {
    usuario: {
      id: usuario.idUsuario,
      nome: usuario.nome,
      login: usuario.loginUsuario,
      tipo: usuario.tipoUsuario.nome
    },
    token
  };
  
}
