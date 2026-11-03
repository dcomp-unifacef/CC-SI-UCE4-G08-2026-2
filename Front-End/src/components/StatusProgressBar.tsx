const PASSOS = ["Aberto", "Em preparo", "Pronto", "Entregue", "Pago"];

export function StatusProgressBar({ status }: { status: string }) {
  const idx = PASSOS.indexOf(status);
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
