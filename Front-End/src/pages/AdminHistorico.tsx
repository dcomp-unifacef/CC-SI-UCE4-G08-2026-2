// Tela administrativa de histórico, consultando pedidos e apresentando filtros e detalhes do período.
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

// Declara valor LIMITE, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
const LIMITE = 50;

// Declara função AdminHistorico, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
export default function AdminHistorico() {
  // Obtém as ações e os dados de usuário fornecidos pelo contexto global de autenticação.
  const { usuario } = useAuth();
  // Declara valor ehAdmin, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
  const ehAdmin = usuario?.tipo === "Administrador";
  // Declara valor toast, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
  const toast = useToast();

  // Inicializa o estado local pedidos, que o componente atualiza para refletir os dados e as interacoes do usuario.
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  // Inicializa o estado local pagina, que o componente atualiza para refletir os dados e as interacoes do usuario.
  const [pagina, setPagina] = useState(1);
  // Inicializa o estado local filtroData, que o componente atualiza para refletir os dados e as interacoes do usuario.
  const [filtroData, setFiltroData] = useState("");
  // Inicializa o estado local filtroStatus, que o componente atualiza para refletir os dados e as interacoes do usuario.
  const [filtroStatus, setFiltroStatus] = useState("");
  // Inicializa o estado local temProxima, que o componente atualiza para refletir os dados e as interacoes do usuario.
  const [temProxima, setTemProxima] = useState(true);
  // Inicializa o estado local carregando, que o componente atualiza para refletir os dados e as interacoes do usuario.
  const [carregando, setCarregando] = useState(false);

  // Inicializa o estado local pedidoAberto, que o componente atualiza para refletir os dados e as interacoes do usuario.
  const [pedidoAberto, setPedidoAberto] = useState<Pedido | null>(null);
  // Inicializa o estado local novoStatusAdmin, que o componente atualiza para refletir os dados e as interacoes do usuario.
  const [novoStatusAdmin, setNovoStatusAdmin] = useState<string>("");
  // Inicializa o estado local ocupado, que o componente atualiza para refletir os dados e as interacoes do usuario.
  const [ocupado, setOcupado] = useState<number | null>(null);

  // Declara função carregar, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
  async function carregar() {
    setCarregando(true);
    // Executa a operação sujeita a falhas, como uma chamada à API ou interação com o navegador.
    try {
      // Declara valor lista, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
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

  // Sincroniza efeitos externos (API, temporizadores ou navegação) com o ciclo de vida do componente.
  useEffect(() => {
    carregar();
  }, [pagina, filtroData, filtroStatus]);

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

  // Declara função resumoItens, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
  function resumoItens(pedido: Pedido) {
    // Retorna o resultado/renderização desta etapa ao componente ou chamador que coordena o fluxo.
    return pedido.itens
      .map((it) => `${it.quantidade}x ${it.produto.nome}`)
      .join(", ");
  }

  // Retorna o resultado/renderização desta etapa ao componente ou chamador que coordena o fluxo.
  return (
    <Layout>
      <h1>Histórico de pedidos</h1>

      <div className="mb-3 row g-2 align-items-end">
        <div className="col-md-3 col-sm-6">
          <label className="form-label small d-block mb-1">Data</label>
          <input
            // Define a exportação pública deste módulo para integração com as demais partes da aplicação.
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
