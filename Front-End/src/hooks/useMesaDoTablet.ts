// Hook para obter e manter a identificação da mesa configurada no tablet do cliente.
// Importa as primitivas React usadas para estado, efeitos e composição da interface; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import { useState } from "react";
// Importa uma regra ou utilitário local reutilizável; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import { resolverMesa } from "../lib/mesa";

// Declara função useMesaDoTablet, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
export function useMesaDoTablet() {
  // Inicializa o estado local mesa, que o componente atualiza para refletir os dados e as interacoes do usuario.
  const [mesa, setMesa] = useState<number | null>(() =>
    resolverMesa(
      typeof window !== "undefined" ? window.location.search : "",
      typeof window !== "undefined" ? window.localStorage.getItem("chicdog.mesa") : null,
    ),
  );

  // Declara função configurarMesa, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
  function configurarMesa(valor: number) {
    // Verifica a condição do fluxo para decidir se os dados e a navegação devem seguir por este ramo.
    if (typeof window !== "undefined") {
      window.localStorage.setItem("chicdog.mesa", String(valor));
    }
    setMesa(valor);
  }

  // Retorna o resultado/renderização desta etapa ao componente ou chamador que coordena o fluxo.
  return { mesa, configurarMesa };
}
