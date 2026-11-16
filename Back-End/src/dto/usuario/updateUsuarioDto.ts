export interface UpdateUsuarioDto {
  // Campos opcionais de edição de usuário validados pelo usuarioService.
  // Identificação, credenciais e estado ativo podem ser alterados parcialmente.
  nome?: string;
  loginUsuario?: string;
  senha?: string;
  statusUsuario?: boolean;
  idTipoUsuario?: number;
}
