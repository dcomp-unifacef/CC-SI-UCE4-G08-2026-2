// Lista de pedidos do garçom, consumindo a API e encaminhando para criação ou acompanhamento.
// Importa as primitivas React usadas para estado, efeitos e composição da interface; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import { useEffect, useState } from "react";
// Importa o roteador React para navegação e acesso às rotas; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import { useNavigate } from "react-router";
// Importa o módulo ../../api/pedidos, que fornece dependências usadas neste arquivo; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import { listarPedidos } from "../../api/pedidos";
// Importa um componente reutilizável da interface; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import { StatusBadge } from "../../components/StatusBadge";
// Importa um componente reutilizável da interface; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import { CardSkeleton } from "../../components/Skeleton";
// Importa um componente reutilizável da interface; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import { EmptyState } from "../../components/EmptyState";
// Importa um componente reutilizável da interface; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import { Layout } from "../../components/Layout";

// Declara função GarcomLista, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
export default function GarcomLista() {
  // Declara valor navigate, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
  const navigate = useNavigate();
  // Inicializa o estado local pedidos, que o componente atualiza para refletir os dados e as interacoes do usuario.
  const [pedidos, setPedidos] = useState<Awaited<ReturnType<typeof listarPedidos>>>([]);
  // Inicializa o estado local carregando, que o componente atualiza para refletir os dados e as interacoes do usuario.
  const [carregando, setCarregando] = useState(true);
  // Inicializa o estado local erro, que o componente atualiza para refletir os dados e as interacoes do usuario.
  const [erro, setErro] = useState<string | null>(null);

  // Sincroniza efeitos externos (API, temporizadores ou navegação) com o ciclo de vida do componente.
  useEffect(() => {
    listarPedidos()
      .then(setPedidos)
      .catch((e) => setErro(e?.message ?? "Falha ao carregar."))
      .finally(() => setCarregando(false));
  }, []);

  // Declara valor ativos, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
  const ativos = pedidos.filter((p) => !["Pago", "Cancelado"].includes(p.statusPedido));

  // Retorna o resultado/renderização desta etapa ao componente ou chamador que coordena o fluxo.
  return (
    <Layout>
      <div className="cd-hero mb-4">
        <h1 className="cd-hero__title">Pedidos em andamento</h1>
        <p className="cd-hero__subtitle">
          Acompanhe as mesas, avance o preparo e crie novos pedidos em segundos.
        </p>
        <button
          className="btn btn-lg cd-cta"
          onClick={() => navigate("/garcom/novo")}
        >
          ➕ Novo pedido
        </button>
      </div>
      {erro && <div className="alert alert-danger">{erro}</div>}
      {carregando && (
        <div className="row g-3">
          {[1, 2, 3].map((i) => (
            <div className="col-md-4" key={i}>
              <CardSkeleton />
            </div>
          ))}
        </div>
      )}
      <div className="row g-3 stagger">
        {ativos.map((p) => (
          <div className="col-md-4" key={p.idPedido}>
            <div
              className="card"
              style={{ cursor: "pointer" }}
              onClick={() => navigate(`/garcom/pedidos/${p.idPedido}`)}
            >
              <div className="card-body">
                <div className="d-flex justify-content-between">
                  <strong>Mesa {p.numeroMesa}</strong>
                  <StatusBadge status={p.statusPedido} />
                </div>
                <div className="mt-2">Total: R$ {Number(p.valorTotal).toFixed(2)}</div>
                <small className="text-muted">
                  {new Date(p.dataHora).toLocaleTimeString("pt-BR")}
                </small>
              </div>
            </div>
          </div>
        ))}
      </div>
      {!carregando && ativos.length === 0 && (
        <EmptyState
          titulo="Nenhum pedido em andamento"
          descricao="Crie o primeiro pedido clicando em “Novo pedido”."
          icone="📋"
        />
      )}
    </Layout>
  );
}
