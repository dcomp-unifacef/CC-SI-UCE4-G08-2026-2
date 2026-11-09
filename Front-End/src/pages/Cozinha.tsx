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
import { usePolling } from "../hooks/usePolling";
import { useAuth } from "../contexts/AuthContext";
import type { Pedido } from "../types/api";

const STATUS_VISIVEIS_COZINHA = ["Pendente", "Em preparo", "Pronto"] as const;
const STATUS_VISIVEIS_ADMIN = [
  "Pendente",
  "Aberto",
  "Em preparo",
  "Pronto",
  "Entregue",
  "Cancelado",
] as const;

export default function Cozinha() {
  const { usuario } = useAuth();
  const ehAdmin = usuario?.tipo === "Administrador";
  const toast = useToast();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [atualizadoEm, setAtualizadoEm] = useState<Date>(new Date());
  const [ocupado, setOcupado] = useState<number | null>(null);

  // Modal de detalhes do pedido ("entrar no pedido")
  const [pedidoAberto, setPedidoAberto] = useState<Pedido | null>(null);
  // Para o admin: status selecionado no select de alteração livre
  const [novoStatusAdmin, setNovoStatusAdmin] = useState<string>("");
  // Para o admin: data selecionada para filtrar pedidos por dia
  const [dataFiltro, setDataFiltro] = useState<string>("");

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
  }, []);

  usePolling(carregar, 5000);

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

  // Quais status são visíveis na tela de cozinha (admin vê todos os status)
  const statusVisiveis = ehAdmin
    ? STATUS_VISIVEIS_ADMIN
    : STATUS_VISIVEIS_COZINHA;

  // Pedidos que cozinheiro/garçom/admin devem ver
  const grupos = Object.fromEntries(
    statusVisiveis.map((status) => [
      status,
      pedidos.filter((p) => p.statusPedido === status),
    ]),
  ) as Record<string, Pedido[]>;

  const totalVisiveis = statusVisiveis.reduce(
    (acc, status) => acc + grupos[status].length,
    0,
  );

  // Ações rápidas para cozinheiro/garçom (não admin)
  function acoesRapidas(pedido: Pedido) {
    const s = pedido.statusPedido;
    const acoes: Array<{ rotulo: string; novoStatus: string; cor: string }> =
      [];

    if (s === "Pendente" || s === "Aberto") {
      acoes.push({ rotulo: "Iniciar preparo", novoStatus: "Em preparo", cor: "warning" });
    }
    if (s === "Em preparo") {
      acoes.push({ rotulo: "Marcar como pronto", novoStatus: "Pronto", cor: "info" });
    }
    acoes.push({ rotulo: "Cancelar pedido", novoStatus: "Cancelado", cor: "danger" });
    return acoes;
  }

  // Status para os quais um pedido pode transicionar (para o select do admin)
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
      <h1>Cozinha</h1>
      {ehAdmin && (
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
              onClick={() => setDataFiltro("")}
              disabled={!dataFiltro}
            >
              Limpar
            </button>
          </div>
          {dataFiltro && (
            <span className="form-text text-muted mt-1">
              Exibindo pedidos de {dataFiltro}
            </span>
          )}
        </div>
      )}

      <p className="text-muted mb-3">
        {ehAdmin
          ? "Todos os pedidos do restaurante. Clique em um pedido para entrar e alterar o status."
          : `Pedidos que aguardam preparo (${totalVisiveis} no total). Clique em um pedido para entrar e alterar o status.`}
      </p>

      <div className="row g-3">
        {statusVisiveis.map((status) => (
          <div className="col-md-4" key={status}>
            <h4>{status}</h4>
            {grupos[status].length === 0 && (
              <div className="alert alert-secondary">Nenhum pedido</div>
            )}
            {grupos[status].map((p) => (
              <div
                className="card mb-2 cursor-pointer"
                key={p.idPedido}
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
            ))}
          </div>
        ))}
      </div>

      {/* Modal: entrar no pedido para alterar status (renderizado via portal no body) */}
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
              <div className="mt-3">
                <label className="form-label small d-block mb-1">
                  Alterar status para (admin):
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
            )}
          </div>
          <div className="modal-footer">
            {!ehAdmin &&
              acoesRapidas(pedidoAberto).map((a) => (
                <button
                  key={a.novoStatus}
                  className={`btn btn-sm btn-${a.cor}`}
                  disabled={ocupado === pedidoAberto.idPedido}
                  onClick={
                    a.novoStatus === "Cancelado"
                      ? () => cancelar(pedidoAberto)
                      : () => mover(pedidoAberto, a.novoStatus)
                  }
                >
                  {a.rotulo}
                </button>
              ))}
            {ehAdmin && (
              <button
                className="btn btn-sm btn-danger"
                disabled={ocupado === pedidoAberto.idPedido}
                onClick={() => cancelar(pedidoAberto)}
              >
                Cancelar pedido (com motivo)
              </button>
            )}
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

      <small className="text-muted">
        Atualizado às {atualizadoEm.toLocaleTimeString("pt-BR")}
      </small>
    </Layout>
  );
}
