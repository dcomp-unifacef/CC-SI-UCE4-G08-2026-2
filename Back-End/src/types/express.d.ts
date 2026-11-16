// Amplia a tipagem de Request do Express para registrar os dados definidos pelo middleware JWT.
declare global {
  namespace Express {
    // O middleware autenticar preenche este campo antes das rotas protegidas.
    interface Request {
      usuario?: {
        id: number;
        tipo: string;
      };
    }
  }
}

// Torna este arquivo um módulo e permite que a declaração global seja aplicada pelo TypeScript.
export {};
