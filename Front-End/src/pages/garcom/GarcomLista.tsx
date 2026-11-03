import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { listarPedidos } from "../../api/pedidos";
import { StatusBadge } from "../../components/StatusBadge";
import { CardSkeleton } from "../../components/Skeleton";
import { EmptyState } from "../../components/EmptyState";
import { Layout } from "../../components/Layout";

export default function GarcomLista() {
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState<Awaited<ReturnType<typeof listarPedidos>>>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    listarPedidos()
      .then(setPedidos)
      .catch((e) => setErro(e?.message ?? "Falha ao carregar."))
      .finally(() => setCarregando(false));
  }, []);

  const ativos = pedidos.filter((p) => !["Pago", "Cancelado"].includes(p.statusPedido));

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
