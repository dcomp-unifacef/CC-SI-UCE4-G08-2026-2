import { useEffect, useState } from "react";
import {
  listarPedidos,
  atualizarStatusPedido,
  cancelarPedido,
} from "../api/pedidos";
import { ApiError } from "../api/client";
import { Layout } from "../components/Layout";
import { useToast } from "../components/Toast";
import { StatusBadge } from "../components/StatusBadge";
import { Modal } from "../components/Modal";
import { MotivoCancelamento } from "../components/MotivoCancelamento";
import { EmptyState } from "../components/EmptyState";
import { useAuth } from "../contexts/AuthContext";
import type { Pedido } from "../types/api";

const STATUS_VISIVEIS_ADMIN = [
  "Pendente",
  "Aberto",
  "Em preparo",
  "Pronto",
  "Entregue",
  "Cancelado",
] as const;

const LIMITE = 50;

export default function AdminHistorico() {
  const { usuario } = useAuth();
  const ehAdmin = usuario?.tipo === "Administrador";
  const toast = useToast();

  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [pagina, setPagina] = useState(1);
  const [filtroData, setFiltroData] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");
  const [temProxima, setTemProxima] = useState(true);
  const [carregando, setCarregando] = useState(false);

  const [pedidoAberto, setPedidoAberto] = useState<Pedido | null>(null);
  const [novoStatusAdmin, setNovoStatusAdmin] = useState<string>("");
  const [ocupado, setOcupado] = useState<number | null>(null);

  async function carregar() {
    setCarregando(true);
    try {
      const lista = await listarPedidos({
        status: filtroStatus || undefined,
        data: filtroData || undefined,
        page: pagina,
        limit: LIMITE,
      });
      setPedidos(lista);
      setTemProxima(lista.length === LIMITE);
    } catch {
      // silencioso
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
  }, [pagina, filtroData, filtroStatus]);

  async function mover(pedido: Pedido, novoStatus: string) {
    setOcupado(pedido.idPedido);
    try {
      await atualizarStatusPedido(pedido.idPedido, novoStatus);
      await carregar();
      setPedidoAberto(null);
    } catch (e) {
      toast.mostrar(e instanceof ApiError ? e.message : "Falha ao atualizar.", "error");
      await carregar();
    } finally {
      setOcupado(null);
    }
  }

  async function cancelar(pedido: Pedido) {
    const motivo = window.prompt("Informe o motivo do cancelamento:");
    if (!motivo || motivo.trim().length === 0) return;
    setOcupado(pedido.idPedido);
    try {
      await cancelarPedido(pedido.idPedido, { motivo: motivo.trim() });
      await carregar();
      setPedidoAberto(null);
    } catch (e) {
      toast.mostrar(e instanceof ApiError ? e.message : "Falha ao cancelar.", "error");
      await carregar();
    } finally {
      setOcupado(null);
    }
  }

  function statusDestinoValido(atual: string): string[] {
    const map: Record<string, string[]> = {
      Pendente: ["Em preparo", "Cancelado"],
      Aberto: ["Em preparo", "Cancelado"],
      "Em preparo": ["Pronto", "Cancelado"],
      Pronto: ["Entregue", "Cancelado"],
      Entregue: [],
      Cancelado: [],
    };
    return map[atual] ?? [];
  }

  async function alterarStatusAdmin(novoStatus: string) {
    if (!pedidoAberto) return;
    if (!novoStatus || novoStatus === pedidoAberto.statusPedido) return;
    mover(pedidoAberto, novoStatus);
  }

  function resumoItens(pedido: Pedido) {
    return pedido.itens
      .map((it) => `${it.quantidade}x ${it.produto.nome}`)
      .join(", ");
  }

  return (
    <Layout>
      <h1>Histórico de pedidos</h1>

      <div className="mb-3 row g-2 align-items-end">
        <div className="col-md-3 col-sm-6">
          <label className="form-label small d-block mb-1">Data</label>
          <input
            type="date"
            className="form-control form-control-sm"
            value={filtroData}
            onChange={(e) => {
              setFiltroData(e.target.value);
              setPagina(1);
            }}
          />
        </div>
        <div className="col-md-3 col-sm-6">
          <label className="form-label small d-block mb-1">Status</label>
          <select
            className="form-select form-select-sm"
            value={filtroStatus}
            onChange={(e) => {
              setFiltroStatus(e.target.value);
              setPagina(1);
            }}
          >
            <option value="">Todos</option>
            {STATUS_VISIVEIS_ADMIN.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-2 d-grid">
          <button
            className="btn btn-primary btn-sm"
            disabled={carregando}
            onClick={carregar}
          >
            Atualizar
          </button>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-sm align-middle">
          <thead>
            <tr>
              <th>#</th>
              <th>Mesa</th>
              <th>Cliente</th>
              <th>Garçom</th>
              <th>Data / Hora</th>
              <th>Status</th>
              <th>Valor total</th>
              <th>Itens</th>
              <th className="text-end">Ações</th>
            </tr>
          </thead>
          <tbody>
            {carregando && pedidos.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center py-4">
                  <div className="spinner-border text-primary" role="status" />
                </td>
              </tr>
            ) : pedidos.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center py-4">
                  <EmptyState
                    titulo="Nenhum pedido encontrado"
                    descricao="Tente ajustar o filtro de data ou status."
                    icone="📂"
                  />
                </td>
              </tr>
            ) : (
              pedidos.map((p) => (
                <tr
                  key={p.idPedido}
                  className="cursor-pointer"
                  onClick={() => setPedidoAberto(p)}
                >
                  <td>#{p.idPedido}</td>
                  <td>
                    <strong>Mesa {p.numeroMesa}</strong>
                  </td>
                  <td>{p.cliente?.nome ?? "—"}</td>
                  <td>{p.garcom?.nome ?? "—"}</td>
                  <td>
                    {new Date(p.dataHora).toLocaleString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td><StatusBadge status={p.statusPedido} /></td>
                  <td>
                    R$ {Number(p.valorTotal).toFixed(2)}
                  </td>
                  <td className="small text-muted">
                    {resumoItens(p)}
                  </td>
                  <td className="text-end">
                    <button
                      className="btn btn-sm btn-outline-primary"
                      disabled={ocupado === p.idPedido}
                      onClick={(e) => {
                        e.stopPropagation();
                        setPedidoAberto(p);
                      }}
                    >
                      {ocupado === p.idPedido ? "..." : "Abrir"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="d-flex justify-content-between mt-3">
        <button
          className="btn btn-sm btn-outline-secondary"
          disabled={pagina === 1 || carregando}
          onClick={() => setPagina(pagina - 1)}
        >
          Anterior
        </button>
        <button
          className="btn btn-sm btn-outline-secondary"
          disabled={!temProxima || carregando}
          onClick={() => setPagina(pagina + 1)}
        >
          Próxima
        </button>
      </div>
      <small className="text-muted">
        Exibindo até {LIMITE} pedidos por página, do mais recente para o mais antigo.
      </small>

      {/* Modal: entrar no pedido para alterar status / cancelar (admin) */}
      {pedidoAberto && (
        <Modal onFechar={() => setPedidoAberto(null)} fecharAoClicarFora>
          <div className="modal-header">
            <h5 className="modal-title">
              Pedido Mesa {pedidoAberto.numeroMesa}
            </h5>
            <button
              type="button"
              className="btn-close"
              aria-label="Fechar"
              onClick={() => setPedidoAberto(null)}
            />
          </div>
          <div className="modal-body">
            <div className="d-flex justify-content-between mb-2">
              <strong>Status:</strong>
              <StatusBadge status={pedidoAberto.statusPedido} />
            </div>
            <ul className="list-group list-group-flush mb-3">
              {pedidoAberto.itens.map((it) => (
                <li
                  key={it.idItemPedido}
                  className="list-group-item d-flex justify-content-between align-items-center"
                >
                  <span>
                    {it.quantidade}x {it.produto.nome}
                  </span>
                  <span className="badge text-bg-secondary">
                    R$ {Number(it.subTotal).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
            <p className="text-muted small">
              Total:
              R$ {Number(pedidoAberto.valorTotal).toFixed(2)}
            </p>
            <MotivoCancelamento pedido={pedidoAberto} />

            {ehAdmin && (
              <>
                <div className="mt-3">
                  <label className="form-label small d-block mb-1">
                    Alterar status para:
                  </label>
                  <select
                    className="form-select form-select-sm"
                    value={novoStatusAdmin}
                    onChange={(e) => setNovoStatusAdmin(e.target.value)}
                    disabled={ocupado === pedidoAberto.idPedido}
                  >
                    <option value="">Escolha...</option>
                    {statusDestinoValido(pedidoAberto.statusPedido).map(
                      (st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ),
                    )}
                  </select>
                  <button
                    className="btn btn-sm btn-primary mt-2"
                    disabled={
                      !novoStatusAdmin || ocupado === pedidoAberto.idPedido
                    }
                    onClick={() => alterarStatusAdmin(novoStatusAdmin)}
                  >
                    Aplicar alteração
                  </button>
                </div>
                <div className="mt-3">
                  <button
                    className="btn btn-sm btn-danger"
                    disabled={ocupado === pedidoAberto.idPedido}
                    onClick={() => cancelar(pedidoAberto)}
                  >
                    Cancelar pedido (com motivo)
                  </button>
                </div>
              </>
            )}
          </div>
          <div className="modal-footer">
            {pedidoAberto.statusPedido !== "Cancelado" &&
            pedidoAberto.statusPedido !== "Entregue" && (
              <button
                type="button"
                className="btn btn-outline-secondary ms-2"
                onClick={() => setPedidoAberto(null)}
              >
                Fechar
              </button>
            )}
          </div>
        </Modal>
      )}
    </Layout>
  );
}
