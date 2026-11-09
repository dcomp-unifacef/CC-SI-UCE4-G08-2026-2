import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router";
import {
  buscarPedido,
  atualizarPedido,
  cancelarPedido,
  adicionarItem,
  alterarItem,
  removerItem,
} from "../../api/pedidos";
import { listarProdutos } from "../../api/produtos";
import { ApiError } from "../../api/client";
import { StatusBadge } from "../../components/StatusBadge";
import { StatusProgressBar } from "../../components/StatusProgressBar";
import { Layout } from "../../components/Layout";
import { ProductCard } from "../../components/ProductCard";
import { acoesDeStatus, podeEditarItens } from "../../lib/status";
import { dispararConfetti } from "../../lib/confetti";
import type { Pedido, Produto } from "../../types/api";

export default function GarcomPedido() {
  const { id } = useParams();
  const location = useLocation();
  const aviso = (location.state as { aviso?: string } | null)?.aviso;

  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);

  async function carregar() {
    if (!id) return;
    setCarregando(true);
    try {
      setPedido(await buscarPedido(Number(id)));
    } catch (e) {
      setErro(e instanceof ApiError ? e.message : "Falha ao carregar.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
    listarProdutos().then(setProdutos).catch(() => {});
  }, [id]);

  async function executarAcao(novoStatus: string, confirmar?: boolean) {
    if (!pedido) return;

    let motivo: string | undefined;
    if (novoStatus === "Cancelado") {
      const digitado = window.prompt("Informe o motivo do cancelamento:");
      if (!digitado || digitado.trim().length === 0) return;
      motivo = digitado.trim();
    }

    if (confirmar && !window.confirm("Tem certeza?")) return;
    setOcupado(true);
    setErro(null);
    try {
      let atualizado: Pedido;
      if (novoStatus === "Cancelado") {
        atualizado = await cancelarPedido(pedido.idPedido, { motivo: motivo!.trim() });
      } else {
        atualizado = await atualizarPedido(pedido.idPedido, { statusPedido: novoStatus });
        if (novoStatus === "Entregue") dispararConfetti();
      }
      setPedido(atualizado);
    } catch (e) {
      if (e instanceof ApiError && (e.status === 409 || e.status === 403)) {
        setErro(e.message);
        await carregar();
      } else {
        setErro(e instanceof ApiError ? e.message : "Falha ao atualizar.");
      }
    } finally {
      setOcupado(false);
    }
  }

  async function adicionar(produto: Produto) {
    if (!pedido) return;
    setOcupado(true);
    setErro(null);
    try {
      const atualizado = await adicionarItem(pedido.idPedido, {
        idProduto: produto.idProduto,
        quantidade: 1,
      });
      setPedido(atualizado);
    } catch (e) {
      if (e instanceof ApiError && (e.status === 409 || e.status === 403)) {
        setErro(e.message);
        await carregar();
      } else {
        setErro(e instanceof ApiError ? e.message : "Falha ao adicionar.");
      }
    } finally {
      setOcupado(false);
    }
  }

  async function alterarQuantidadeItem(idItem: number, quantidade: number) {
    if (!pedido) return;
    setOcupado(true);
    setErro(null);
    try {
      if (quantidade <= 0) {
        setPedido(await removerItem(pedido.idPedido, idItem));
      } else {
        setPedido(await alterarItem(pedido.idPedido, idItem, { quantidade }));
      }
    } catch (e) {
      if (e instanceof ApiError && (e.status === 409 || e.status === 403)) {
        setErro(e.message);
        await carregar();
      } else {
        setErro(e instanceof ApiError ? e.message : "Falha ao alterar.");
      }
    } finally {
      setOcupado(false);
    }
  }

  if (carregando) return <Layout><p>Carregando...</p></Layout>;
  if (!pedido) return <Layout><div className="alert alert-danger">{erro ?? "Pedido não encontrado."}</div></Layout>;

  const editavel = podeEditarItens(pedido.statusPedido);

  return (
    <Layout>
      {aviso && <div className="alert alert-info">{aviso}</div>}
      {erro && <div className="alert alert-danger">{erro}</div>}
      {!editavel && (
        <div className="alert alert-info">
          Os itens não podem mais ser alterados: o pedido já avançou para{" "}
          <strong>{pedido.statusPedido}</strong>.
        </div>
      )}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1>Mesa {pedido.numeroMesa}</h1>
        <StatusBadge status={pedido.statusPedido} />
      </div>
      <StatusProgressBar status={pedido.statusPedido} />
      <p>
        <strong>Total:</strong> R$ {Number(pedido.valorTotal).toFixed(2)}
      </p>

      <h3>Itens</h3>
      <ul className="list-group mb-3">
        {pedido.itens.map((it) => (
          <li key={it.idItemPedido} className="list-group-item d-flex justify-content-between align-items-center">
            <div>
              {it.produto.nome} x {it.quantidade}
              <small className="text-muted d-block">R$ {Number(it.subTotal).toFixed(2)}</small>
            </div>
            {editavel && (
              <div className="d-flex gap-1">
                <button className="btn btn-sm btn-outline-secondary" disabled={ocupado} onClick={() => alterarQuantidadeItem(it.idItemPedido, it.quantidade - 1)}>
                  −
                </button>
                <button className="btn btn-sm btn-outline-secondary" disabled={ocupado} onClick={() => alterarQuantidadeItem(it.idItemPedido, it.quantidade + 1)}>
                  +
                </button>
                <button className="btn btn-sm btn-outline-danger" disabled={ocupado} onClick={() => alterarQuantidadeItem(it.idItemPedido, 0)}>
                  Remover
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>

      {editavel && (
        <>
          <h3>Adicionar produto</h3>
          <div className="row g-2 mb-3">
            {produtos
              .filter((p) => p.disponivel)
              .map((p) => (
                <div className="col-md-3" key={p.idProduto}>
                  <ProductCard
                    produto={p}
                    onAdicionar={adicionar}
                    disabled={ocupado}
                  />
                </div>
              ))}
          </div>
        </>
      )}

      <div className="d-flex gap-2">
        {acoesDeStatus(pedido.statusPedido).map((a) => (
          <button
            key={a.novoStatus}
            className="btn btn-outline-dark"
            disabled={ocupado}
            onClick={() => executarAcao(a.novoStatus, a.confirmar)}
          >
            {a.rotulo}
          </button>
        ))}
      </div>
    </Layout>
  );
}
