import { useState } from "react";
import { solicitarPagamento } from "../api/notificacoes";
import { apiFetch } from "../api/client";
import type { Pedido } from "../types/api";

// Código PIX de exemplo (apenas para testes - não é real)
const CODIGO_PIX_EXEMPLO =
  "00020126580014br.gov.bcb.pix0136f8b8e5f5-4b0a-4c9d-8e7f-1234567890ab520400005303986540510.005802BR5925Cliente Exemplo6009SAO PAULO62070503***6304ABCD";

interface MenuPagamentoProps {
  pedido: Pedido;
  onConcluido: () => void;
}

export function MenuPagamento({ pedido, onConcluido }: MenuPagamentoProps) {
  const [aberta, setAberta] = useState(false);
  const [metodo, setMetodo] = useState<"PIX" | "CARTAO" | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [concluido, setConcluido] = useState(false);

  const qrCodeUrl: string | undefined = metodo === "PIX"
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(CODIGO_PIX_EXEMPLO)}`
    : undefined;

  async function confirmarPagamento() {
    if (!metodo) return;
    setEnviando(true);
    setErro(null);

    try {
      await solicitarPagamento({
        idPedido: pedido.idPedido,
        metodoPagamento: metodo,
      });

      const statusPagamento = metodo === "PIX" ? "Pago" : "Pendente";
      await apiFetch("/pagamentos", {
        method: "POST",
        body: JSON.stringify({
          idPedido: pedido.idPedido,
          formaPagamento: metodo,
          valor: Number(pedido.valorTotal),
          status: statusPagamento,
        }),
      });

      setConcluido(true);
      setAberta(false);
      onConcluido();
    } catch (e: any) {
      setErro(e?.message ?? "Falha ao processar pagamento.");
    } finally {
      setEnviando(false);
    }
  }

  if (concluido) {
    return null;
  }

  return (
    <div className="position-relative d-inline-block">
      <button
        className="btn btn-success position-relative"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setAberta(!aberta);
        }}
        disabled={enviando}
      >
        💳 Pagar
        {aberta && (
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
            ▲
          </span>
        )}
      </button>

      {aberta && (
        <div
          className="dropdown-menu dropdown-menu-start p-3 show"
          style={{
            minWidth: "300px",
            display: "block",
            position: "absolute",
            left: 0,
            top: "100%",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <h6 className="dropdown-header text-dark fw-bold">
            💳 Forma de pagamento
          </h6>
          <div className="dropdown-divider"></div>

          {erro && (
            <div className="alert alert-danger small p-2 mb-3">{erro}</div>
          )}

          {/* Opção PIX */}
          <div
            className={`dropdown-item p-3 border-bottom ${metodo === "PIX" ? "bg-primary text-white" : "text-dark"}`}
            onClick={(e) => {
              e.stopPropagation();
              setMetodo("PIX");
            }}
          >
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <strong>PIX</strong>
                <p className="mb-0 small text-muted">
                  Pague pelo sistema. Pagamento confirmado automaticamente.
                </p>
              </div>
              {metodo === "PIX" && <span className="badge bg-white text-primary">Selecionado</span>}
            </div>
          </div>

          {metodo === "PIX" && (
            <div className="dropdown-item p-3 text-center">
              <img
                src={qrCodeUrl}
                alt="QR Code PIX"
                className="border rounded p-2 bg-white mb-2"
                style={{ maxWidth: "180px", width: "100%" }}
              />
              <p className="text-muted small mb-0">
                Código PIX (apenas teste)
              </p>
            </div>
          )}

          {/* Opção Cartão */}
          <div
            className={`dropdown-item p-3 border-bottom ${metodo === "CARTAO" ? "bg-warning text-dark" : "text-dark"}`}
            onClick={(e) => {
              e.stopPropagation();
              setMetodo("CARTAO");
            }}
          >
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <strong>Cartão</strong>
                <p className="mb-0 small text-muted">
                  O garçom será notificado e levará a maquininha.
                </p>
              </div>
              {metodo === "CARTAO" && <span className="badge bg-white text-dark">Selecionado</span>}
            </div>
          </div>

          <div className="dropdown-divider"></div>

          <div className="dropdown-item p-3 text-center">
            <button
              className="btn btn-lg btn-success w-100"
              disabled={enviando || !metodo}
              onClick={confirmarPagamento}
            >
              {enviando ? "Processando..." : "✅ Confirmar pagamento"}
            </button>
          </div>

          <button
            className="dropdown-item p-2 text-muted small text-center"
            onClick={(e) => {
              e.stopPropagation();
              setAberta(false);
            }}
          >
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
}
