import { AppError } from "../errors/AppError";

export function parseId(raw: unknown): number {
  if (typeof raw !== "string") {
    throw new AppError("O id deve ser um inteiro positivo.", 400);
  }

  const id = Number(raw);

  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError("O id deve ser um inteiro positivo.", 400);
  }

  return id;
}

export function getObjectData(data: unknown): Record<string, unknown> {
  if (data === null || typeof data !== "object" || Array.isArray(data)) {
    throw new AppError("O corpo da requisição deve ser um objeto JSON.", 400);
  }

  return data as Record<string, unknown>;
}

export function validateText(
  value: unknown,
  field: string,
  maxLength: number,
): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new AppError(`O campo ${field} é obrigatório.`, 400);
  }

  const normalized = value.trim();

  if (normalized.length > maxLength) {
    throw new AppError(
      `O campo ${field} deve ter no máximo ${maxLength} caracteres.`,
      400,
    );
  }

  return normalized;
}

export function validatePositiveInt(value: unknown, field: string): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value <= 0) {
    throw new AppError(`O campo ${field} deve ser um inteiro positivo.`, 400);
  }

  return value;
}
