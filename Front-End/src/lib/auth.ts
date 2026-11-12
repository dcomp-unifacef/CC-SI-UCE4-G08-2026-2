export function rotaInicialPorTipo(tipo: string): string {
  switch (tipo) {
    case "Garçom":
      return "/garcom";
    case "Administrador":
      return "/admin";
    case "Cozinheiro":
      return "/cozinha";
    case "Cliente":
      return "/cliente";
    default:
      return "/login";
  }
}

export function podeAcessarRota(tipo: string, caminho: string): boolean {
  const bases:
    | string[]
    | null =
    tipo === "Garçom"
      ? ["/garcom"]
      : tipo === "Administrador"
        ? ["/garcom", "/admin"]
        : tipo === "Cozinheiro"
          ? ["/cozinha"]
          : tipo === "Cliente"
            ? ["/cliente"]
            : null;

  if (!bases) return false;
  return bases.some(
    (base) => caminho === base || caminho.startsWith(base + "/"),
  );
}
