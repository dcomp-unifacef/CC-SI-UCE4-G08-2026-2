export interface UpdateTipoUsuarioDto {
  // Atualização parcial do nome de perfil; a validação de domínio ocorre no service.
  nome?: string;
}
