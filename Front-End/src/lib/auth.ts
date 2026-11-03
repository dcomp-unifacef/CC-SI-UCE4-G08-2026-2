export function rotaInicialPorTipo(tipo: string): string {
  switch (tipo) {
    case "Garçom":
    case "Administrador":
      return "/garcom";
    case "Cozinheiro":
      return "/cozinha";
    case "Cliente":
      return "/cliente";
    default:
      return "/login";
  }
}

export function podeAcessarRota(tipo: string, caminho: string): boolean {
  const base =
    tipo === "Garçom" || tipo === "Administrador"
      ? "/garcom"
      : tipo === "Cozinheiro"
        ? "/cozinha"
        : tipo === "Cliente"
          ? "/cliente"
          : null;

  if (!base) return false;
  return caminho === base || caminho.startsWith(base + "/");
}
