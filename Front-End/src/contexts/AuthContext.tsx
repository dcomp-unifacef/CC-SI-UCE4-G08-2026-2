import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router";
import { entrar as entrarApi } from "../api/auth";
import { definirToken, definirTratadorSessaoExpirada } from "../api/client";
import { lerSessao, salvarSessao, limparSessao } from "../lib/sessao";
import type { UsuarioLogado } from "../types/api";
import { rotaInicialPorTipo } from "../lib/auth";

interface AuthValue {
  usuario: UsuarioLogado | null;
  entrar: (login: string, senha: string) => Promise<void>;
  sair: () => void;
}

const Ctx = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioLogado | null>(
    () => lerSessao()?.usuario ?? null,
  );
  const navigate = useNavigate();

  useEffect(() => {
    const sessao = lerSessao();
    if (sessao) definirToken(sessao.token);
  }, []);

  useEffect(() => {
    definirTratadorSessaoExpirada(() => {
      limparSessao();
      definirToken(null);
      setUsuario(null);
      navigate("/login", { replace: true });
    });
    return () => definirTratadorSessaoExpirada(null);
  }, [navigate]);

  async function entrar(loginUsuario: string, senha: string) {
    const resposta = await entrarApi(loginUsuario, senha);
    salvarSessao({ usuario: resposta.usuario, token: resposta.token });
    definirToken(resposta.token);
    setUsuario(resposta.usuario);
    navigate(rotaInicialPorTipo(resposta.usuario.tipo), { replace: true });
  }

  function sair() {
    limparSessao();
    definirToken(null);
    setUsuario(null);
    navigate("/login", { replace: true });
  }

  return (
    <Ctx.Provider value={{ usuario, entrar, sair }}>{children}</Ctx.Provider>
  );
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth fora do provider");
  return v;
}
