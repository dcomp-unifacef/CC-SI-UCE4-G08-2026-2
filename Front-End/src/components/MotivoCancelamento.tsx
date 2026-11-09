import type { Pedido } from "../types/api";

export function MotivoCancelamento({
  pedido,
}: {
  pedido: Pedido;
}) {
  if (pedido.statusPedido !== "Cancelado" || !pedido.motivoCancelamento) {
    return null;
  }

  return (
    <div className="alert alert-danger">
      <strong>Motivo do cancelamento:</strong> {pedido.motivoCancelamento}
    </div>
  );
}
