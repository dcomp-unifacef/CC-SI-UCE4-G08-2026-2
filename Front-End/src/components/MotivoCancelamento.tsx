// Componente de entrada e confirmação do motivo de cancelamento, usado no fluxo de alteração do pedido.
// Importa os contratos de dados usados entre interface e API; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import type { Pedido } from "../types/api";

// Declara função MotivoCancelamento, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
export function MotivoCancelamento({
  pedido,
}: {
  pedido: Pedido;
}) {
  // Verifica a condição do fluxo para decidir se os dados e a navegação devem seguir por este ramo.
  if (pedido.statusPedido !== "Cancelado" || !pedido.motivoCancelamento) {
    // Retorna o resultado/renderização desta etapa ao componente ou chamador que coordena o fluxo.
    return null;
  }

  // Retorna o resultado/renderização desta etapa ao componente ou chamador que coordena o fluxo.
  return (
    <div className="alert alert-danger">
      <strong>Motivo do cancelamento:</strong> {pedido.motivoCancelamento}
    </div>
  );
}
