// Regras locais de autorização e roteamento por tipo de usuário, utilizadas pelo contexto e pelas guardas.
// Declara função rotaInicialPorTipo, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
export function rotaInicialPorTipo(tipo: string): string {
  // Seleciona o comportamento apropriado conforme o estado ou valor recebido.
  switch (tipo) {
    // Trata esta alternativa de estado/valor dentro da decisão do fluxo.
    case "Garçom":
      // Retorna o resultado/renderização desta etapa ao componente ou chamador que coordena o fluxo.
      return "/garcom";
    // Trata esta alternativa de estado/valor dentro da decisão do fluxo.
    case "Administrador":
      // Retorna o resultado/renderização desta etapa ao componente ou chamador que coordena o fluxo.
      return "/admin";
    // Trata esta alternativa de estado/valor dentro da decisão do fluxo.
    case "Cozinheiro":
      // Retorna o resultado/renderização desta etapa ao componente ou chamador que coordena o fluxo.
      return "/cozinha";
    // Trata esta alternativa de estado/valor dentro da decisão do fluxo.
    case "Cliente":
      // Retorna o resultado/renderização desta etapa ao componente ou chamador que coordena o fluxo.
      return "/cliente";
    default:
      // Retorna o resultado/renderização desta etapa ao componente ou chamador que coordena o fluxo.
      return "/login";
  }
}

// Declara função podeAcessarRota, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
export function podeAcessarRota(tipo: string, caminho: string): boolean {
  // Declara valor bases, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
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

  // Verifica a condição do fluxo para decidir se os dados e a navegação devem seguir por este ramo.
  if (!bases) return false;
  // Retorna o resultado/renderização desta etapa ao componente ou chamador que coordena o fluxo.
  return bases.some(
    (base) => caminho === base || caminho.startsWith(base + "/"),
  );
}
