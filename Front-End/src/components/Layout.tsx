import { Link, useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";

export function Layout({ children }: { children: React.ReactNode }) {
  const { usuario, sair } = useAuth();
  const navigate = useNavigate();

  const staff = usuario?.tipo === "Garçom" || usuario?.tipo === "Administrador";

  return (
    <>
      <header className="cd-header py-3">
        <div className="container d-flex justify-content-between align-items-center">
          <img src="/logo.svg" alt="Chic Dog" style={{ height: 32 }} />
          {usuario && <span className="fw-medium">{usuario.nome}</span>}
        </div>
      </header>
      <nav className="cd-nav py-2">
        <div className="container d-flex gap-2 align-items-center flex-wrap">
          {staff && (
            <>
              <Link className="btn btn-sm btn-outline-dark" to="/garcom">
                Pedidos
              </Link>
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
