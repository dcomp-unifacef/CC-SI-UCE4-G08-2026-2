declare global {
  namespace Express {
    interface Request {
      usuario?: {
        id: number;
        tipo: string;
      };
    }
  }
}

export {};
