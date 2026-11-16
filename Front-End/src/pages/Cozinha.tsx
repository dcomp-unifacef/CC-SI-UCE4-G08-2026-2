// Painel da cozinha: acompanha pedidos e permite avançar estados conforme o fluxo de preparo.
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
// Importa um hook compartilhado de estado ou comportamento; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import { usePolling } from "../hooks/usePolling";
// Importa o contexto compartilhado, que fornece estado e ações à tela; esses valores conectam a página ao AuthContext.
import { useAuth } from "../contexts/AuthContext";
// Importa os contratos de dados usados entre interface e API; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import type { Pedido } from "../types/api";

// Declara valor STATUS_VISIVEIS_COZINHA, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
const STATUS_VISIVEIS_COZINHA = ["Pendente", "Em preparo", "Pronto"] as const;
// Declara valor STATUS_VISIVEIS_ADMIN, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
const STATUS_VISIVEIS_ADMIN = [
  "Pendente",
  "Aberto",
  "Em preparo",
  "Pronto",
  "Entregue",
  "Cancelado",
] as const;

// Declara função Cozinha, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
export default function Cozinha() {
  // Obtém as ações e os dados de usuário fornecidos pelo contexto global de autenticação.
  const { usuario } = useAuth();
  // Declara valor ehAdmin, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
  const ehAdmin = usuario?.tipo === "Administrador";
  // Declara valor toast, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
  const toast = useToast();
  // Inicializa o estado local pedidos, que o componente atualiza para refletir os dados e as interacoes do usuario.
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  // Inicializa o estado local atualizadoEm, que o componente atualiza para refletir os dados e as interacoes do usuario.
  const [atualizadoEm, setAtualizadoEm] = useState<Date>(new Date());
  // Inicializa o estado local ocupado, que o componente atualiza para refletir os dados e as interacoes do usuario.
  const [ocupado, setOcupado] = useState<number | null>(null);

  // Inicializa o estado local pedidoAberto, que o componente atualiza para refletir os dados e as interacoes do usuario.
  const [pedidoAberto, setPedidoAberto] = useState<Pedido | null>(null);
  // Inicializa o estado local novoStatusAdmin, que o componente atualiza para refletir os dados e as interacoes do usuario.
  const [novoStatusAdmin, setNovoStatusAdmin] = useState<string>("");
  // Inicializa o estado local dataFiltro, que o componente atualiza para refletir os dados e as interacoes do usuario.
  const [dataFiltro, setDataFiltro] = useState<string>("");

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
  }, []);

  usePolling(carregar, 5000);

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

  // Declara valor totalVisiveis, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
  const totalVisiveis = statusVisiveis.reduce(
    (acc, status) => acc + grupos[status].length,
    0,
  );

  // Ações rápidas para cozinheiro/garçom (não admin)
  function acoesRapidas(pedido: Pedido) {
    // Declara valor s, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
    const s = pedido.statusPedido;
    // Declara valor acoes, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
    const acoes: Array<{ rotulo: string; novoStatus: string; cor: string }> =
      [];

    // Verifica a condição do fluxo para decidir se os dados e a navegação devem seguir por este ramo.
    if (s === "Pendente" || s === "Aberto") {
      acoes.push({ rotulo: "Iniciar preparo", novoStatus: "Em preparo", cor: "warning" });
    }
    // Verifica a condição do fluxo para decidir se os dados e a navegação devem seguir por este ramo.
    if (s === "Em preparo") {
      acoes.push({ rotulo: "Marcar como pronto", novoStatus: "Pronto", cor: "info" });
    }
    acoes.push({ rotulo: "Cancelar pedido", novoStatus: "Cancelado", cor: "danger" });
    // Retorna o resultado/renderização desta etapa ao componente ou chamador que coordena o fluxo.
    return acoes;
  }

  // Status para os quais um pedido pode transicionar (para o select do admin)
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
      <h1>Cozinha</h1>
      {ehAdmin && (
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

      <small className="text-muted">
        Atualizado às {atualizadoEm.toLocaleTimeString("pt-BR")}
      </small>
    </Layout>
  );
}
