export function validarMesa(valor: string): number | null {
  const n = Number(valor.trim());
  if (!Number.isInteger(n) || n <= 0) return null;
  return n;
}

export function mesaDaUrl(search: string): number | null {
  const params = new URLSearchParams(search);
  const raw = params.get("mesa");
  if (raw === null) return null;
  return validarMesa(raw);
}

export function resolverMesa(
  search: string,
  armazenado: string | null,
): number | null {
  const daUrl = mesaDaUrl(search);
  if (daUrl !== null) return daUrl;
  if (armazenado !== null) return validarMesa(armazenado);
  return null;
}
