import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  listarNotificacoesPendentes,
  contarNaoLidas,
  marcarComoAtendida,
  marcarComoLida,
} from "../api/notificacoes";
import type { NotificacaoPagamento } from "../types/api";

export function NotificacaoSino() {
  const navigate = useNavigate();
  const [naoLidas, setNaoLidas] = useState(0);
  const [aberta, setAberta] = useState(false);
  const [notificacoes, setNotificacoes] = useState<NotificacaoPagamento[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregar();
    const intervalo = setInterval(carregar, 5000);
    return () => clearInterval(intervalo);
  }, []);

  async function carregar() {
    try {
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

  async function atender(id: number) {
    try {
      await marcarComoAtendida(id);
      await carregar();
    } catch (e) {
      console.error(e);
    }
  }

  async function ler(id: number) {
    try {
      await marcarComoLida(id);
      await carregar();
    } catch (e) {
      console.error(e);
    }
  }

  function formatarHora(dataHora: string): string {
    return new Date(dataHora).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (carregando) {
    return (
      <button className="btn btn-outline-dark position-relative" disabled>
        <span className="visually-hidden">Notificações de pagamento</span>
        <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
          0
        </span>
      </button>
    );
  }

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
