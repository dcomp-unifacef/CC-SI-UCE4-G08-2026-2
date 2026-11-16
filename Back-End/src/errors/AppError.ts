// Erro de aplicação com status HTTP explícito, interpretado pelo middleware global em app.ts.
export class AppError extends Error {
  // Mantém a mensagem e o código HTTP junto ao erro para resposta uniforme pela API.
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = "AppError";
  }
}
