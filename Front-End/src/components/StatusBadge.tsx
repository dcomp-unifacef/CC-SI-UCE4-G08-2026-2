// Indicador visual reutilizável do estado atual de um pedido.
// Declara valor CORES, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
const CORES: Record<string, string> = {
  Pendente: "secondary",
  Aberto: "secondary",
  "Em preparo": "warning",
  Pronto: "info",
  Entregue: "primary",
  Pago: "success",
  Cancelado: "danger",
};

// Declara valor ICONES, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
const ICONES: Record<string, string> = {
  Pendente: "📝",
  Aberto: "📝",
  "Em preparo": "👨‍🍳",
  Pronto: "✅",
  Entregue: "🍽️",
  Pago: "💰",
  Cancelado: "❌",
};

// Declara função StatusBadge, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
export function StatusBadge({ status }: { status: string }) {
  // Declara valor cor, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
  const cor = CORES[status] ?? "secondary";
  // Declara valor icone, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
  const icone = ICONES[status] ?? "";
  // Retorna o resultado/renderização desta etapa ao componente ou chamador que coordena o fluxo.
  return (
    <span className={`badge text-bg-${cor}`}>
      {icone} {status}
    </span>
  );
}
