// Contexto global de autenticação: mantém usuário e token, coordena login/logout com API, sessão local e navegação.
// Importa as primitivas React usadas para estado, efeitos e composição da interface; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import {
  createContext,
  useContext,
  useEffect,
  useState,
  // Declara alias de tipo ReactNode, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
  type ReactNode,
} from "react";
// Importa o roteador React para navegação e acesso às rotas; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import { useNavigate } from "react-router";
// Importa o adaptador de API responsável pela comunicação com o servidor; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import { entrar as entrarApi } from "../api/auth";
// Importa o adaptador de API responsável pela comunicação com o servidor; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import { definirToken, definirTratadorSessaoExpirada } from "../api/client";
// Importa uma regra ou utilitário local reutilizável; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import { lerSessao, salvarSessao, limparSessao } from "../lib/sessao";
// Importa os contratos de dados usados entre interface e API; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import type { UsuarioLogado } from "../types/api";
// Importa uma regra ou utilitário local reutilizável; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import { rotaInicialPorTipo } from "../lib/auth";

// Declara contrato de dados AuthValue, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
interface AuthValue {
  usuario: UsuarioLogado | null;
  entrar: (login: string, senha: string) => Promise<void>;
  sair: () => void;
}

// Declara valor Ctx, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
const Ctx = createContext<AuthValue | null>(null);

// Declara função AuthProvider, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
export function AuthProvider({ children }: { children: ReactNode }) {
  // Inicializa o estado local usuario, que o componente atualiza para refletir os dados e as interacoes do usuario.
  const [usuario, setUsuario] = useState<UsuarioLogado | null>(
    () => lerSessao()?.usuario ?? null,
  );
  // Declara valor navigate, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
  const navigate = useNavigate();

  // Sincroniza efeitos externos (API, temporizadores ou navegação) com o ciclo de vida do componente.
  useEffect(() => {
    // Declara valor sessao, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
    const sessao = lerSessao();
    // Verifica a condição do fluxo para decidir se os dados e a navegação devem seguir por este ramo.
    if (sessao) definirToken(sessao.token);
  }, []);

  // Sincroniza efeitos externos (API, temporizadores ou navegação) com o ciclo de vida do componente.
  useEffect(() => {
    definirTratadorSessaoExpirada(() => {
      limparSessao();
      definirToken(null);
      setUsuario(null);
      navigate("/login", { replace: true });
    });
    // Retorna o resultado/renderização desta etapa ao componente ou chamador que coordena o fluxo.
    return () => definirTratadorSessaoExpirada(null);
  }, [navigate]);

  // Declara função entrar, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
  async function entrar(loginUsuario: string, senha: string) {
    // Declara valor resposta, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
    const resposta = await entrarApi(loginUsuario, senha);
    salvarSessao({ usuario: resposta.usuario, token: resposta.token });
    definirToken(resposta.token);
    setUsuario(resposta.usuario);
    navigate(rotaInicialPorTipo(resposta.usuario.tipo), { replace: true });
  }

  // Declara função sair, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
  function sair() {
    limparSessao();
    definirToken(null);
    setUsuario(null);
    navigate("/login", { replace: true });
  }

  // Retorna o resultado/renderização desta etapa ao componente ou chamador que coordena o fluxo.
  return (
    <Ctx.Provider value={{ usuario, entrar, sair }}>{children}</Ctx.Provider>
  );
}

// Declara função useAuth, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
export function useAuth() {
  // Declara valor v, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
  const v = useContext(Ctx);
  // Verifica a condição do fluxo para decidir se os dados e a navegação devem seguir por este ramo.
  if (!v) throw new Error("useAuth fora do provider");
  // Retorna o resultado/renderização desta etapa ao componente ou chamador que coordena o fluxo.
  return v;
}
