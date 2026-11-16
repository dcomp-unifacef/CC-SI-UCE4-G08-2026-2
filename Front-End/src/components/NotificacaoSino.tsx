// Sino de notificações: consulta avisos da API, atualiza contagens e oferece ações na interface.
// Importa as primitivas React usadas para estado, efeitos e composição da interface; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import { useState, useEffect } from "react";
// Importa o roteador React para navegação e acesso às rotas; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import { useNavigate } from "react-router";
// Importa o adaptador de API responsável pela comunicação com o servidor; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import {
  listarNotificacoesPendentes,
  contarNaoLidas,
  marcarComoAtendida,
  marcarComoLida,
} from "../api/notificacoes";
// Importa os contratos de dados usados entre interface e API; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import type { NotificacaoPagamento } from "../types/api";

// Declara função NotificacaoSino, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
export function NotificacaoSino() {
  // Declara valor navigate, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
  const navigate = useNavigate();
  // Inicializa o estado local naoLidas, que o componente atualiza para refletir os dados e as interacoes do usuario.
  const [naoLidas, setNaoLidas] = useState(0);
  // Inicializa o estado local aberta, que o componente atualiza para refletir os dados e as interacoes do usuario.
  const [aberta, setAberta] = useState(false);
  // Inicializa o estado local notificacoes, que o componente atualiza para refletir os dados e as interacoes do usuario.
  const [notificacoes, setNotificacoes] = useState<NotificacaoPagamento[]>([]);
  // Inicializa o estado local carregando, que o componente atualiza para refletir os dados e as interacoes do usuario.
  const [carregando, setCarregando] = useState(true);

  // Sincroniza efeitos externos (API, temporizadores ou navegação) com o ciclo de vida do componente.
  useEffect(() => {
    carregar();
    // Declara valor intervalo, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
    const intervalo = setInterval(carregar, 5000);
    // Retorna o resultado/renderização desta etapa ao componente ou chamador que coordena o fluxo.
    return () => clearInterval(intervalo);
  }, []);

  // Declara função carregar, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
  async function carregar() {
    // Executa a operação sujeita a falhas, como uma chamada à API ou interação com o navegador.
    try {
      // Define a exportação pública deste módulo para integração com as demais partes da aplicação.
      const [{ naoLidas: n }, lista] = await Promise.all([
        contarNaoLidas(),
        listarNotificacoesPendentes(),
      ]);
      setNaoLidas(n);
      setNotificacoes(lista);
    } catch {
      // silencioso; tenta novamente no próximo ciclo
    } finally {
      setCarregando(false);
    }
  }

  // Declara função atender, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
  async function atender(id: number) {
    // Executa a operação sujeita a falhas, como uma chamada à API ou interação com o navegador.
    try {
      await marcarComoAtendida(id);
      await carregar();
    } catch (e) {
      console.error(e);
    }
  }

  // Declara função ler, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
  async function ler(id: number) {
    // Executa a operação sujeita a falhas, como uma chamada à API ou interação com o navegador.
    try {
      await marcarComoLida(id);
      await carregar();
    } catch (e) {
      console.error(e);
    }
  }

  // Declara função formatarHora, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
  function formatarHora(dataHora: string): string {
    // Retorna o resultado/renderização desta etapa ao componente ou chamador que coordena o fluxo.
    return new Date(dataHora).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // Verifica a condição do fluxo para decidir se os dados e a navegação devem seguir por este ramo.
  if (carregando) {
    // Retorna o resultado/renderização desta etapa ao componente ou chamador que coordena o fluxo.
    return (
      <button className="btn btn-outline-dark position-relative" disabled>
        <span className="visually-hidden">Notificações de pagamento</span>
        <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
          0
        </span>
      </button>
    );
  }

  // Retorna o resultado/renderização desta etapa ao componente ou chamador que coordena o fluxo.
  return (
    <div className="dropdown position-relative d-inline-block">
      <button
        className="btn btn-outline-dark position-relative"
        aria-expanded={aberta}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setAberta(!aberta);
        }}
      >
        <span className="visually-hidden">Notificações de pagamento</span>
        {naoLidas > 0 && (
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
            {naoLidas}
          </span>
        )}
      </button>

      {aberta && (
        <div
          className="dropdown-menu dropdown-menu-end p-3 show"
          style={{
            minWidth: "320px",
            maxWidth: "420px",
            display: "block",
            position: "absolute",
            right: 0,
            top: "100%",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <h6 className="dropdown-header text-dark fw-bold">
            🔔 Pagamentos pendentes
          </h6>
          <div className="dropdown-divider"></div>

          {notificacoes.length === 0 ? (
            <div className="dropdown-item-text text-muted text-center small py-2">
              Nenhuma notificação pendente.
            </div>
          ) : (
            <>
              {notificacoes.map((n) => (
                <div
                  key={n.idNotificacao}
                  className="dropdown-item border-bottom py-2 d-flex flex-column gap-1"
                  onClick={() => {
                    atender(n.idNotificacao);
                    setAberta(false);
                    navigate(`/garcom/pedidos/${n.idPedido}`);
                  }}
                >
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <strong className="text-dark">Mesa {n.numeroMesa}</strong>{" "}
                      <span className="badge text-bg-info small">
                        {n.metodoPagamento}
                      </span>
                    </div>
                    <button
                      className="btn btn-sm btn-outline-secondary btn-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        ler(n.idNotificacao);
                      }}
                      title="Marcar como lida"
                    >
                      ✓
                    </button>
                  </div>
                  <div className="text-muted small">
                    Pedido #{n.idPedido} • {formatarHora(n.dataHora)}
                  </div>
                </div>
              ))}
              <div className="dropdown-divider"></div>
              <div className="dropdown-item-text text-center small text-muted">
                Clique em uma notificação para abrir o pedido.
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
