// Componente reutilizável para comunicar à interface que uma lista ou área não possui conteúdo.
// Declara função EmptyState, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
export function EmptyState({ titulo, descricao, icone = "🍽️" }: { titulo: string; descricao?: string; icone?: string }) {
  // Retorna o resultado/renderização desta etapa ao componente ou chamador que coordena o fluxo.
  return (
    <div className="text-center py-5">
      <div style={{ fontSize: "3rem" }}>{icone}</div>
      <h5 className="mt-2">{titulo}</h5>
      {descricao && <p className="text-muted">{descricao}</p>}
    </div>
  );
}
