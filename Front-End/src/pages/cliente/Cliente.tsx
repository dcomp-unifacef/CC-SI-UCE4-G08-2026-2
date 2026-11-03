import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useMesaDoTablet } from "../../hooks/useMesaDoTablet";
import {
  buscarPedidoAtivoDaMesa,
  criarPedido,
  adicionarItem,
  alterarItem,
  removerItem,
} from "../../api/pedidos";
import { listarProdutos } from "../../api/produtos";
import { ApiError } from "../../api/client";
import { Layout } from "../../components/Layout";
import { StatusBadge } from "../../components/StatusBadge";
import { podeEditarItens } from "../../lib/status";
import { adicionarItem as adicionarCarrinho, alterarQuantidade, calcularPrevia, type ItemCarrinho } from "../../lib/carrinho";
import type { Pedido, Produto } from "../../types/api";

export default function Cliente() {
  const { usuario } = useAuth();
  const { mesa, configurarMesa } = useMesaDoTablet();

  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([]);
  const [enviando, setEnviando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  useEffect(() => {
    listarProdutos().then(setProdutos).catch(() => {});
  }, []);

  async function carregar() {
    if (mesa === null) return;
    setCarregando(true);
    setErro(null);
    try {
      setPedido(await buscarPedidoAtivoDaMesa(mesa));
    } catch (e) {
      setErro(e instanceof ApiError ? e.message : "Falha ao carregar.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
  }, [mesa]);

  if (mesa === null) {
    return <ConfigurarTabletInline onSalvar={configurarMesa} />;
  }

  if (carregando) {
    return (
      <Layout>
        <p>Carregando...</p>
      </Layout>
    );
  }

  const ehDono = pedido?.idCliente === usuario?.id;
  const somenteLeitura = pedido !== null && !ehDono;
  const podeEditar = pedido !== null && ehDono && podeEditarItens(pedido.statusPedido);
  const podeAcrescentar = pedido !== null && pedido.idCliente === null && podeEditarItens(pedido.statusPedido);

  async function enviarNovo() {
    if (mesa === null) return;
    setEnviando(true);
    setErro(null);
    try {
      const criado = await criarPedido({
        numeroMesa: mesa,
        itens: carrinho.map((i) => ({ idProduto: i.idProduto, quantidade: i.quantidade })),
      });
      setPedido(criado);
      setCarrinho([]);
    } catch (e) {
      if (e instanceof ApiError && e.status === 409 && e.detalhes?.idPedido) {
        setAviso("A mesa já possui um pedido em andamento.");
        await carregar();
      } else {
        setErro(e instanceof ApiError ? e.message : "Falha ao criar pedido.");
      }
    } finally {
      setEnviando(false);
    }
  }

  async function acrescentar() {
    if (!pedido || mesa === null) return;
    setEnviando(true);
    setErro(null);
    try {
      const atualizado = await criarPedido({
        numeroMesa: mesa,
        itens: carrinho.map((i) => ({ idProduto: i.idProduto, quantidade: i.quantidade })),
      });
      setPedido(atualizado);
      setCarrinho([]);
    } catch (e) {
      if (e instanceof ApiError && e.status === 409 && e.detalhes?.idPedido) {
        setAviso("A mesa já possui um pedido em andamento.");
        await carregar();
      } else {
        setErro(e instanceof ApiError ? e.message : "Falha ao acrescentar.");
      }
    } finally {
      setEnviando(false);
    }
  }

  async function alterarQuantidadeItem(idItem: number, quantidade: number) {
    if (!pedido) return;
    setEnviando(true);
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
      setEnviando(false);
    }
  }

  async function adicionarProduto(produto: Produto) {
    if (!pedido) return;
    setEnviando(true);
    setErro(null);
    try {
      setPedido(await adicionarItem(pedido.idPedido, { idProduto: produto.idProduto, quantidade: 1 }));
    } catch (e) {
      if (e instanceof ApiError && (e.status === 409 || e.status === 403)) {
        setErro(e.message);
        await carregar();
      } else {
        setErro(e instanceof ApiError ? e.message : "Falha ao adicionar.");
      }
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Layout>
      <h1>Mesa {mesa}</h1>
      {aviso && <div className="alert alert-info">{aviso}</div>}
      {erro && <div className="alert alert-danger">{erro}</div>}

      {pedido === null && (
        <>
          <h3>Cardápio</h3>
          <div className="row g-3">
            {produtos
              .filter((p) => p.disponivel)
              .map((p) => (
                <div className="col-md-3" key={p.idProduto}>
                  <button
                    className="btn btn-outline-primary w-100"
                    onClick={() => setCarrinho((c) => adicionarCarrinho(c, p))}
                  >
                    {p.nome} — R$ {Number(p.preco).toFixed(2)}
                  </button>
                </div>
              ))}
          </div>
          <h3 className="mt-4">Carrinho</h3>
          <ul className="list-group mb-3">
            {carrinho.map((i) => (
              <li key={i.idProduto} className="list-group-item d-flex justify-content-between">
                <span>
                  {i.nome} x {i.quantidade}
                </span>
                <div className="d-flex gap-1">
                  <button className="btn btn-sm btn-outline-secondary" onClick={() => setCarrinho((c) => alterarQuantidade(c, i.idProduto, i.quantidade - 1))}>
                    −
                  </button>
                  <button className="btn btn-sm btn-outline-secondary" onClick={() => setCarrinho((c) => alterarQuantidade(c, i.idProduto, i.quantidade + 1))}>
                    +
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <div className="d-flex justify-content-between">
            <strong>Prévia: R$ {calcularPrevia(carrinho).toFixed(2)}</strong>
            <button className="btn btn-success" disabled={enviando || carrinho.length === 0} onClick={enviarNovo}>
              {enviando ? "Enviando..." : "Fazer pedido"}
            </button>
          </div>
        </>
      )}

      {pedido !== null && (
        <>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <strong>Status:</strong>
            <StatusBadge status={pedido.statusPedido} />
          </div>
          <p>
            <strong>Total:</strong> R$ {Number(pedido.valorTotal).toFixed(2)}
          </p>

          {somenteLeitura && (
            <div className="alert alert-warning">
              O pedido da mesa já está em andamento.
            </div>
          )}

          {!podeEditarItens(pedido.statusPedido) && ehDono && (
            <div className="alert alert-info">O pedido já está em preparo.</div>
          )}

          <h3>Itens</h3>
          <ul className="list-group mb-3">
            {pedido.itens.map((it) => (
              <li key={it.idItemPedido} className="list-group-item d-flex justify-content-between align-items-center">
                <span>
                  {it.produto.nome} x {it.quantidade} — R$ {Number(it.subTotal).toFixed(2)}
                </span>
                {podeEditar && (
                  <div className="d-flex gap-1">
                    <button className="btn btn-sm btn-outline-secondary" disabled={enviando} onClick={() => alterarQuantidadeItem(it.idItemPedido, it.quantidade - 1)}>
                      −
                    </button>
                    <button className="btn btn-sm btn-outline-secondary" disabled={enviando} onClick={() => alterarQuantidadeItem(it.idItemPedido, it.quantidade + 1)}>
                      +
                    </button>
                    <button className="btn btn-sm btn-outline-danger" disabled={enviando} onClick={() => alterarQuantidadeItem(it.idItemPedido, 0)}>
                      Remover
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>

          {podeEditar && (
            <>
              <h3>Adicionar produto</h3>
              <div className="row g-2 mb-3">
                {produtos
                  .filter((p) => p.disponivel)
                  .map((p) => (
                    <div className="col-md-3" key={p.idProduto}>
                      <button className="btn btn-outline-primary w-100" disabled={enviando} onClick={() => adicionarProduto(p)}>
                        {p.nome} — R$ {Number(p.preco).toFixed(2)}
                      </button>
                    </div>
                  ))}
              </div>
            </>
          )}

          {podeAcrescentar && (
            <>
              <h3>Acrescentar itens</h3>
              <div className="row g-2 mb-3">
                {produtos
                  .filter((p) => p.disponivel)
                  .map((p) => (
                    <div className="col-md-3" key={p.idProduto}>
                      <button
                        className="btn btn-outline-primary w-100"
                        onClick={() => setCarrinho((c) => adicionarCarrinho(c, p))}
                      >
                        {p.nome} — R$ {Number(p.preco).toFixed(2)}
                      </button>
                    </div>
                  ))}
              </div>
              <ul className="list-group mb-3">
                {carrinho.map((i) => (
                  <li key={i.idProduto} className="list-group-item d-flex justify-content-between">
                    <span>
                      {i.nome} x {i.quantidade}
                    </span>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => setCarrinho((c) => c.filter((x) => x.idProduto !== i.idProduto))}>
                      Remover
                    </button>
                  </li>
                ))}
              </ul>
              <button className="btn btn-success" disabled={enviando || carrinho.length === 0} onClick={acrescentar}>
                {enviando ? "Enviando..." : "Acrescentar ao pedido"}
              </button>
            </>
          )}
        </>
      )}
    </Layout>
  );
}

function ConfigurarTabletInline({ onSalvar }: { onSalvar: (v: number) => void }) {
  const [valor, setValor] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  return (
    <Layout>
      <h1>Configurar tablet</h1>
      <p className="text-muted">Informe o número da mesa deste tablet.</p>
      {erro && <div className="alert alert-danger">{erro}</div>}
      <div className="input-group" style={{ maxWidth: 320 }}>
        <input
          type="number"
          className="form-control"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
        />
        <button
          className="btn btn-primary"
          onClick={() => {
            const m = Number(valor);
            if (!Number.isInteger(m) || m <= 0) {
              setErro("Informe um número de mesa válido.");
              return;
            }
            setErro(null);
            onSalvar(m);
          }}
        >
          Salvar
        </button>
      </div>
    </Layout>
  );
}
