export function EmptyState({ titulo, descricao, icone = "🍽️" }: { titulo: string; descricao?: string; icone?: string }) {
  return (
    <div className="text-center py-5">
      <div style={{ fontSize: "3rem" }}>{icone}</div>
      <h5 className="mt-2">{titulo}</h5>
      {descricao && <p className="text-muted">{descricao}</p>}
    </div>
  );
}
