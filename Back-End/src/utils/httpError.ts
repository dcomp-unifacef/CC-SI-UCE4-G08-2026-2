import { AppError } from "../errors/AppError";

export interface ErroFormatado {
  status: number;
  body: Record<string, unknown>;
}

export function formatarErro(error: unknown): ErroFormatado {
  if (error instanceof AppError) {
    return {
      status: error.statusCode,
      body: { erro: error.message, ...error.details },
    };
  }

  if (error instanceof SyntaxError && "body" in error) {
    return {
      status: 400,
      body: { erro: "JSON inválido no corpo da requisição." },
    };
  }

  return {
    status: 500,
    body: { erro: "Erro interno do servidor." },
  };
}
