// Tela para configurar a mesa do tablet, alimentando a identificação usada pelo fluxo de cliente.
// Importa as primitivas React usadas para estado, efeitos e composição da interface; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import { useState } from "react";
// Importa um hook compartilhado de estado ou comportamento; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import { useMesaDoTablet } from "../../hooks/useMesaDoTablet";
// Importa uma regra ou utilitário local reutilizável; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import { validarMesa } from "../../lib/mesa";
// Importa um componente reutilizável da interface; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import { Layout } from "../../components/Layout";

// Declara função ConfigurarTablet, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
export default function ConfigurarTablet() {
  // Define a exportação pública deste módulo para integração com as demais partes da aplicação.
  const { configurarMesa } = useMesaDoTablet();
  // Inicializa o estado local valor, que o componente atualiza para refletir os dados e as interacoes do usuario.
  const [valor, setValor] = useState("");
  // Inicializa o estado local erro, que o componente atualiza para refletir os dados e as interacoes do usuario.
  const [erro, setErro] = useState<string | null>(null);

  // Declara função salvar, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
  function salvar() {
    // Declara valor m, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
    const m = validarMesa(valor);
    // Verifica a condição do fluxo para decidir se os dados e a navegação devem seguir por este ramo.
    if (m === null) {
      setErro("Informe um número de mesa válido.");
      // Retorna o resultado/renderização desta etapa ao componente ou chamador que coordena o fluxo.
      return;
    }
    setErro(null);
    configurarMesa(m);
  }

  // Retorna o resultado/renderização desta etapa ao componente ou chamador que coordena o fluxo.
  return (
    <Layout>
      <h1>Configurar tablet</h1>
      <p className="text-muted">Informe o número da mesa deste tablet.</p>
      {erro && <div className="alert alert-danger">{erro}</div>}
      <div className="input-group" style={{ maxWidth: 320 }}>
        <input
          // Define a exportação pública deste módulo para integração com as demais partes da aplicação.
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
