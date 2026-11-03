export function Skeleton({ className = "w-100", height = 16 }: { className?: string; height?: number }) {
  return (
    <div
      className={`placeholder-glow ${className}`}
      style={{ height }}
    >
      <span className="placeholder col-12 h-100 rounded" />
    </div>
  );
}

export function CardSkeleton() {
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
