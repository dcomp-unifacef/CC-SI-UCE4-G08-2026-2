import { useEffect, useState } from "react";
import { listarPedidos, atualizarPedido } from "../api/pedidos";
import { ApiError } from "../api/client";
import { Layout } from "../components/Layout";
import { useToast } from "../components/Toast";
import { StatusBadge } from "../components/StatusBadge";
import { usePolling } from "../hooks/usePolling";
import type { Pedido } from "../types/api";

export default function Cozinha() {
  const toast = useToast();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [atualizadoEm, setAtualizadoEm] = useState<Date>(new Date());
  const [ocupado, setOcupado] = useState<number | null>(null);

  async function carregar() {
    try {
      setPedidos(await listarPedidos());
      setAtualizadoEm(new Date());
    } catch {
      // silencioso; próxima tentativa
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  usePolling(carregar, 5000);

  async function mover(pedido: Pedido, novoStatus: string) {
    setOcupado(pedido.idPedido);
    try {
      await atualizarPedido(pedido.idPedido, { statusPedido: novoStatus });
      await carregar();
    } catch (e) {
      toast.mostrar(e instanceof ApiError ? e.message : "Falha ao atualizar.", "error");
      await carregar();
    } finally {
      setOcupado(null);
    }
  }

  const grupos = {
    "Aberto": pedidos.filter((p) => p.statusPedido === "Aberto"),
    "Em preparo": pedidos.filter((p) => p.statusPedido === "Em preparo"),
    "Pronto": pedidos.filter((p) => p.statusPedido === "Pronto"),
  };

  return (
    <Layout>
      <h1>Cozinha</h1>
      <div className="row g-3">
        {Object.entries(grupos).map(([status, lista]) => (
          <div className="col-md-4" key={status}>
            <h4>{status}</h4>
            {lista.map((p) => (
              <div className="card mb-2" key={p.idPedido}>
                <div className="card-body">
                  <div className="d-flex justify-content-between">
                    <strong>Mesa {p.numeroMesa}</strong>
                    <StatusBadge status={p.statusPedido} />
                  </div>
                  <ul className="mb-2 mt-2">
                    {p.itens.map((it) => (
                      <li key={it.idItemPedido}>
                        {it.quantidade}x {it.produto.nome}
                      </li>
                    ))}
                  </ul>
                  <small className="text-muted">
                    {new Date(p.dataHora).toLocaleTimeString("pt-BR")}
                  </small>
                  <div className="mt-2">
                    {p.statusPedido === "Aberto" && (
                      <button
                        className="btn btn-sm btn-warning"
                        disabled={ocupado === p.idPedido}
                        onClick={() => mover(p, "Em preparo")}
                      >
                        Iniciar preparo
                      </button>
                    )}
                    {p.statusPedido === "Em preparo" && (
                      <button
                        className="btn btn-sm btn-info"
                        disabled={ocupado === p.idPedido}
                        onClick={() => mover(p, "Pronto")}
                      >
                        Pronto
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
      <small className="text-muted">
        Atualizado às {atualizadoEm.toLocaleTimeString("pt-BR")}
      </small>
    </Layout>
  );
}
