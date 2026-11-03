import type { Produto } from "../types/api";

export function ProductCard({
  produto,
  onAdicionar,
}: {
  produto: Produto;
  onAdicionar: (produto: Produto) => void;
}) {
  return (
    <div className="card h-100">
      <div className="card-body d-flex flex-column">
        <h6 className="card-title">{produto.nome}</h6>
        <p className="card-text text-muted small flex-grow-1">{produto.descricao}</p>
        <div className="d-flex justify-content-between align-items-center">
          <strong>R$ {Number(produto.preco).toFixed(2)}</strong>
          <button
            className="btn btn-sm btn-primary"
            disabled={!produto.disponivel}
            onClick={() => onAdicionar(produto)}
          >
            Adicionar
          </button>
        </div>
      </div>
    </div>
  );
}
