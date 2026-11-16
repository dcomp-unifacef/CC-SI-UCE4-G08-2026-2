// Hook reutilizável para atualizar dados periodicamente em telas que acompanham pedidos e notificações.
// Importa as primitivas React usadas para estado, efeitos e composição da interface; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import { useEffect, useRef } from "react";

// Declara função usePolling, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
export function usePolling(callback: () => void | Promise<void>, intervaloMs: number) {
  // Declara valor cb, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
  const cb = useRef(callback);
  cb.current = callback;

  // Sincroniza efeitos externos (API, temporizadores ou navegação) com o ciclo de vida do componente.
  useEffect(() => {
    // Declara valor id, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
    const id = setInterval(() => {
      void cb.current();
    }, intervaloMs);
    // Retorna o resultado/renderização desta etapa ao componente ou chamador que coordena o fluxo.
    return () => clearInterval(id);
  }, [intervaloMs]);
}
