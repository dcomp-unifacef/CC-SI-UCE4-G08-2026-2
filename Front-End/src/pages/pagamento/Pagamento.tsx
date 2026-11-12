import { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router";
import { useAuth } from "../../contexts/AuthContext";
import { solicitarPagamento } from "../../api/notificacoes";
import { apiFetch } from "../../api/client";
import { Layout } from "../../components/Layout";
import type { Pedido } from "../../types/api";

// Código PIX de exemplo (apenas para testes - não é real)
const CODIGO_PIX_EXEMPLO =
  "00020126580014br.gov.bcb.pix0136f8b8e5f5-4b0a-4c9d-8e7f-1234567890ab520400005303986540510.005802BR5925Cliente Exemplo6009SAO PAULO62070503***6304ABCD";

export default function Pagamento() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [metodo, setMetodo] = useState<"PIX" | "CARTAO" | null>(null);
  const [concluido, setConcluido] = useState(false);

  // Tenta obter o idPedido da query ou dos params
  const idPedidoUrl = new URLSearchParams(location.search).get("idPedido");
  const idPedidoParam = useParams()?.idPedido
    ? Number(useParams().idPedido)
    : null;
  const idPedido = idPedidoUrl ? Number(idPedidoUrl) : idPedidoParam;

  useEffect(() => {
    if (!idPedido) {
      setErro("Pedido não informado.");
      setCarregando(false);
      return;
    }

    (async () => {
      try {
        const dados = (await apiFetch<Pedido>(
          `/pedidos/${idPedido}`,
        )) as Pedido;
        setPedido(dados);
      } catch (e: any) {
        setErro(e?.message ?? "Falha ao carregar pedido.");
      } finally {
        setCarregando(false);
      }
    })();
  }, [idPedido]);

  async function confirmarPagamento() {
    if (!pedido || !metodo || !usuario) return;
    setEnviando(true);
    setErro(null);

    try {
      // 1. Solicita pagamento (cria notificação para o garçom se for cartão)
      await solicitarPagamento({
        idPedido: pedido.idPedido,
        metodoPagamento: metodo,
      });

      // 2. Registra o pagamento no sistema
      const statusPagamento =
        metodo === "PIX" ? "Pago" : "Pendente";
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
    } catch (e: any) {
      setErro(e?.message ?? "Falha ao processar pagamento.");
    } finally {
      setEnviando(false);
    }
  }

  if (carregando) {
    return (
      <Layout>
        <p>Carregando...</p>
      </Layout>
    );
  }

  if (!pedido) {
    return (
      <Layout>
        <div className="alert alert-danger">{erro ?? "Pedido não encontrado."}</div>
        <button
          className="btn btn-primary"
          onClick={() => navigate("/cliente")}
        >
          Voltar
        </button>
      </Layout>
    );
  }

  if (concluido) {
    const mensagem =
      metodo === "PIX"
        ? "Pagamento via PIX registrado com sucesso!"
        : "Solicitação de pagamento no cartão enviada. O garçom foi notificado e levará a maquininha até sua mesa.";

    return (
      <Layout>
        <div className="text-center py-5">
          <h2>✅ Pagamento concluído</h2>
          <p className="text-muted">Mesa {pedido.numeroMesa}</p>
          <p className="lead">{mensagem}</p>
          <p className="text-muted small">
            Pedido #{pedido.idPedido} • Total: R${" "}
            {Number(pedido.valorTotal).toFixed(2)}
          </p>
          <button
            className="btn btn-primary mt-3"
            onClick={() => navigate("/cliente")}
          >
            Voltar ao pedido
          </button>
        </div>
      </Layout>
    );
  }

  const ehDono = pedido.idCliente === usuario?.id;
  const podePagar = ehDono && !concluido;

  // URL do QR code para PIX (apenas para testes - não é funcional)
  const qrCodeUrl = metodo === "PIX"
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(CODIGO_PIX_EXEMPLO)}`
    : null;

  return (
    <Layout>
      <h1>Pagamento — Mesa {pedido.numeroMesa}</h1>
      {erro && <div className="alert alert-danger">{erro}</div>}

      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">Pedido #{pedido.idPedido}</h5>
          <p className="card-text text-muted">
            Status: <strong>{pedido.statusPedido}</strong>
          </p>
          <p className="card-text fw-bold">
            Total: R$ {Number(pedido.valorTotal).toFixed(2)}
          </p>
          <p className="text-muted small">
            Itens:{" "}
            {(pedido.itens ?? [])
              .map((i) => i.quantidade + "× " + i.produto.nome)
              .join(", ")}
          </p>
        </div>
      </div>

      {podePagar && (
        <>
          <h3>Escolha a forma de pagamento</h3>
          <div className="row g-3">
            <div className="col-md-6">
              <div className="card h-100 border-primary">
                <div className="card-body text-center">
                  <h5 className="card-title">PIX</h5>
                  <p className="card-text small text-muted">
                    Pague diretamente pelo sistema. O pagamento é confirmado automaticamente.
                  </p>
                  <button
                    className={`btn btn-outline-primary w-100 ${
                      metodo === "PIX" ? "btn-primary text-white" : ""
                    }`}
                    onClick={() => setMetodo("PIX")}
                    disabled={enviando}
                  >
                    Selecionar PIX
                  </button>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card h-100 border-warning">
                <div className="card-body text-center">
                  <h5 className="card-title">Cartão</h5>
                  <p className="card-text small text-muted">
                    O garçom será notificado e levará a maquininha até sua mesa.
                  </p>
                  <button
                    className={`btn btn-outline-warning w-100 ${
                      metodo === "CARTAO" ? "btn-warning text-dark" : ""
                    }`}
                    onClick={() => setMetodo("CARTAO")}
                    disabled={enviando}
                  >
                    Selecionar Cartão
                  </button>
                </div>
              </div>
            </div>
          </div>

          {metodo === "PIX" && qrCodeUrl && (
            <div className="text-center mt-4 mb-4">
              <div className="d-flex justify-content-center">
                <img
                  src={qrCodeUrl}
                  alt="QR Code PIX"
                  className="border rounded p-2 bg-white"
                  style={{ maxWidth: "200px", width: "100%" }}
                />
              </div>
              <p className="text-muted small mt-2">
                Código PIX (apenas para testes):
              </p>
              <code className="text-muted small d-block text-truncate" style={{ maxWidth: "300px", margin: "0 auto" }}>
                {CODIGO_PIX_EXEMPLO}
              </code>
            </div>
          )}

          {metodo && (
            <div className="text-center mt-4">
              <button
                className="btn btn-lg btn-success w-auto"
                disabled={enviando}
                onClick={confirmarPagamento}
              >
                {enviando ? "Processando..." : "✅ Confirmar pagamento"}
              </button>
            </div>
          )}
        </>
      )}

      {!podePagar && !concluido && (
        <div className="alert alert-warning">
          Você não pode pagar este pedido (não é o dono ou já foi pago).
        </div>
      )}

      <button className="btn btn-secondary mt-3" onClick={() => navigate("/cliente")}>
        Voltar ao pedido
      </button>
    </Layout>
  );
}
