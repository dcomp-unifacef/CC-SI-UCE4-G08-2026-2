// Invólucro visual das rotas, aplicado pelo App ao conteúdo de navegação.
// Importa o roteador React para navegação e acesso às rotas; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import { useLocation } from "react-router";
// Importa as primitivas React usadas para estado, efeitos e composição da interface; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import { useEffect, useState } from "react";

// Declara função RouteTransition, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
export function RouteTransition({ children }: { children: React.ReactNode }) {
  // Declara valor location, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
  const location = useLocation();
  // Inicializa o estado local displayChildren, que o componente atualiza para refletir os dados e as interacoes do usuario.
  const [displayChildren, setDisplayChildren] = useState(children);
  // Inicializa o estado local transitioning, que o componente atualiza para refletir os dados e as interacoes do usuario.
  const [transitioning, setTransitioning] = useState(false);

  // Sincroniza efeitos externos (API, temporizadores ou navegação) com o ciclo de vida do componente.
  useEffect(() => {
    setTransitioning(true);
    // Declara valor t, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
    const t = setTimeout(() => {
      setDisplayChildren(children);
      setTransitioning(false);
    }, 120);
    // Retorna o resultado/renderização desta etapa ao componente ou chamador que coordena o fluxo.
    return () => clearTimeout(t);
  }, [location.pathname]);

  // Retorna o resultado/renderização desta etapa ao componente ou chamador que coordena o fluxo.
  return (
    <div className={transitioning ? "route-fade-out" : "route-fade-in"}>
      {displayChildren}
    </div>
  );
}
