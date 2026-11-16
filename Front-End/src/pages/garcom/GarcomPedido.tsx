// Detalhe operacional do pedido do garçom, integrando consulta, edição de itens e transiçãoes de status.
// Importa as primitivas React usadas para estado, efeitos e composição da interface; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import { useEffect, useState } from "react";
// Importa o roteador React para navegação e acesso às rotas; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import { useLocation, useParams } from "react-router";
// Importa o módulo ../../api/pedidos, que fornece dependências usadas neste arquivo; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import {
  buscarPedido,
  atualizarPedido,
  cancelarPedido,
  adicionarItem,
  alterarItem,
  removerItem,
} from "../../api/pedidos";
// Importa o módulo ../../api/produtos, que fornece dependências usadas neste arquivo; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import { listarProdutos } from "../../api/produtos";
// Importa o módulo ../../api/client, que fornece dependências usadas neste arquivo; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import { ApiError } from "../../api/client";
// Importa um componente reutilizável da interface; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import { StatusBadge } from "../../components/StatusBadge";
// Importa um componente reutilizável da interface; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import { StatusProgressBar } from "../../components/StatusProgressBar";
// Importa um componente reutilizável da interface; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import { MotivoCancelamento } from "../../components/MotivoCancelamento";
// Importa um componente reutilizável da interface; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import { Layout } from "../../components/Layout";
// Importa um componente reutilizável da interface; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import { ProductCard } from "../../components/ProductCard";
// Importa uma regra ou utilitário local reutilizável; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import { acoesDeStatus, podeEditarItens } from "../../lib/status";
// Importa uma regra ou utilitário local reutilizável; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import { dispararConfetti } from "../../lib/confetti";
// Importa os contratos de dados usados entre interface e API; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import type { Pedido, Produto } from "../../types/api";

// Declara função GarcomPedido, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
export default function GarcomPedido() {
  // Define a exportação pública deste módulo para integração com as demais partes da aplicação.
  const { id } = useParams();
  // Declara valor location, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
  const location = useLocation();
  // Declara valor aviso, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
  const aviso = (location.state as { aviso?: string } | null)?.aviso;

  // Inicializa o estado local pedido, que o componente atualiza para refletir os dados e as interacoes do usuario.
  const [pedido, setPedido] = useState<Pedido | null>(null);
  // Inicializa o estado local produtos, que o componente atualiza para refletir os dados e as interacoes do usuario.
  const [produtos, setProdutos] = useState<Produto[]>([]);
  // Inicializa o estado local carregando, que o componente atualiza para refletir os dados e as interacoes do usuario.
  const [carregando, setCarregando] = useState(true);
  // Inicializa o estado local erro, que o componente atualiza para refletir os dados e as interacoes do usuario.
  const [erro, setErro] = useState<string | null>(null);
  // Inicializa o estado local ocupado, que o componente atualiza para refletir os dados e as interacoes do usuario.
  const [ocupado, setOcupado] = useState(false);

  // Declara função carregar, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
  async function carregar() {
    // Verifica a condição do fluxo para decidir se os dados e a navegação devem seguir por este ramo.
    if (!id) return;
    setCarregando(true);
    // Executa a operação sujeita a falhas, como uma chamada à API ou interação com o navegador.
    try {
      setPedido(await buscarPedido(Number(id)));
    } catch (e) {
      setErro(e instanceof ApiError ? e.message : "Falha ao carregar.");
    } finally {
      setCarregando(false);
    }
  }

  // Sincroniza efeitos externos (API, temporizadores ou navegação) com o ciclo de vida do componente.
  useEffect(() => {
    carregar();
    listarProdutos().then(setProdutos).catch(() => {});
  }, [id]);

  // Declara função executarAcao, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
  async function executarAcao(novoStatus: string, confirmar?: boolean) {
    // Verifica a condição do fluxo para decidir se os dados e a navegação devem seguir por este ramo.
    if (!pedido) return;

    // Declara estado mutável motivo, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
    let motivo: string | undefined;
    // Verifica a condição do fluxo para decidir se os dados e a navegação devem seguir por este ramo.
    if (novoStatus === "Cancelado") {
      // Declara valor digitado, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
      const digitado = window.prompt("Informe o motivo do cancelamento:");
      // Verifica a condição do fluxo para decidir se os dados e a navegação devem seguir por este ramo.
      if (!digitado || digitado.trim().length === 0) return;
      motivo = digitado.trim();
    }

    // Verifica a condição do fluxo para decidir se os dados e a navegação devem seguir por este ramo.
    if (confirmar && !window.confirm("Tem certeza?")) return;
    setOcupado(true);
    setErro(null);
    // Executa a operação sujeita a falhas, como uma chamada à API ou interação com o navegador.
    try {
      // Declara estado mutável atualizado, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
      let atualizado: Pedido;
      // Verifica a condição do fluxo para decidir se os dados e a navegação devem seguir por este ramo.
      if (novoStatus === "Cancelado") {
        atualizado = await cancelarPedido(pedido.idPedido, { motivo: motivo!.trim() });
      } else {
        atualizado = await atualizarPedido(pedido.idPedido, { statusPedido: novoStatus });
        // Verifica a condição do fluxo para decidir se os dados e a navegação devem seguir por este ramo.
        if (novoStatus === "Entregue") dispararConfetti();
      }
      setPedido(atualizado);
    } catch (e) {
      // Verifica a condição do fluxo para decidir se os dados e a navegação devem seguir por este ramo.
      if (e instanceof ApiError && (e.status === 409 || e.status === 403)) {
        setErro(e.message);
        await carregar();
      } else {
        setErro(e instanceof ApiError ? e.message : "Falha ao atualizar.");
      }
    } finally {
      setOcupado(false);
    }
  }

  // Declara função adicionar, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
  async function adicionar(produto: Produto) {
    // Verifica a condição do fluxo para decidir se os dados e a navegação devem seguir por este ramo.
    if (!pedido) return;
    setOcupado(true);
    setErro(null);
    // Executa a operação sujeita a falhas, como uma chamada à API ou interação com o navegador.
    try {
      // Declara valor atualizado, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
      const atualizado = await adicionarItem(pedido.idPedido, {
        idProduto: produto.idProduto,
        quantidade: 1,
      });
      setPedido(atualizado);
    } catch (e) {
      // Verifica a condição do fluxo para decidir se os dados e a navegação devem seguir por este ramo.
      if (e instanceof ApiError && (e.status === 409 || e.status === 403)) {
        setErro(e.message);
        await carregar();
      } else {
        setErro(e instanceof ApiError ? e.message : "Falha ao adicionar.");
      }
    } finally {
      setOcupado(false);
    }
  }

  // Declara função alterarQuantidadeItem, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
  async function alterarQuantidadeItem(idItem: number, quantidade: number) {
    // Verifica a condição do fluxo para decidir se os dados e a navegação devem seguir por este ramo.
    if (!pedido) return;
    setOcupado(true);
    setErro(null);
    // Executa a operação sujeita a falhas, como uma chamada à API ou interação com o navegador.
    try {
      // Verifica a condição do fluxo para decidir se os dados e a navegação devem seguir por este ramo.
      if (quantidade <= 0) {
        setPedido(await removerItem(pedido.idPedido, idItem));
      } else {
        setPedido(await alterarItem(pedido.idPedido, idItem, { quantidade }));
      }
    } catch (e) {
      // Verifica a condição do fluxo para decidir se os dados e a navegação devem seguir por este ramo.
      if (e instanceof ApiError && (e.status === 409 || e.status === 403)) {
        setErro(e.message);
        await carregar();
      } else {
        setErro(e instanceof ApiError ? e.message : "Falha ao alterar.");
      }
    } finally {
      setOcupado(false);
    }
  }

  // Verifica a condição do fluxo para decidir se os dados e a navegação devem seguir por este ramo.
  if (carregando) return <Layout><p>Carregando...</p></Layout>;
  // Verifica a condição do fluxo para decidir se os dados e a navegação devem seguir por este ramo.
  if (!pedido) return <Layout><div className="alert alert-danger">{erro ?? "Pedido não encontrado."}</div></Layout>;

  // Declara valor editavel, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
  const editavel = podeEditarItens(pedido.statusPedido);

  // Retorna o resultado/renderização desta etapa ao componente ou chamador que coordena o fluxo.
  return (
    <Layout>
      {aviso && <div className="alert alert-info">{aviso}</div>}
      {erro && <div className="alert alert-danger">{erro}</div>}
      {!editavel && (
        <div className="alert alert-info">
          Os itens não podem mais ser alterados: o pedido já avançou para{" "}
          <strong>{pedido.statusPedido}</strong>.
        </div>
      )}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1>Mesa {pedido.numeroMesa}</h1>
        <StatusBadge status={pedido.statusPedido} />
      </div>
      <StatusProgressBar status={pedido.statusPedido} />
      <MotivoCancelamento pedido={pedido} />
      <p>
        <strong>Total:</strong> R$ {Number(pedido.valorTotal).toFixed(2)}
      </p>

      <h3>Itens</h3>
      <ul className="list-group mb-3">
        {pedido.itens.map((it) => (
          <li key={it.idItemPedido} className="list-group-item d-flex justify-content-between align-items-center">
            <div>
              {it.produto.nome} x {it.quantidade}
              <small className="text-muted d-block">R$ {Number(it.subTotal).toFixed(2)}</small>
            </div>
            {editavel && (
              <div className="d-flex gap-1">
                <button className="btn btn-sm btn-outline-secondary" disabled={ocupado} onClick={() => alterarQuantidadeItem(it.idItemPedido, it.quantidade - 1)}>
                  −
                </button>
                <button className="btn btn-sm btn-outline-secondary" disabled={ocupado} onClick={() => alterarQuantidadeItem(it.idItemPedido, it.quantidade + 1)}>
                  +
                </button>
                <button className="btn btn-sm btn-outline-danger" disabled={ocupado} onClick={() => alterarQuantidadeItem(it.idItemPedido, 0)}>
                  Remover
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>

      {editavel && (
        <>
          <h3>Adicionar produto</h3>
          <div className="row g-2 mb-3">
            {produtos
              .filter((p) => p.disponivel)
              .map((p) => (
                <div className="col-md-3" key={p.idProduto}>
                  <ProductCard
                    produto={p}
                    onAdicionar={adicionar}
                    disabled={ocupado}
                  />
                </div>
              ))}
          </div>
        </>
      )}

      <div className="d-flex gap-2">
        {acoesDeStatus(pedido.statusPedido).map((a) => (
          <button
            key={a.novoStatus}
            className="btn btn-outline-dark"
            disabled={ocupado}
            onClick={() => executarAcao(a.novoStatus, a.confirmar)}
          >
            {a.rotulo}
          </button>
        ))}
      </div>
    </Layout>
  );
}
