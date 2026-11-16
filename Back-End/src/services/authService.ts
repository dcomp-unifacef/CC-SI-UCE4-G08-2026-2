// Prisma consulta a identidade armazenada e o perfil usado na autorização posterior.
import { prisma } from "../database/client";
// bcryptjs compara a senha recebida com o hash armazenado sem expor credencial.
import { compare } from "bcryptjs";
// jsonwebtoken assina o token consumido pelo middleware de autenticação.
import { sign } from "jsonwebtoken";
// Erro HTTP para credenciais inválidas ou conta inativa.
import { AppError } from "../errors/AppError";
// Configuração JWT compartilhada com o middleware que verifica os tokens.
import { getJwtExpiresIn, getJwtSecret } from "../config/auth";

// Entrada mínima do login validada pelo controller antes da execução do caso de uso.
interface IAuthInput {
  loginUsuario: string;
  senha: string;
}

// Autentica o usuário, verifica atividade e senha, emite JWT e retorna dados públicos.
export async function executeLogin({ loginUsuario, senha }: IAuthInput) {
  // Carrega perfil para incluí-lo no token e na resposta destinada ao cliente.
  const usuario = await prisma.usuario.findUnique({
    where: { loginUsuario },
    include: { tipoUsuario: true },
  });

  // Evita revelar se a conta existe ao responder por login desconhecido.
  if (!usuario) {
    throw new AppError("Login ou senha incorretos.", 401);
  }

  // Conta desativada não pode obter um token novo.
  if (!usuario.statusUsuario) {
    throw new AppError(
      "Usuário inativo. Entre em contato com o administrador.",
      403,
    );
  }

  // Confere senha em texto com hash persistido; senha incorreta usa mensagem genérica.
  const senhaBate = await compare(senha, usuario.senha);

  if (!senhaBate) {
    throw new AppError("Login ou senha incorretos.", 401);
  }

  // Inclui papel e nome no payload; subject identifica usuário e options configuram validade.
  const token = sign(
    {
      tipo: usuario.tipoUsuario.nome,
      nome: usuario.nome,
    },
    getJwtSecret(),
    {
      subject: String(usuario.idUsuario),
      expiresIn: getJwtExpiresIn(),
    },
  );

  // Retorna token e projeção pública, sem hash de senha.
  return {
    usuario: {
      id: usuario.idUsuario,
      nome: usuario.nome,
      login: usuario.loginUsuario,
      tipo: usuario.tipoUsuario.nome,
    },
    token,
  };
}
