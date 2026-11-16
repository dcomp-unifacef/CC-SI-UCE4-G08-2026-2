// Menu para selecionar e solicitar uma forma de pagamento, integrando a ação do usuário ao fluxo de pagamento.
// Importa as primitivas React usadas para estado, efeitos e composição da interface; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import { useState } from "react";
// Importa o adaptador de API responsável pela comunicação com o servidor; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import { solicitarPagamento } from "../api/notificacoes";
// Importa o adaptador de API responsável pela comunicação com o servidor; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import { apiFetch } from "../api/client";
// Importa os contratos de dados usados entre interface e API; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import type { Pedido } from "../types/api";

// Código PIX de exemplo (apenas para testes - não é real)
const CODIGO_PIX_EXEMPLO =
  "00020126580014br.gov.bcb.pix0136f8b8e5f5-4b0a-4c9d-8e7f-1234567890ab520400005303986540510.005802BR5925Cliente Exemplo6009SAO PAULO62070503***6304ABCD";

// Declara contrato de dados MenuPagamentoProps, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
interface MenuPagamentoProps {
  pedido: Pedido;
  onConcluido: () => void;
}

// Declara função MenuPagamento, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
export function MenuPagamento({ pedido, onConcluido }: MenuPagamentoProps) {
  // Inicializa o estado local aberta, que o componente atualiza para refletir os dados e as interacoes do usuario.
  const [aberta, setAberta] = useState(false);
  // Inicializa o estado local metodo, que o componente atualiza para refletir os dados e as interacoes do usuario.
  const [metodo, setMetodo] = useState<"PIX" | "CARTAO" | null>(null);
  // Inicializa o estado local enviando, que o componente atualiza para refletir os dados e as interacoes do usuario.
  const [enviando, setEnviando] = useState(false);
  // Inicializa o estado local erro, que o componente atualiza para refletir os dados e as interacoes do usuario.
  const [erro, setErro] = useState<string | null>(null);
  // Inicializa o estado local concluido, que o componente atualiza para refletir os dados e as interacoes do usuario.
  const [concluido, setConcluido] = useState(false);

  // Declara valor qrCodeUrl, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
  const qrCodeUrl: string | undefined = metodo === "PIX"
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(CODIGO_PIX_EXEMPLO)}`
    : undefined;

  // Declara função confirmarPagamento, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
  async function confirmarPagamento() {
    // Verifica a condição do fluxo para decidir se os dados e a navegação devem seguir por este ramo.
    if (!metodo) return;
    setEnviando(true);
    setErro(null);

    // Executa a operação sujeita a falhas, como uma chamada à API ou interação com o navegador.
    try {
      await solicitarPagamento({
        idPedido: pedido.idPedido,
        metodoPagamento: metodo,
      });

      // Declara valor statusPagamento, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
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

  // Verifica a condição do fluxo para decidir se os dados e a navegação devem seguir por este ramo.
  if (concluido) {
    // Retorna o resultado/renderização desta etapa ao componente ou chamador que coordena o fluxo.
    return null;
  }

  // Retorna o resultado/renderização desta etapa ao componente ou chamador que coordena o fluxo.
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
