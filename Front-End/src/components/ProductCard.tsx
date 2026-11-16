// Cartão de produto reutilizável para apresentar dados do catálogo e iniciar ações de seleção.
// Importa as primitivas React usadas para estado, efeitos e composição da interface; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import { useState } from "react";
// Importa os contratos de dados usados entre interface e API; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import type { Produto } from "../types/api";
// Importa uma regra ou utilitário local reutilizável; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import { resolverImagem } from "../lib/imagens";

// Declara função ProductCard, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
export function ProductCard({
  produto,
  onAdicionar,
  disabled = false,
}: {
  produto: Produto;
  onAdicionar: (produto: Produto) => void;
  disabled?: boolean;
}) {
  // Inicializa o estado local imagemErro, que o componente atualiza para refletir os dados e as interacoes do usuario.
  const [imagemErro, setImagemErro] = useState(false);
  // Declara valor imagemSrc, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
  const imagemSrc = resolverImagem(produto.nome, produto.imagem);

  // Retorna o resultado/renderização desta etapa ao componente ou chamador que coordena o fluxo.
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
