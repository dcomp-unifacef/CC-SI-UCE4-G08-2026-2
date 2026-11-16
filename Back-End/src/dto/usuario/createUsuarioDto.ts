export interface CreateUsuarioDto {
  // Dados públicos de entrada do cadastro; usuarioService gera hash da senha antes do repository.
  // Identificação para exibição e login.
  nome: string;
  loginUsuario: string;
  // Senha em texto recebido, transformada em hash antes de chegar ao Prisma.
  senha: string;
  // Chave para o tipo/perfil cadastrado e relacionado ao usuário.
  idTipoUsuario: number;
}
