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
import { usePolling } from "../hooks/usePolling";
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

export default function AdminPedidos() {
  const { usuario } = useAuth();
  const ehAdmin = usuario?.tipo === "Administrador";
  const toast = useToast();

  const hoje = new Date().toISOString().slice(0, 10);
  const [dataFiltro, setDataFiltro] = useState<string>(hoje);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  /** status da aba aberta (null = todos) */
  const [statusAberto, setStatusAberto] = useState<string | null>(null);
  const [atualizadoEm, setAtualizadoEm] = useState<Date>(new Date());

  const [pedidoAberto, setPedidoAberto] = useState<Pedido | null>(null);
  const [novoStatusAdmin, setNovoStatusAdmin] = useState<string>("");
  const [ocupado, setOcupado] = useState<number | null>(null);

  async function carregar() {
    try {
      setPedidos(await listarPedidos({ data: dataFiltro || undefined }));
      setAtualizadoEm(new Date());
    } catch {
      // silencioso; próxima tentativa
    }
  }

  useEffect(() => {
    carregar();
  }, [dataFiltro]);

  usePolling(carregar, 5000);

  /** Pedidos da aba/status selecionado (ou todos quando null) */
  const pedidosDaAba = statusAberto
    ? pedidos.filter((p) => p.statusPedido === statusAberto)
    : pedidos;

  const totalPorStatus = STATUS_VISIVEIS_ADMIN.reduce<Record<string, number>>(
    (acc, status) => {
      acc[status] = pedidos.filter((p) => p.statusPedido === status).length;
      return acc;
    },
    {} as Record<string, number>,
  );

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

  return (
    <Layout>
      <div className="mb-3">
        <label className="form-label small d-block mb-1">
          Filtrar pedidos por dia:
        </label>
        <div className="input-group input-group-sm" style={{ maxWidth: 260 }}>
          <input
            type="date"
            className="form-control"
            value={dataFiltro}
            onChange={(e) => setDataFiltro(e.target.value)}
          />
          <button
            className="btn btn-outline-secondary"
            onClick={() => setDataFiltro(hoje)}
            disabled={dataFiltro === hoje}
          >
            Hoje
          </button>
        </div>
        {dataFiltro !== hoje && (
          <span className="form-text text-muted mt-1">
            Exibindo pedidos de {dataFiltro}
          </span>
        )}
      </div>

      {/* Abas clicáveis por status */}
      <div className="mb-3">
        <div className="d-flex flex-wrap gap-2">
          <button
            className={`btn btn-sm ${statusAberto === null ? "btn-primary" : "btn-outline-secondary"}`}
            onClick={() => setStatusAberto(null)}
          >
            Todos ({pedidos.length})
          </button>
          {STATUS_VISIVEIS_ADMIN.map((status) => (
            <button
              key={status}
              className={`btn btn-sm ${statusAberto === status ? "btn-primary" : "btn-outline-secondary"}`}
              onClick={() => setStatusAberto(status)}
            >
              {status} ({totalPorStatus[status] ?? 0})
            </button>
          ))}
        </div>
      </div>

      <p className="text-muted mb-3">
        {statusAberto
          ? `Pedidos com status "${statusAberto}" em ${dataFiltro} (${pedidosDaAba.length}). Clique em um pedido para alterar o status.`
          : `Todos os pedidos do restaurante em ${dataFiltro} (${pedidos.length}). Clique em um pedido para alterar o status.`}
      </p>

      <div className="row g-3">
        {pedidosDaAba.length === 0 && (
          <div className="col-12">
            <EmptyState
              titulo="Nenhum pedido"
              descricao={
                statusAberto
                  ? `Não há pedidos com status "${statusAberto}" neste dia.`
                  : "Não há pedidos neste dia."
              }
              icone="📋"
            />
          </div>
        )}
        {pedidosDaAba.map((p) => (
          <div className="col-md-4" key={p.idPedido}>
            <div
              className="card mb-2 cursor-pointer"
              onClick={() => setPedidoAberto(p)}
            >
              <div className="card-body">
                <div className="d-flex justify-content-between">
                  <strong>Mesa {p.numeroMesa}</strong>
                  <StatusBadge status={p.statusPedido} />
                </div>
                <ul className="mb-2 mt-2 small">
                  {p.itens.map((it) => (
                    <li key={it.idItemPedido}>
                      {it.quantidade}x {it.produto.nome}
                    </li>
                  ))}
                </ul>
                <small className="text-muted">
                  {new Date(p.dataHora).toLocaleTimeString("pt-BR")}
                </small>
                <div className="mt-2 text-end small text-muted">
                  Clique para abrir
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <small className="text-muted">
        Atualizado às {atualizadoEm.toLocaleTimeString("pt-BR")}
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
