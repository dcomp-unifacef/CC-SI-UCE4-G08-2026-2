// Placeholder de carregamento para preservar a composição da interface enquanto os dados chegam.
// Declara função Skeleton, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
export function Skeleton({ className = "w-100", height = 16 }: { className?: string; height?: number }) {
  // Retorna o resultado/renderização desta etapa ao componente ou chamador que coordena o fluxo.
  return (
    <div
      className={`placeholder-glow ${className}`}
      style={{ height }}
    >
      <span className="placeholder col-12 h-100 rounded" />
    </div>
  );
}

// Declara função CardSkeleton, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
export function CardSkeleton() {
  // Retorna o resultado/renderização desta etapa ao componente ou chamador que coordena o fluxo.
  return (
    <div className="card">
      <div className="card-body">
        <Skeleton height={20} />
        <div className="mt-2">
          <Skeleton height={14} />
        </div>
        <div className="mt-2">
          <Skeleton height={14} className="w-50" />
        </div>
      </div>
    </div>
  );
}
