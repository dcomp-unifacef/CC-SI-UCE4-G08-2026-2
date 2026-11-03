const CORES: Record<string, string> = {
  Aberto: "secondary",
  "Em preparo": "warning",
  Pronto: "info",
  Entregue: "primary",
  Pago: "success",
  Cancelado: "danger",
};

const ICONES: Record<string, string> = {
  Aberto: "📝",
  "Em preparo": "👨‍🍳",
  Pronto: "✅",
  Entregue: "🍽️",
  Pago: "💰",
  Cancelado: "❌",
};

export function StatusBadge({ status }: { status: string }) {
  const cor = CORES[status] ?? "secondary";
  const icone = ICONES[status] ?? "";
  return (
    <span className={`badge text-bg-${cor}`}>
      {icone} {status}
    </span>
  );
}
