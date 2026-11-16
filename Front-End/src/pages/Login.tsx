// Tela de entrada: coleta credenciais, chama o contexto de autenticação e apresenta falhas de login.
// Importa as primitivas React usadas para estado, efeitos e composição da interface; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import { useState, type FormEvent } from "react";
// Importa o contexto compartilhado, que fornece estado e ações à tela; esses valores conectam a página ao AuthContext.
import { useAuth } from "../contexts/AuthContext";
// Importa o adaptador de API responsável pela comunicação com o servidor; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import { ApiError } from "../api/client";

// Declara função Login, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
export default function Login() {
  // Obtém as ações e os dados de usuário fornecidos pelo contexto global de autenticação.
  const { entrar } = useAuth();
  // Inicializa o estado local loginUsuario, que o componente atualiza para refletir os dados e as interacoes do usuario.
  const [loginUsuario, setLoginUsuario] = useState("");
  // Inicializa o estado local senha, que o componente atualiza para refletir os dados e as interacoes do usuario.
  const [senha, setSenha] = useState("");
  // Inicializa o estado local enviando, que o componente atualiza para refletir os dados e as interacoes do usuario.
  const [enviando, setEnviando] = useState(false);
  // Inicializa o estado local erro, que o componente atualiza para refletir os dados e as interacoes do usuario.
  const [erro, setErro] = useState<string | null>(null);

  // Declara função onSubmit, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    setEnviando(true);
    // Executa a operação sujeita a falhas, como uma chamada à API ou interação com o navegador.
    try {
      await entrar(loginUsuario, senha);
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : "Falha no login.");
    } finally {
      setEnviando(false);
    }
  }

  // Retorna o resultado/renderização desta etapa ao componente ou chamador que coordena o fluxo.
  return (
    <div className="container py-5" style={{ maxWidth: 420 }}>
      <h1 className="mb-4">Chic Dog</h1>
      <form onSubmit={onSubmit}>
        <div className="mb-3">
          <label className="form-label">Login</label>
          <input
            className="form-control"
            value={loginUsuario}
            onChange={(e) => setLoginUsuario(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Senha</label>
          <input
            // Define a exportação pública deste módulo para integração com as demais partes da aplicação.
            type="password"
            className="form-control"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />
        </div>
        {erro && <div className="alert alert-danger">{erro}</div>}
        <button className="btn btn-primary w-100" disabled={enviando}>
          {enviando ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
