// Painel administrativo de pedidos, conectando consultas e atualizações da API à interface de operação.
// Importa as primitivas React usadas para estado, efeitos e composição da interface; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import { useEffect, useState } from "react";
// Importa o adaptador de API responsável pela comunicação com o servidor; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import {
  listarPedidos,
  atualizarStatusPedido,
  cancelarPedido,
} from "../api/pedidos";
// Importa o adaptador de API responsável pela comunicação com o servidor; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import { ApiError } from "../api/client";
// Importa um componente reutilizável da interface; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import { Layout } from "../components/Layout";
// Importa um componente reutilizável da interface; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import { useToast } from "../components/Toast";
// Importa um componente reutilizável da interface; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import { StatusBadge } from "../components/StatusBadge";
// Importa um componente reutilizável da interface; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import { Modal } from "../components/Modal";
// Importa um componente reutilizável da interface; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import { MotivoCancelamento } from "../components/MotivoCancelamento";
// Importa um componente reutilizável da interface; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import { EmptyState } from "../components/EmptyState";
// Importa um hook compartilhado de estado ou comportamento; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import { usePolling } from "../hooks/usePolling";
// Importa o contexto compartilhado, que fornece estado e ações à tela; esses valores conectam a página ao AuthContext.
import { useAuth } from "../contexts/AuthContext";
// Importa os contratos de dados usados entre interface e API; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import type { Pedido } from "../types/api";

// Declara valor STATUS_VISIVEIS_ADMIN, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
const STATUS_VISIVEIS_ADMIN = [
  "Pendente",
  "Aberto",
  "Em preparo",
  "Pronto",
  "Entregue",
  "Cancelado",
] as const;

// Declara função AdminPedidos, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
export default function AdminPedidos() {
  // Obtém as ações e os dados de usuário fornecidos pelo contexto global de autenticação.
  const { usuario } = useAuth();
  // Declara valor ehAdmin, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
  const ehAdmin = usuario?.tipo === "Administrador";
  // Declara valor toast, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
  const toast = useToast();

  // Declara valor hoje, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
  const hoje = new Date().toISOString().slice(0, 10);
  // Inicializa o estado local dataFiltro, que o componente atualiza para refletir os dados e as interacoes do usuario.
  const [dataFiltro, setDataFiltro] = useState<string>(hoje);
  // Inicializa o estado local pedidos, que o componente atualiza para refletir os dados e as interacoes do usuario.
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  /** status da aba aberta (null = todos) */
  const [statusAberto, setStatusAberto] = useState<string | null>(null);
  // Inicializa o estado local atualizadoEm, que o componente atualiza para refletir os dados e as interacoes do usuario.
  const [atualizadoEm, setAtualizadoEm] = useState<Date>(new Date());

  // Inicializa o estado local pedidoAberto, que o componente atualiza para refletir os dados e as interacoes do usuario.
  const [pedidoAberto, setPedidoAberto] = useState<Pedido | null>(null);
  // Inicializa o estado local novoStatusAdmin, que o componente atualiza para refletir os dados e as interacoes do usuario.
  const [novoStatusAdmin, setNovoStatusAdmin] = useState<string>("");
  // Inicializa o estado local ocupado, que o componente atualiza para refletir os dados e as interacoes do usuario.
  const [ocupado, setOcupado] = useState<number | null>(null);

  // Declara função carregar, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
  async function carregar() {
    // Executa a operação sujeita a falhas, como uma chamada à API ou interação com o navegador.
    try {
      setPedidos(await listarPedidos({ data: dataFiltro || undefined }));
      setAtualizadoEm(new Date());
    } catch {
      // silencioso; próxima tentativa
    }
  }

  // Sincroniza efeitos externos (API, temporizadores ou navegação) com o ciclo de vida do componente.
  useEffect(() => {
    carregar();
  }, [dataFiltro]);

  usePolling(carregar, 5000);

  /** Pedidos da aba/status selecionado (ou todos quando null) */
  const pedidosDaAba = statusAberto
    ? pedidos.filter((p) => p.statusPedido === statusAberto)
    : pedidos;

  // Declara valor totalPorStatus, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
  const totalPorStatus = STATUS_VISIVEIS_ADMIN.reduce<Record<string, number>>(
    (acc, status) => {
      acc[status] = pedidos.filter((p) => p.statusPedido === status).length;
      // Retorna o resultado/renderização desta etapa ao componente ou chamador que coordena o fluxo.
      return acc;
    },
    {} as Record<string, number>,
  );

  // Declara função mover, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
  async function mover(pedido: Pedido, novoStatus: string) {
    setOcupado(pedido.idPedido);
    // Executa a operação sujeita a falhas, como uma chamada à API ou interação com o navegador.
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

  // Declara função cancelar, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
  async function cancelar(pedido: Pedido) {
    // Declara valor motivo, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
    const motivo = window.prompt("Informe o motivo do cancelamento:");
    // Verifica a condição do fluxo para decidir se os dados e a navegação devem seguir por este ramo.
    if (!motivo || motivo.trim().length === 0) return;
    setOcupado(pedido.idPedido);
    // Executa a operação sujeita a falhas, como uma chamada à API ou interação com o navegador.
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

  // Declara função statusDestinoValido, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
  function statusDestinoValido(atual: string): string[] {
    // Declara valor map, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
    const map: Record<string, string[]> = {
      Pendente: ["Em preparo", "Cancelado"],
      Aberto: ["Em preparo", "Cancelado"],
      "Em preparo": ["Pronto", "Cancelado"],
      Pronto: ["Entregue", "Cancelado"],
      Entregue: [],
      Cancelado: [],
    };
    // Retorna o resultado/renderização desta etapa ao componente ou chamador que coordena o fluxo.
    return map[atual] ?? [];
  }

  // Declara função alterarStatusAdmin, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
  async function alterarStatusAdmin(novoStatus: string) {
    // Verifica a condição do fluxo para decidir se os dados e a navegação devem seguir por este ramo.
    if (!pedidoAberto) return;
    // Verifica a condição do fluxo para decidir se os dados e a navegação devem seguir por este ramo.
    if (!novoStatus || novoStatus === pedidoAberto.statusPedido) return;
    mover(pedidoAberto, novoStatus);
  }

  // Retorna o resultado/renderização desta etapa ao componente ou chamador que coordena o fluxo.
  return (
    <Layout>
      <div className="mb-3">
        <label className="form-label small d-block mb-1">
          Filtrar pedidos por dia:
        </label>
        <div className="input-group input-group-sm" style={{ maxWidth: 260 }}>
          <input
            // Define a exportação pública deste módulo para integração com as demais partes da aplicação.
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
              // Define a exportação pública deste módulo para integração com as demais partes da aplicação.
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
                // Define a exportação pública deste módulo para integração com as demais partes da aplicação.
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
