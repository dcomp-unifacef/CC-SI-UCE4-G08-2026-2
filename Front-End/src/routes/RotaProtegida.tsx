import { Navigate, useLocation } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { rotaInicialPorTipo, podeAcessarRota } from "../lib/auth";

export function RotaProtegida({ children }: { children: React.ReactNode }) {
  const { usuario } = useAuth();
  const location = useLocation();

  if (!usuario) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!podeAcessarRota(usuario.tipo, location.pathname)) {
    return <Navigate to={rotaInicialPorTipo(usuario.tipo)} replace />;
  }

  return <>{children}</>;
}
