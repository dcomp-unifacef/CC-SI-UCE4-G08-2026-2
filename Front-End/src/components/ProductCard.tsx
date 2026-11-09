import { useState } from "react";
import type { Produto } from "../types/api";
import { resolverImagem } from "../lib/imagens";

export function ProductCard({
  produto,
  onAdicionar,
  disabled = false,
}: {
  produto: Produto;
  onAdicionar: (produto: Produto) => void;
  disabled?: boolean;
}) {
  const [imagemErro, setImagemErro] = useState(false);
  const imagemSrc = resolverImagem(produto.nome, produto.imagem);

  return (
    <div className="card h-100 product-card">
      <div className="product-card__img">
        {imagemErro ? (
          <span className="product-card__emoji" aria-label="Imagem do produto">
            🍔
          </span>
        ) : (
          <img
            src={imagemSrc}
            alt={produto.nome}
            loading="lazy"
            onError={() => setImagemErro(true)}
          />
        )}
      </div>
      <div className="card-body d-flex flex-column">
        <h6 className="card-title">{produto.nome}</h6>
        <p className="card-text text-muted small flex-grow-1">
          {produto.descricao}
        </p>
        <div className="d-flex justify-content-between align-items-center">
          <strong className="fs-5 text-danger">
            R$ {Number(produto.preco).toFixed(2)}
          </strong>
          <button
            className="btn btn-sm btn-primary"
            disabled={disabled || !produto.disponivel}
            onClick={() => onAdicionar(produto)}
          >
            ➕ Adicionar
          </button>
        </div>
      </div>
    </div>
  );
}
