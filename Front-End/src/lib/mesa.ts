// Regras locais para normalizar e validar o número de mesa usado no fluxo de cliente.
// Declara função validarMesa, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
export function validarMesa(valor: string): number | null {
  // Declara valor n, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
  const n = Number(valor.trim());
  // Verifica a condição do fluxo para decidir se os dados e a navegação devem seguir por este ramo.
  if (!Number.isInteger(n) || n <= 0) return null;
  // Retorna o resultado/renderização desta etapa ao componente ou chamador que coordena o fluxo.
  return n;
}

// Declara função mesaDaUrl, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
export function mesaDaUrl(search: string): number | null {
  // Declara valor params, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
  const params = new URLSearchParams(search);
  // Declara valor raw, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
  const raw = params.get("mesa");
  // Verifica a condição do fluxo para decidir se os dados e a navegação devem seguir por este ramo.
  if (raw === null) return null;
  // Retorna o resultado/renderização desta etapa ao componente ou chamador que coordena o fluxo.
  return validarMesa(raw);
}

// Declara função resolverMesa, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
export function resolverMesa(
  search: string,
  armazenado: string | null,
): number | null {
  // Declara valor daUrl, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
  const daUrl = mesaDaUrl(search);
  // Verifica a condição do fluxo para decidir se os dados e a navegação devem seguir por este ramo.
  if (daUrl !== null) return daUrl;
  // Verifica a condição do fluxo para decidir se os dados e a navegação devem seguir por este ramo.
  if (armazenado !== null) return validarMesa(armazenado);
  // Retorna o resultado/renderização desta etapa ao componente ou chamador que coordena o fluxo.
  return null;
}
