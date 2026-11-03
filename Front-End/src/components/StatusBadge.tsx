const CORES: Record<string, string> = {
  Aberto: "secondary",
  "Em preparo": "warning",
  Pronto: "info",
  Entregue: "primary",
  Pago: "success",
  Cancelado: "danger",
};

export function StatusBadge({ status }: { status: string }) {
  const cor = CORES[status] ?? "secondary";
  return <span className={`badge text-bg-${cor}`}>{status}</span>;
}
