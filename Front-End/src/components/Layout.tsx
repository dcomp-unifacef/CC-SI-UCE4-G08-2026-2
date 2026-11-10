import { Link, useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { NotificacaoSino } from "./NotificacaoSino";

export function Layout({ children }: { children: React.ReactNode }) {
  const { usuario, sair } = useAuth();
  const navigate = useNavigate();

  const staff = usuario?.tipo === "Garçom" || usuario?.tipo === "Administrador";
  const ehGarcom = usuario?.tipo === "Garçom";

  return (
    <>
      <header className="cd-header py-3">
        <div className="container d-flex justify-content-between align-items-center">
          <span className="cd-brand-badge">
            <img src="/logo.svg" alt="Chic Dog" style={{ height: 32 }} />
          </span>
          {usuario && <span className="fw-medium">{usuario.nome}</span>}
          {ehGarcom && <NotificacaoSino />}
        </div>
      </header>
      <nav className="cd-nav py-2">
        <div className="container d-flex gap-2 align-items-center flex-wrap">
          {staff && (
            <>
              <Link
                className="btn btn-sm btn-outline-dark"
                to={usuario?.tipo === "Administrador" ? "/admin" : "/garcom"}
              >
                Pedidos
              </Link>
              {usuario?.tipo === "Administrador" && (
                <Link
                  className="btn btn-sm btn-outline-dark"
                  to="/admin/historico"
                >
                  Histórico
                </Link>
              )}
              <Link className="btn btn-sm btn-outline-dark" to="/garcom/novo">
                Novo pedido
              </Link>
            </>
          )}
          {usuario?.tipo === "Cozinheiro" && (
            <Link className="btn btn-sm btn-outline-dark" to="/cozinha">
              Cozinha
            </Link>
          )}
          {usuario?.tipo === "Cliente" && (
            <Link className="btn btn-sm btn-outline-dark" to="/cliente">
              Meu pedido
            </Link>
          )}
          <button
            className="btn btn-sm btn-outline-danger ms-auto"
            onClick={() => {
              sair();
              navigate("/login");
            }}
          >
            Sair
          </button>
        </div>
      </nav>
      <main className="container py-4">{children}</main>
    </>
  );
}
