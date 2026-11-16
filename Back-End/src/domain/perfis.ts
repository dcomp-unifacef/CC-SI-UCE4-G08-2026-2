// Vocabulário canônico de papéis empregado pelos middlewares e pelas regras de domínio.
export const PERFIS = {
  ADMINISTRADOR: "Administrador",
  GERENTE: "Gerente",
  GARCOM: "Garçom",
  COZINHEIRO: "Cozinheiro",
  CLIENTE: "Cliente",
} as const;

// Deriva a união de valores possíveis do próprio catálogo, mantendo tipo e constantes alinhados.
export type Perfil = (typeof PERFIS)[keyof typeof PERFIS];

// Uniformiza caixa e espaços para comparar nomes de perfil vindos do banco ou do token.
export function normalizarPerfil(perfil: string | undefined | null): string {
  return (perfil ?? "").trim().toLowerCase();
}

// Reconhece o papel administrador de forma tolerante à caixa e espaços.
export function ehAdministrador(perfil: string | undefined | null): boolean {
  return normalizarPerfil(perfil) === normalizarPerfil(PERFIS.ADMINISTRADOR);
}

// Reconhece clientes para restringir consultas e aplicar regras próprias de pedido.
export function ehCliente(perfil: string | undefined | null): boolean {
  return normalizarPerfil(perfil) === normalizarPerfil(PERFIS.CLIENTE);
}
