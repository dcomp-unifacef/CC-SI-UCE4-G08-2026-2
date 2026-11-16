// Estrutura compartilhada das telas autenticadas, reunindo navegação e conteúdo conforme o perfil ativo.
// Importa o roteador React para navegação e acesso às rotas; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import { Link, useNavigate } from "react-router";
// Importa o contexto compartilhado, que fornece estado e ações à tela; esses valores conectam a página ao AuthContext.
import { useAuth } from "../contexts/AuthContext";
// Importa o módulo ./NotificacaoSino, que fornece dependências usadas neste arquivo; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import { NotificacaoSino } from "./NotificacaoSino";

// Declara função Layout, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
export function Layout({ children }: { children: React.ReactNode }) {
  // Obtém as ações e os dados de usuário fornecidos pelo contexto global de autenticação.
  const { usuario, sair } = useAuth();
  // Declara valor navigate, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
  const navigate = useNavigate();

  // Declara valor staff, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
  const staff = usuario?.tipo === "Garçom" || usuario?.tipo === "Administrador";
  // Declara valor ehGarcom, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
  const ehGarcom = usuario?.tipo === "Garçom";

  // Retorna o resultado/renderização desta etapa ao componente ou chamador que coordena o fluxo.
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
