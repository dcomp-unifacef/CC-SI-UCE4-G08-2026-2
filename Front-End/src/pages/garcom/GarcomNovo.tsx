// Formulário do garçom para criar pedido e itens por mesa, enviando os dados à API de pedidos.
// Importa as primitivas React usadas para estado, efeitos e composição da interface; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import { useEffect, useState } from "react";
// Importa o roteador React para navegação e acesso às rotas; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import { useNavigate } from "react-router";
// Importa o contexto compartilhado, que fornece estado e ações à tela; esses valores conectam a página ao AuthContext.
import { useAuth } from "../../contexts/AuthContext";
// Importa o módulo ../../api/produtos, que fornece dependências usadas neste arquivo; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import { listarProdutos } from "../../api/produtos";
// Importa o módulo ../../api/usuarios, que fornece dependências usadas neste arquivo; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import { listarUsuarios } from "../../api/usuarios";
// Importa o módulo ../../api/pedidos, que fornece dependências usadas neste arquivo; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import { buscarPedidoAtivoDaMesa, criarPedido } from "../../api/pedidos";
// Importa o módulo ../../api/client, que fornece dependências usadas neste arquivo; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import { ApiError } from "../../api/client";
// Importa uma regra ou utilitário local reutilizável; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import { adicionarItem, alterarQuantidade, calcularPrevia, type ItemCarrinho } from "../../lib/carrinho";
// Importa uma regra ou utilitário local reutilizável; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import { validarNovoPedido } from "../../lib/pedidoForm";
// Importa uma regra ou utilitário local reutilizável; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import { validarMesa } from "../../lib/mesa";
// Importa um componente reutilizável da interface; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import { Layout } from "../../components/Layout";
// Importa um componente reutilizável da interface; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import { ProductCard } from "../../components/ProductCard";
// Importa um componente reutilizável da interface; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import { CartItem } from "../../components/CartItem";
// Importa os contratos de dados usados entre interface e API; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import type { Produto, UsuarioApi } from "../../types/api";

// Declara função GarcomNovo, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
export default function GarcomNovo() {
  // Obtém as ações e os dados de usuário fornecidos pelo contexto global de autenticação.
  const { usuario } = useAuth();
  // Declara valor navigate, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
  const navigate = useNavigate();
  // Declara valor exigeGarcom, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
  const exigeGarcom = usuario?.tipo === "Administrador";

  // Inicializa o estado local mesaTexto, que o componente atualiza para refletir os dados e as interacoes do usuario.
  const [mesaTexto, setMesaTexto] = useState("");
  // Inicializa o estado local mesa, que o componente atualiza para refletir os dados e as interacoes do usuario.
  const [mesa, setMesa] = useState<number | null>(null);
  // Inicializa o estado local produtos, que o componente atualiza para refletir os dados e as interacoes do usuario.
  const [produtos, setProdutos] = useState<Produto[]>([]);
  // Inicializa o estado local garcons, que o componente atualiza para refletir os dados e as interacoes do usuario.
  const [garcons, setGarcons] = useState<UsuarioApi[]>([]);
  // Inicializa o estado local idGarcom, que o componente atualiza para refletir os dados e as interacoes do usuario.
  const [idGarcom, setIdGarcom] = useState<number | null>(
    usuario?.tipo === "Garçom" ? usuario.id : null,
  );
  // Inicializa o estado local carrinho, que o componente atualiza para refletir os dados e as interacoes do usuario.
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([]);
  // Inicializa o estado local erro, que o componente atualiza para refletir os dados e as interacoes do usuario.
  const [erro, setErro] = useState<string | null>(null);
  // Inicializa o estado local enviando, que o componente atualiza para refletir os dados e as interacoes do usuario.
  const [enviando, setEnviando] = useState(false);

  // Sincroniza efeitos externos (API, temporizadores ou navegação) com o ciclo de vida do componente.
  useEffect(() => {
    listarProdutos().then(setProdutos).catch(() => {});
    // Verifica a condição do fluxo para decidir se os dados e a navegação devem seguir por este ramo.
    if (exigeGarcom) {
      listarUsuarios()
        .then((us) =>
          setGarcons(us.filter((u) => u.tipoUsuario.nome === "Garçom" && u.statusUsuario)),
        )
        .catch(() => {});
    }
  }, [exigeGarcom]);

  // Declara função verificarMesa, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
  async function verificarMesa() {
    // Declara valor m, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
    const m = validarMesa(mesaTexto);
    // Verifica a condição do fluxo para decidir se os dados e a navegação devem seguir por este ramo.
    if (m === null) {
      setMesa(null);
      // Retorna o resultado/renderização desta etapa ao componente ou chamador que coordena o fluxo.
      return;
    }
    setMesa(m);
    // Declara valor ativo, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
    const ativo = await buscarPedidoAtivoDaMesa(m);
    // Verifica a condição do fluxo para decidir se os dados e a navegação devem seguir por este ramo.
    if (ativo) {
      navigate(`/garcom/pedidos/${ativo.idPedido}`, {
        state: { aviso: "mesa já possui pedido em andamento" },
      });
    }
  }

  // Declara função enviar, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
  async function enviar() {
    // Declara valor m, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
    const m = mesa ?? validarMesa(mesaTexto);
    // Verifica a condição do fluxo para decidir se os dados e a navegação devem seguir por este ramo.
    if (m === null) {
      setErro("Informe um número de mesa válido.");
      // Retorna o resultado/renderização desta etapa ao componente ou chamador que coordena o fluxo.
      return;
    }
    // Declara valor idG, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
    const idG = exigeGarcom ? idGarcom : (usuario?.id ?? null);
    // Declara valor validacao, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
    const validacao = validarNovoPedido({
      numeroMesa: m,
      idGarcom: idG,
      itens: carrinho,
      exigeGarcom,
    });
    // Verifica a condição do fluxo para decidir se os dados e a navegação devem seguir por este ramo.
    if (validacao) {
      setErro(validacao);
      // Retorna o resultado/renderização desta etapa ao componente ou chamador que coordena o fluxo.
      return;
    }
    setErro(null);
    setEnviando(true);
    // Executa a operação sujeita a falhas, como uma chamada à API ou interação com o navegador.
    try {
      // Declara valor pedido, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
      const pedido = await criarPedido({
        numeroMesa: m,
        idGarcom: idG ?? undefined,
        itens: carrinho.map((i) => ({ idProduto: i.idProduto, quantidade: i.quantidade })),
      });
      navigate(`/garcom/pedidos/${pedido.idPedido}`);
    } catch (e) {
      // Verifica a condição do fluxo para decidir se os dados e a navegação devem seguir por este ramo.
      if (e instanceof ApiError && e.status === 409 && e.detalhes?.idPedido) {
        navigate(`/garcom/pedidos/${e.detalhes.idPedido}`, {
          state: { aviso: "Esta mesa já tem um pedido em andamento. Você foi redirecionado para ele, onde pode acrescentar itens." },
        });
      } else {
        setErro(e instanceof ApiError ? e.message : "Falha ao criar pedido.");
      }
    } finally {
      setEnviando(false);
    }
  }

  // Retorna o resultado/renderização desta etapa ao componente ou chamador que coordena o fluxo.
  return (
    <Layout>
      <h1>Novo pedido</h1>
      {erro && <div className="alert alert-danger">{erro}</div>}
      <div className="row g-3">
        <div className="col-md-4">
          <label className="form-label">Mesa</label>
          <input
            // Define a exportação pública deste módulo para integração com as demais partes da aplicação.
            type="number"
            className="form-control"
            value={mesaTexto}
            onChange={(e) => setMesaTexto(e.target.value)}
            onBlur={verificarMesa}
          />
        </div>
        {exigeGarcom && (
          <div className="col-md-4">
            <label className="form-label">Garçom responsável</label>
            <select
              className="form-select"
              value={idGarcom ?? ""}
              onChange={(e) => setIdGarcom(Number(e.target.value))}
            >
              <option value="">Selecione...</option>
              {garcons.map((g) => (
                <option key={g.idUsuario} value={g.idUsuario}>
                  {g.nome}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <h3 className="mt-4">Cardápio</h3>
      <div className="row g-3">
        {produtos
          .filter((p) => p.disponivel)
          .map((p) => (
            <div className="col-md-3" key={p.idProduto}>
              <ProductCard
                produto={p}
                onAdicionar={(prod) => setCarrinho((c) => adicionarItem(c, prod))}
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
            onAlterar={(id, q) => setCarrinho((c) => alterarQuantidade(c, id, q))}
            onRemover={(id) => setCarrinho((c) => c.filter((x) => x.idProduto !== id))}
          />
        ))}
      </ul>
      <div className="d-flex justify-content-between align-items-center">
        <strong>Prévia: R$ {calcularPrevia(carrinho).toFixed(2)}</strong>
        <button className="btn btn-success" disabled={enviando} onClick={enviar}>
          {enviando ? "Enviando..." : "✅ Criar pedido"}
        </button>
      </div>
    </Layout>
  );
}
