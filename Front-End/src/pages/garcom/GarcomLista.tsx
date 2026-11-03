import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { listarPedidos } from "../../api/pedidos";
import { StatusBadge } from "../../components/StatusBadge";
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
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1>Pedidos</h1>
        <button className="btn btn-primary" onClick={() => navigate("/garcom/novo")}>
          Novo pedido
        </button>
      </div>
      {erro && <div className="alert alert-danger">{erro}</div>}
      {carregando && <p>Carregando...</p>}
      <div className="row g-3">
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
    </Layout>
  );
}
