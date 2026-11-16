// área do cliente: apresenta catálogo e carrinho, permitindo criar e acompanhar pedidos associados à mesa.
// Importa as primitivas React usadas para estado, efeitos e composição da interface; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import { useEffect, useState } from "react";
// Importa o contexto compartilhado, que fornece estado e ações à tela; esses valores conectam a página ao AuthContext.
import { useAuth } from "../../contexts/AuthContext";
// Importa um hook compartilhado de estado ou comportamento; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import { useMesaDoTablet } from "../../hooks/useMesaDoTablet";
// Importa o módulo ../../api/pedidos, que fornece dependências usadas neste arquivo; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import {
  buscarPedidoAtivoDaMesa,
  criarPedido,
  adicionarItem,
  alterarItem,
  removerItem,
  listarPedidos,
} from "../../api/pedidos";
// Importa o módulo ../../api/produtos, que fornece dependências usadas neste arquivo; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import { listarProdutos } from "../../api/produtos";
// Importa o módulo ../../api/client, que fornece dependências usadas neste arquivo; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import { ApiError } from "../../api/client";
// Importa um componente reutilizável da interface; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import { Layout } from "../../components/Layout";
// Importa um componente reutilizável da interface; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import { MotivoCancelamento } from "../../components/MotivoCancelamento";
// Importa um componente reutilizável da interface; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import { StatusBadge } from "../../components/StatusBadge";
// Importa um componente reutilizável da interface; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import { StatusProgressBar } from "../../components/StatusProgressBar";
// Importa um componente reutilizável da interface; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import { ProductCard } from "../../components/ProductCard";
// Importa um componente reutilizável da interface; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import { CartItem } from "../../components/CartItem";
// Importa um componente reutilizável da interface; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import { MenuPagamento } from "../../components/MenuPagamento";
// Importa uma regra ou utilitário local reutilizável; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import { podeEditarItens } from "../../lib/status";
// Importa uma regra ou utilitário local reutilizável; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import {
  adicionarItem as adicionarCarrinho,
  alterarQuantidade,
  calcularPrevia,
  // Declara alias de tipo ItemCarrinho, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
  type ItemCarrinho,
} from "../../lib/carrinho";
// Importa os contratos de dados usados entre interface e API; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import type { Pedido, Produto } from "../../types/api";

// Declara função Cliente, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
export default function Cliente() {
  // Obtém as ações e os dados de usuário fornecidos pelo contexto global de autenticação.
  const { usuario } = useAuth();
  // Define a exportação pública deste módulo para integração com as demais partes da aplicação.
  const { mesa, configurarMesa } = useMesaDoTablet();

  // Inicializa o estado local pedidoAtivo, que o componente atualiza para refletir os dados e as interacoes do usuario.
  const [pedidoAtivo, setPedidoAtivo] = useState<Pedido | null>(null);
  // Inicializa o estado local pedidosDaMesa, que o componente atualiza para refletir os dados e as interacoes do usuario.
  const [pedidosDaMesa, setPedidosDaMesa] = useState<Pedido[]>([]);
  // Inicializa o estado local produtos, que o componente atualiza para refletir os dados e as interacoes do usuario.
  const [produtos, setProdutos] = useState<Produto[]>([]);
  // Inicializa o estado local carregando, que o componente atualiza para refletir os dados e as interacoes do usuario.
  const [carregando, setCarregando] = useState(true);
  // Inicializa o estado local erro, que o componente atualiza para refletir os dados e as interacoes do usuario.
  const [erro, setErro] = useState<string | null>(null);
  // Inicializa o estado local carrinho, que o componente atualiza para refletir os dados e as interacoes do usuario.
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([]);
  // Inicializa o estado local enviando, que o componente atualiza para refletir os dados e as interacoes do usuario.
  const [enviando, setEnviando] = useState(false);
  // Inicializa o estado local avisoNovoPedido, que o componente atualiza para refletir os dados e as interacoes do usuario.
  const [avisoNovoPedido, setAvisoNovoPedido] = useState<string | null>(null);
  // Inicializa o estado local abertoNovoPedido, que o componente atualiza para refletir os dados e as interacoes do usuario.
  const [abertoNovoPedido, setAbertoNovoPedido] = useState(false);
  // Inicializa o estado local mesaNova, que o componente atualiza para refletir os dados e as interacoes do usuario.
  const [mesaNova, setMesaNova] = useState(0);
  // Inicializa o estado local pagamentoConcluido, que o componente atualiza para refletir os dados e as interacoes do usuario.
  const [pagamentoConcluido, setPagamentoConcluido] = useState(false);

  // Sincroniza efeitos externos (API, temporizadores ou navegação) com o ciclo de vida do componente.
  useEffect(() => {
    listarProdutos().then(setProdutos).catch(() => {});
  }, []);

  // Declara função carregar, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
  async function carregar() {
    // Verifica a condição do fluxo para decidir se os dados e a navegação devem seguir por este ramo.
    if (mesa === null) return;
    setCarregando(true);
    setErro(null);
    // Executa a operação sujeita a falhas, como uma chamada à API ou interação com o navegador.
    try {
      // Declara valor ativo, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
      const ativo = await buscarPedidoAtivoDaMesa(mesa);
      setPedidoAtivo(ativo ?? null);

      // Declara valor todos, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
      const todos = await listarPedidos({ numeroMesa: mesa });
      setPedidosDaMesa(todos);
    } catch (e) {
      setErro(e instanceof ApiError ? e.message : "Falha ao carregar.");
    } finally {
      setCarregando(false);
    }
  }

  // Sincroniza efeitos externos (API, temporizadores ou navegação) com o ciclo de vida do componente.
  useEffect(() => {
    carregar();
  }, [mesa]);

  // Declara valor ehDono, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
  const ehDono = pedidoAtivo?.idCliente === usuario?.id;
  // Declara valor podeEditar, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
  const podeEditar =
    pedidoAtivo !== null &&
    ehDono &&
    podeEditarItens(pedidoAtivo.statusPedido);
  // Declara valor podePagar, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
  const podePagar =
    pedidoAtivo !== null && ehDono && pedidoAtivo.statusPedido !== "Cancelado";

  // Itens de todos os pedidos da mesa, agrupados por pedido
  const itensPorPedido = pedidosDaMesa.flatMap((p) =>
    p.itens.map((it) => ({
      idPedido: p.idPedido,
      numeroMesa: p.numeroMesa,
      statusPedido: p.statusPedido,
      idItemPedido: it.idItemPedido,
      idProduto: it.idProduto,
      produtoNome: it.produto.nome,
      quantidade: it.quantidade,
      valorUnit: Number(it.valorUnit),
      subTotal: Number(it.subTotal),
    })),
  );

  // Declara valor totalMesa, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
  const totalMesa = itensPorPedido.reduce(
    (acc, it) => acc + it.subTotal,
    0,
  );

  // Declara função enviarNovo, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
  async function enviarNovo() {
    // Verifica a condição do fluxo para decidir se os dados e a navegação devem seguir por este ramo.
    if (mesa === null) return;
    setEnviando(true);
    setErro(null);
    setAvisoNovoPedido(null);
    // Executa a operação sujeita a falhas, como uma chamada à API ou interação com o navegador.
    try {
      // Declara valor criado, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
      const criado = await criarPedido({
        numeroMesa: mesa,
        idCliente: usuario?.id ?? undefined,
        itens: carrinho.map((i) => ({
          idProduto: i.idProduto,
          quantidade: i.quantidade,
        })),
      });
      setPedidoAtivo(criado);
      setCarrinho([]);
      setAbertoNovoPedido(false);
      await carregar();
    } catch (e) {
      // Verifica a condição do fluxo para decidir se os dados e a navegação devem seguir por este ramo.
      if (e instanceof ApiError && e.status === 409 && e.detalhes?.idPedido) {
        setAvisoNovoPedido(
          "Esta mesa já tem um pedido em andamento. Você pode acrescentar itens a ele ou fazer outro pedido.",
        );
        await carregar();
      } else {
        setErro(e instanceof ApiError ? e.message : "Falha ao criar pedido.");
      }
    } finally {
      setEnviando(false);
    }
  }

  // Declara função acrescentar, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
  async function acrescentar() {
    // Verifica a condição do fluxo para decidir se os dados e a navegação devem seguir por este ramo.
    if (!pedidoAtivo || mesa === null) return;
    setEnviando(true);
    setErro(null);
    // Executa a operação sujeita a falhas, como uma chamada à API ou interação com o navegador.
    try {
      // Declara estado mutável atualizado, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
      let atualizado = pedidoAtivo;
      // Repete o processamento para os dados do fluxo atual.
      for (const item of carrinho) {
        atualizado = await adicionarItem(atualizado.idPedido, {
          idProduto: item.idProduto,
          quantidade: item.quantidade,
        });
      }
      setPedidoAtivo(atualizado);
      setCarrinho([]);
      await carregar();
    } catch (e) {
      // Verifica a condição do fluxo para decidir se os dados e a navegação devem seguir por este ramo.
      if (e instanceof ApiError && (e.status === 409 || e.status === 403)) {
        setErro(e.message);
        await carregar();
      } else {
        setErro(e instanceof ApiError ? e.message : "Falha ao acrescentar.");
      }
    } finally {
      setEnviando(false);
    }
  }

  // Declara função alterarQuantidadeItem, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
  async function alterarQuantidadeItem(idItem: number, quantidade: number) {
    // Verifica a condição do fluxo para decidir se os dados e a navegação devem seguir por este ramo.
    if (!pedidoAtivo) return;
    setEnviando(true);
    setErro(null);
    // Executa a operação sujeita a falhas, como uma chamada à API ou interação com o navegador.
    try {
      // Verifica a condição do fluxo para decidir se os dados e a navegação devem seguir por este ramo.
      if (quantidade <= 0) {
        setPedidoAtivo(await removerItem(pedidoAtivo.idPedido, idItem));
      } else {
        setPedidoAtivo(
          await alterarItem(pedidoAtivo.idPedido, idItem, { quantidade }),
        );
      }
      await carregar();
    } catch (e) {
      // Verifica a condição do fluxo para decidir se os dados e a navegação devem seguir por este ramo.
      if (e instanceof ApiError && (e.status === 409 || e.status === 403)) {
        setErro(e.message);
        await carregar();
      } else {
        setErro(e instanceof ApiError ? e.message : "Falha ao alterar.");
      }
    } finally {
      setEnviando(false);
    }
  }

  // Declara função adicionarProduto, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
  async function adicionarProduto(produto: Produto) {
    // Verifica a condição do fluxo para decidir se os dados e a navegação devem seguir por este ramo.
    if (!pedidoAtivo) return;
    setEnviando(true);
    setErro(null);
    // Executa a operação sujeita a falhas, como uma chamada à API ou interação com o navegador.
    try {
      setPedidoAtivo(
        await adicionarItem(pedidoAtivo.idPedido, {
          idProduto: produto.idProduto,
          quantidade: 1,
        }),
      );
      await carregar();
    } catch (e) {
      // Verifica a condição do fluxo para decidir se os dados e a navegação devem seguir por este ramo.
      if (e instanceof ApiError && (e.status === 409 || e.status === 403)) {
        setErro(e.message);
        await carregar();
      } else {
        setErro(e instanceof ApiError ? e.message : "Falha ao adicionar.");
      }
    } finally {
      setEnviando(false);
    }
  }

  // Verifica a condição do fluxo para decidir se os dados e a navegação devem seguir por este ramo.
  if (mesa === null) {
    // Retorna o resultado/renderização desta etapa ao componente ou chamador que coordena o fluxo.
    return (
      <Layout>
        <h1>Configurar tablet</h1>
        <p className="text-muted">Informe o número de mesa deste tablet.</p>
        {erro && <div className="alert alert-danger">{erro}</div>}
        <div className="input-group" style={{ maxWidth: 320 }}>
          <input
            // Define a exportação pública deste módulo para integração com as demais partes da aplicação.
            type="number"
            className="form-control"
            placeholder="Número da mesa"
            value={mesaNova}
            onChange={(e) => {
              setMesaNova(Number(e.target.value));
              setErro(null);
            }}
          />
          <button
            className="btn btn-primary"
            onClick={() => {
              // Declara valor m, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
              const m = mesaNova;
              // Verifica a condição do fluxo para decidir se os dados e a navegação devem seguir por este ramo.
              if (!Number.isInteger(m) || m <= 0) {
                setErro("Informe um número de mesa válido.");
                // Retorna o resultado/renderização desta etapa ao componente ou chamador que coordena o fluxo.
                return;
              }
              setErro(null);
              configurarMesa(m);
            }}
          >
            Salvar
          </button>
        </div>
      </Layout>
    );
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

  // Retorna o resultado/renderização desta etapa ao componente ou chamador que coordena o fluxo.
  return (
    <Layout>
      <h1>Mesa {mesa}</h1>
      {erro && <div className="alert alert-danger">{erro}</div>}
      {avisoNovoPedido && <div className="alert alert-info">{avisoNovoPedido}</div>}

      {/* Abas lado a lado: Meu pedido | Novo pedido */}
      <div className="d-flex gap-2 mb-3">
        <button
          className={`btn ${abertoNovoPedido ? "btn-outline-secondary" : "btn-primary"}`}
          disabled={enviando}
          onClick={() => setAbertoNovoPedido(false)}
        >
          🧾 Meu pedido
        </button>
        <button
          className={`btn ${abertoNovoPedido ? "btn-primary" : "btn-outline-secondary"}`}
          disabled={enviando}
          onClick={() => setAbertoNovoPedido(true)}
        >
          ➕ Novo pedido
        </button>
      </div>

      {/* Itens de todos os pedidos da mesa */}
      <div className="mb-4">
        <h3>Itens de todos os pedidos da mesa</h3>
        {pedidosDaMesa.length === 0 ? (
          <div className="alert alert-secondary">Nenhum pedido nesta mesa ainda.</div>
        ) : (
          <ul className="list-group mb-3">
            {pedidosDaMesa.map((p) => (
              <li
                key={p.idPedido}
                className="list-group-item d-flex justify-content-between align-items-start"
              >
                <div>
                  <div className="fw-bold">
                    Pedido #{p.idPedido} — Mesa {p.numeroMesa}
                  </div>
                  <div className="text-muted small">
                    <StatusBadge status={p.statusPedido} />{" "}
                    {new Date(p.dataHora).toLocaleTimeString("pt-BR")}
                  </div>
                  <ul className="mb-1 small">
                    {p.itens.map((it) => (
                      <li key={it.idItemPedido}>
                        {it.quantidade}x {it.produto.nome} —
                        R$ {Number(it.subTotal).toFixed(2)}
                      </li>
                    ))}
                  </ul>
                </div>
                <span className="fw-end">
                  R$ {Number(p.valorTotal).toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        )}
        {itensPorPedido.length > 0 && (
          <div className="d-flex justify-content-end fw-bold">
            Total da mesa: R$ {totalMesa.toFixed(2)}
          </div>
        )}
      </div>

      {/* Meu pedido ativo */}
      {!abertoNovoPedido && pedidoAtivo !== null && (
        <>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <strong>Pedido ativo — Mesa {pedidoAtivo.numeroMesa}</strong>
            <StatusBadge status={pedidoAtivo.statusPedido} />
          </div>
          <StatusProgressBar status={pedidoAtivo.statusPedido} />
          <MotivoCancelamento pedido={pedidoAtivo} />
          <p>
            <strong>Total:</strong> R$ {Number(pedidoAtivo.valorTotal).toFixed(2)}
          </p>

          {!podeEditarItens(pedidoAtivo.statusPedido) && ehDono && (
            <div className="alert alert-info">
              O pedido já está em preparo e não pode mais ser editado.
            </div>
          )}

          <h3>Itens do pedido ativo</h3>
          <ul className="list-group mb-3">
            {pedidoAtivo.itens.map((it) => (
              <li
                key={it.idItemPedido}
                className="list-group-item d-flex justify-content-between align-items-center"
              >
                <span>
                  {it.produto.nome} x {it.quantidade} —
                  R$ {Number(it.subTotal).toFixed(2)}
                </span>
                {podeEditar && (
                  <div className="d-flex gap-1">
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      disabled={enviando}
                      onClick={() =>
                        alterarQuantidadeItem(it.idItemPedido, it.quantidade - 1)
                      }
                    >
                      −
                    </button>
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      disabled={enviando}
                      onClick={() =>
                        alterarQuantidadeItem(it.idItemPedido, it.quantidade + 1)
                      }
                    >
                      +
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      disabled={enviando}
                      onClick={() => alterarQuantidadeItem(it.idItemPedido, 0)}
                    >
                      Remover
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>

          {podeEditar && (
            <>
              <h3>Adicionar produto</h3>
              <div className="row g-2 mb-3">
                {produtos
                  .filter((p) => p.disponivel)
                  .map((p) => (
                    <div className="col-md-3" key={p.idProduto}>
                      <ProductCard
                        produto={p}
                        onAdicionar={adicionarProduto}
                        disabled={enviando}
                      />
                    </div>
                  ))}
              </div>
              {podeEditar && pedidoAtivo.idCliente === null && (
                <>
                  <h3>Acrescentar itens ao pedido da mesa</h3>
                  <div className="row g-2 mb-3">
                    {produtos
                      .filter((p) => p.disponivel)
                      .map((p) => (
                        <div className="col-md-3" key={p.idProduto}>
                          <ProductCard
                            produto={p}
                            onAdicionar={(prod) =>
                              setCarrinho((c) => adicionarCarrinho(c, prod))
                            }
                          />
                        </div>
                      ))}
                  </div>
                  <ul className="list-group mb-3">
                    {carrinho.map((i) => (
                      <li
                        key={i.idProduto}
                        className="list-group-item d-flex justify-content-between align-items-center"
                      >
                        <span>{i.nome} x {i.quantidade}</span>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() =>
                            setCarrinho((c) =>
                              c.filter((x) => x.idProduto !== i.idProduto),
                            )
                          }
                        >
                          Remover
                        </button>
                      </li>
                    ))}
                  </ul>
                  <button
                    className="btn btn-success"
                    disabled={enviando || carrinho.length === 0}
                    onClick={acrescentar}
                  >
                    {enviando ? "Enviando..." : "➕ Acrescentar ao pedido"}
                  </button>
                </>
              )}
            </>
          )}

          {/* Menu suspenso de pagamento */}
          {podePagar && pedidoAtivo.statusPedido !== "Cancelado" && !pagamentoConcluido && (
            <div className="mt-4">
              <MenuPagamento
                pedido={pedidoAtivo}
                onConcluido={() => {
                  setPagamentoConcluido(true);
                  carregar();
                }}
              />
            </div>
          )}
        </>
      )}

      {/* Novo pedido (cardápio + carrinho) */}
      {abertoNovoPedido && (
        <>
          <h3>Cardápio</h3>
          <div className="row g-3">
            {produtos
              .filter((p) => p.disponivel)
              .map((p) => (
                <div className="col-md-3" key={p.idProduto}>
                  <ProductCard
                    produto={p}
                    onAdicionar={(prod) =>
                      setCarrinho((c) => adicionarCarrinho(c, prod))
                    }
                  />
                </div>
              ))}
          </div>
          <h3 className="mt-4">Carrinho</h3>
          <ul className="list-group mb-3">
            {carrinho.map((i) => (
              <CartItem
                key={i.idProduto}
                item={i}
                onAlterar={(id, q) =>
                  setCarrinho((c) => alterarQuantidade(c, id, q))
                }
                onRemover={(id) =>
                  setCarrinho((c) => c.filter((x) => x.idProduto !== id))
                }
              />
            ))}
          </ul>
          <div className="d-flex justify-content-between">
            <strong>Prévia: R$ {calcularPrevia(carrinho).toFixed(2)}</strong>
            <button
              className="btn btn-success"
              disabled={enviando || carrinho.length === 0}
              onClick={enviarNovo}
            >
              {enviando ? "Enviando..." : "✅ Fazer pedido"}
            </button>
          </div>
        </>
      )}
    </Layout>
  );
}
