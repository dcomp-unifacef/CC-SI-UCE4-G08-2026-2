import { useState, type FormEvent } from "react";
import { useAuth } from "../contexts/AuthContext";
import { ApiError } from "../api/client";

export default function Login() {
  const { entrar } = useAuth();
  const [loginUsuario, setLoginUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      await entrar(loginUsuario, senha);
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : "Falha no login.");
    } finally {
      setEnviando(false);
    }
  }

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
