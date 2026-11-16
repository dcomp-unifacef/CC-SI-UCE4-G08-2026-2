// Componente visual de uma linha do carrinho, conectando os dados do produto às ações de quantidade e remoção.
// Importa as primitivas React usadas para estado, efeitos e composição da interface; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import { useState } from "react";
// Importa uma regra ou utilitário local reutilizável; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import type { ItemCarrinho } from "../lib/carrinho";

// Declara função CartItem, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
export function CartItem({
  item,
  onAlterar,
  onRemover,
}: {
  item: ItemCarrinho;
  onAlterar: (idProduto: number, quantidade: number) => void;
  onRemover: (idProduto: number) => void;
}) {
  // Inicializa o estado local imagemErro, que o componente atualiza para refletir os dados e as interacoes do usuario.
  const [imagemErro, setImagemErro] = useState(false);

  // Retorna o resultado/renderização desta etapa ao componente ou chamador que coordena o fluxo.
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
