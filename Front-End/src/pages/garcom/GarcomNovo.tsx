import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../contexts/AuthContext";
import { listarProdutos } from "../../api/produtos";
import { listarUsuarios } from "../../api/usuarios";
import { buscarPedidoAtivoDaMesa, criarPedido } from "../../api/pedidos";
import { ApiError } from "../../api/client";
import { adicionarItem, alterarQuantidade, calcularPrevia, type ItemCarrinho } from "../../lib/carrinho";
import { validarNovoPedido } from "../../lib/pedidoForm";
import { validarMesa } from "../../lib/mesa";
import { Layout } from "../../components/Layout";
import { ProductCard } from "../../components/ProductCard";
import { CartItem } from "../../components/CartItem";
import type { Produto, UsuarioApi } from "../../types/api";

export default function GarcomNovo() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const exigeGarcom = usuario?.tipo === "Administrador";

  const [mesaTexto, setMesaTexto] = useState("");
  const [mesa, setMesa] = useState<number | null>(null);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [garcons, setGarcons] = useState<UsuarioApi[]>([]);
  const [idGarcom, setIdGarcom] = useState<number | null>(
    usuario?.tipo === "Garçom" ? usuario.id : null,
  );
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    listarProdutos().then(setProdutos).catch(() => {});
    if (exigeGarcom) {
      listarUsuarios()
        .then((us) =>
          setGarcons(us.filter((u) => u.tipoUsuario.nome === "Garçom" && u.statusUsuario)),
        )
        .catch(() => {});
    }
  }, [exigeGarcom]);

  async function verificarMesa() {
    const m = validarMesa(mesaTexto);
    if (m === null) {
      setMesa(null);
      return;
    }
    setMesa(m);
    const ativo = await buscarPedidoAtivoDaMesa(m);
    if (ativo) {
      navigate(`/garcom/pedidos/${ativo.idPedido}`, {
        state: { aviso: "mesa já possui pedido em andamento" },
      });
    }
  }

  async function enviar() {
    const m = mesa ?? validarMesa(mesaTexto);
    if (m === null) {
      setErro("Informe um número de mesa válido.");
      return;
    }
    const idG = exigeGarcom ? idGarcom : (usuario?.id ?? null);
    const validacao = validarNovoPedido({
      numeroMesa: m,
      idGarcom: idG,
      itens: carrinho,
      exigeGarcom,
    });
    if (validacao) {
      setErro(validacao);
      return;
    }
    setErro(null);
    setEnviando(true);
    try {
      const pedido = await criarPedido({
        numeroMesa: m,
        idGarcom: idG ?? undefined,
        itens: carrinho.map((i) => ({ idProduto: i.idProduto, quantidade: i.quantidade })),
      });
      navigate(`/garcom/pedidos/${pedido.idPedido}`);
    } catch (e) {
      if (e instanceof ApiError && e.status === 409 && e.detalhes?.idPedido) {
        navigate(`/garcom/pedidos/${e.detalhes.idPedido}`, {
          state: { aviso: "mesa já possui pedido em andamento" },
        });
      } else {
        setErro(e instanceof ApiError ? e.message : "Falha ao criar pedido.");
      }
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Layout>
      <h1>Novo pedido</h1>
      {erro && <div className="alert alert-danger">{erro}</div>}
      <div className="row g-3">
        <div className="col-md-4">
          <label className="form-label">Mesa</label>
          <input
            type="number"
            className="form-control"
            value={mesaTexto}
            onChange={(e) => setMesaTexto(e.target.value)}
            onBlur={verificarMesa}
          />
        </div>
        {exigeGarcom && (
          <div className="col-md-4">
            <label className="form-label">Garçom responsável</label>
            <select
              className="form-select"
              value={idGarcom ?? ""}
              onChange={(e) => setIdGarcom(Number(e.target.value))}
            >
              <option value="">Selecione...</option>
              {garcons.map((g) => (
                <option key={g.idUsuario} value={g.idUsuario}>
                  {g.nome}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <h3 className="mt-4">Cardápio</h3>
      <div className="row g-3">
        {produtos
          .filter((p) => p.disponivel)
          .map((p) => (
            <div className="col-md-3" key={p.idProduto}>
              <ProductCard
                produto={p}
                onAdicionar={(prod) => setCarrinho((c) => adicionarItem(c, prod))}
              />
            </div>
          ))}
      </div>

      <h3 className="mt-4">Carrinho</h3>
      <ul className="list-group mb-3">
        {carrinho.map((i) => (
          <CartItem
            key={i.idProduto}
            item={i}
            onAlterar={(id, q) => setCarrinho((c) => alterarQuantidade(c, id, q))}
            onRemover={(id) => setCarrinho((c) => c.filter((x) => x.idProduto !== id))}
          />
        ))}
      </ul>
      <div className="d-flex justify-content-between align-items-center">
        <strong>Prévia: R$ {calcularPrevia(carrinho).toFixed(2)}</strong>
        <button className="btn btn-success" disabled={enviando} onClick={enviar}>
          {enviando ? "Enviando..." : "Criar pedido"}
        </button>
      </div>
    </Layout>
  );
}
