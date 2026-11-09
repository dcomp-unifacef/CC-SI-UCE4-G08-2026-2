import { useState } from "react";
import type { ItemCarrinho } from "../lib/carrinho";

export function CartItem({
  item,
  onAlterar,
  onRemover,
}: {
  item: ItemCarrinho;
  onAlterar: (idProduto: number, quantidade: number) => void;
  onRemover: (idProduto: number) => void;
}) {
  const [imagemErro, setImagemErro] = useState(false);

  return (
    <li className="list-group-item d-flex align-items-center gap-2">
      <div className="cart-item__img">
        {imagemErro ? (
          <span className="product-card__emoji" aria-label="Imagem do produto">
            🍔
          </span>
        ) : (
          <img
            src={item.imagem}
            alt={item.nome}
            loading="lazy"
            onError={() => setImagemErro(true)}
          />
        )}
      </div>
      <div className="flex-grow-1">
        <div>{item.nome}</div>
        <small className="text-muted">
          R$ {item.preco.toFixed(2)} x {item.quantidade}
        </small>
      </div>
      <div className="d-flex align-items-center gap-1">
        <button className="btn btn-sm btn-outline-secondary" onClick={() => onAlterar(item.idProduto, item.quantidade - 1)}>
          −
        </button>
        <span>{item.quantidade}</span>
        <button className="btn btn-sm btn-outline-secondary" onClick={() => onAlterar(item.idProduto, item.quantidade + 1)}>
          +
        </button>
        <button className="btn btn-sm btn-outline-danger" onClick={() => onRemover(item.idProduto)}>
          Remover
        </button>
      </div>
    </li>
  );
}
