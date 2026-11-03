import { useState } from "react";
import { useMesaDoTablet } from "../../hooks/useMesaDoTablet";
import { validarMesa } from "../../lib/mesa";
import { Layout } from "../../components/Layout";

export default function ConfigurarTablet() {
  const { configurarMesa } = useMesaDoTablet();
  const [valor, setValor] = useState("");
  const [erro, setErro] = useState<string | null>(null);

  function salvar() {
    const m = validarMesa(valor);
    if (m === null) {
      setErro("Informe um número de mesa válido.");
      return;
    }
    setErro(null);
    configurarMesa(m);
  }

  return (
    <Layout>
      <h1>Configurar tablet</h1>
      <p className="text-muted">Informe o número da mesa deste tablet.</p>
      {erro && <div className="alert alert-danger">{erro}</div>}
      <div className="input-group" style={{ maxWidth: 320 }}>
        <input
          type="number"
          className="form-control"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
        />
        <button className="btn btn-primary" onClick={salvar}>
          Salvar
        </button>
      </div>
    </Layout>
  );
}
