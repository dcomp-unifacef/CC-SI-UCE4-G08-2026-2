export const PERFIS = {
  ADMINISTRADOR: "Administrador",
  GERENTE: "Gerente",
  GARCOM: "Garçom",
  COZINHEIRO: "Cozinheiro",
  CLIENTE: "Cliente",
} as const;

export type Perfil = (typeof PERFIS)[keyof typeof PERFIS];

export function normalizarPerfil(perfil: string | undefined | null): string {
  return (perfil ?? "").trim().toLowerCase();
}

export function ehAdministrador(perfil: string | undefined | null): boolean {
  return normalizarPerfil(perfil) === normalizarPerfil(PERFIS.ADMINISTRADOR);
}

export function ehCliente(perfil: string | undefined | null): boolean {
  return normalizarPerfil(perfil) === normalizarPerfil(PERFIS.CLIENTE);
}
