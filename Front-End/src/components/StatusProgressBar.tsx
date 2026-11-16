// Representação visual do avanço de status de um pedido para as telas de acompanhamento.
// Declara valor PASSOS, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
const PASSOS = ["Aberto", "Em preparo", "Pronto", "Entregue", "Pago"];

// Declara função StatusProgressBar, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
export function StatusProgressBar({ status }: { status: string }) {
  // Declara valor idx, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
  const idx = PASSOS.indexOf(status);
  // Retorna o resultado/renderização desta etapa ao componente ou chamador que coordena o fluxo.
  return (
    <div className="d-flex align-items-center gap-1 my-3">
      {PASSOS.map((p, i) => (
        <div key={p} className="d-flex align-items-center flex-grow-1">
          <div
            className={`rounded-circle ${i <= idx ? "bg-danger" : "bg-light border"}`}
            style={{ width: 14, height: 14 }}
            title={p}
          />
          {i < PASSOS.length - 1 && (
            <div
              className={`flex-grow-1 ${i < idx ? "bg-danger" : "bg-light"}`}
              style={{ height: 3, margin: "0 4px" }}
            />
          )}
        </div>
      ))}
    </div>
  );
}
