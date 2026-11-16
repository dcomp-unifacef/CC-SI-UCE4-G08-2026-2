// Tela de pagamento: consulta pedido e notificações e conduz a solicitação e confirmação de pagamento.
// Importa as primitivas React usadas para estado, efeitos e composição da interface; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import { useState, useEffect } from "react";
// Importa o roteador React para navegação e acesso às rotas; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import { useNavigate, useLocation, useParams } from "react-router";
// Importa o contexto compartilhado, que fornece estado e ações à tela; esses valores conectam a página ao AuthContext.
import { useAuth } from "../../contexts/AuthContext";
// Importa o módulo ../../api/notificacoes, que fornece dependências usadas neste arquivo; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import { solicitarPagamento } from "../../api/notificacoes";
// Importa o módulo ../../api/client, que fornece dependências usadas neste arquivo; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import { apiFetch } from "../../api/client";
// Importa um componente reutilizável da interface; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import { Layout } from "../../components/Layout";
// Importa os contratos de dados usados entre interface e API; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import type { Pedido } from "../../types/api";

// Código PIX de exemplo (apenas para testes - não é real)
const CODIGO_PIX_EXEMPLO =
  "00020126580014br.gov.bcb.pix0136f8b8e5f5-4b0a-4c9d-8e7f-1234567890ab520400005303986540510.005802BR5925Cliente Exemplo6009SAO PAULO62070503***6304ABCD";

// Declara função Pagamento, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
export default function Pagamento() {
  // Obtém as ações e os dados de usuário fornecidos pelo contexto global de autenticação.
  const { usuario } = useAuth();
  // Declara valor navigate, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
  const navigate = useNavigate();
  // Declara valor location, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
  const location = useLocation();
  // Inicializa o estado local pedido, que o componente atualiza para refletir os dados e as interacoes do usuario.
  const [pedido, setPedido] = useState<Pedido | null>(null);
  // Inicializa o estado local carregando, que o componente atualiza para refletir os dados e as interacoes do usuario.
  const [carregando, setCarregando] = useState(true);
  // Inicializa o estado local erro, que o componente atualiza para refletir os dados e as interacoes do usuario.
  const [erro, setErro] = useState<string | null>(null);
  // Inicializa o estado local enviando, que o componente atualiza para refletir os dados e as interacoes do usuario.
  const [enviando, setEnviando] = useState(false);
  // Inicializa o estado local metodo, que o componente atualiza para refletir os dados e as interacoes do usuario.
  const [metodo, setMetodo] = useState<"PIX" | "CARTAO" | null>(null);
  // Inicializa o estado local concluido, que o componente atualiza para refletir os dados e as interacoes do usuario.
  const [concluido, setConcluido] = useState(false);

  // Tenta obter o idPedido da query ou dos params
  const idPedidoUrl = new URLSearchParams(location.search).get("idPedido");
  // Declara valor idPedidoParam, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
  const idPedidoParam = useParams()?.idPedido
    ? Number(useParams().idPedido)
    : null;
  // Declara valor idPedido, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
  const idPedido = idPedidoUrl ? Number(idPedidoUrl) : idPedidoParam;

  // Sincroniza efeitos externos (API, temporizadores ou navegação) com o ciclo de vida do componente.
  useEffect(() => {
    // Verifica a condição do fluxo para decidir se os dados e a navegação devem seguir por este ramo.
    if (!idPedido) {
      setErro("Pedido não informado.");
      setCarregando(false);
      // Retorna o resultado/renderização desta etapa ao componente ou chamador que coordena o fluxo.
      return;
    }

    (async () => {
      // Executa a operação sujeita a falhas, como uma chamada à API ou interação com o navegador.
      try {
        // Declara valor dados, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
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

  // Declara função confirmarPagamento, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
  async function confirmarPagamento() {
    // Verifica a condição do fluxo para decidir se os dados e a navegação devem seguir por este ramo.
    if (!pedido || !metodo || !usuario) return;
    setEnviando(true);
    setErro(null);

    // Executa a operação sujeita a falhas, como uma chamada à API ou interação com o navegador.
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

  // Verifica a condição do fluxo para decidir se os dados e a navegação devem seguir por este ramo.
  if (carregando) {
    // Retorna o resultado/renderização desta etapa ao componente ou chamador que coordena o fluxo.
    return (
      <Layout>
        <p>Carregando...</p>
      </Layout>
    );
  }

  // Verifica a condição do fluxo para decidir se os dados e a navegação devem seguir por este ramo.
  if (!pedido) {
    // Retorna o resultado/renderização desta etapa ao componente ou chamador que coordena o fluxo.
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

  // Verifica a condição do fluxo para decidir se os dados e a navegação devem seguir por este ramo.
  if (concluido) {
    // Declara valor mensagem, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
    const mensagem =
      metodo === "PIX"
        ? "Pagamento via PIX registrado com sucesso!"
        : "Solicitação de pagamento no cartão enviada. O garçom foi notificado e levará a maquininha até sua mesa.";

    // Retorna o resultado/renderização desta etapa ao componente ou chamador que coordena o fluxo.
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

  // Declara valor ehDono, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
  const ehDono = pedido.idCliente === usuario?.id;
  // Declara valor podePagar, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
  const podePagar = ehDono && !concluido;

  // URL do QR code para PIX (apenas para testes - não é funcional)
  const qrCodeUrl = metodo === "PIX"
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(CODIGO_PIX_EXEMPLO)}`
    : null;

  // Retorna o resultado/renderização desta etapa ao componente ou chamador que coordena o fluxo.
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
