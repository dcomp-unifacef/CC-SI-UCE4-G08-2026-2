// Guarda de navegação que aplica as regras do usuário autenticado antes de renderizar telas protegidas.
// Importa o roteador React para navegação e acesso às rotas; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import { Navigate, useLocation } from "react-router";
// Importa o contexto compartilhado, que fornece estado e ações à tela; esses valores conectam a página ao AuthContext.
import { useAuth } from "../contexts/AuthContext";
// Importa uma regra ou utilitário local reutilizável; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import { rotaInicialPorTipo, podeAcessarRota } from "../lib/auth";

// Declara função RotaProtegida, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
export function RotaProtegida({ children }: { children: React.ReactNode }) {
  // Obtém as ações e os dados de usuário fornecidos pelo contexto global de autenticação.
  const { usuario } = useAuth();
  // Declara valor location, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
  const location = useLocation();

  // Verifica a condição do fluxo para decidir se os dados e a navegação devem seguir por este ramo.
  if (!usuario) {
    // Retorna o resultado/renderização desta etapa ao componente ou chamador que coordena o fluxo.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Verifica a condição do fluxo para decidir se os dados e a navegação devem seguir por este ramo.
  if (!podeAcessarRota(usuario.tipo, location.pathname)) {
    // Retorna o resultado/renderização desta etapa ao componente ou chamador que coordena o fluxo.
    return <Navigate to={rotaInicialPorTipo(usuario.tipo)} replace />;
  }

  // Retorna o resultado/renderização desta etapa ao componente ou chamador que coordena o fluxo.
  return <>{children}</>;
}
