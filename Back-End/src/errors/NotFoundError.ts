// Especializa AppError para representar ausência de recurso com resposta HTTP 404.
// A classe pode ser reutilizada por serviços sem duplicar o código de status.
import { AppError } from './AppError';

// Define mensagem padrão para recursos ausentes e preserva nome específico do erro.
export class NotFoundError extends AppError {
  constructor(message = 'Recurso não encontrado.') {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}
