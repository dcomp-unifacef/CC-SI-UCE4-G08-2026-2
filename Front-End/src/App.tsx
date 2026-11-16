// Componente raiz: compõe provedores de autenticação e notificações, transiçãoes e rotas para as telas por perfil.
// Importa o roteador React para navegação e acesso às rotas; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import { Navigate, Route, Routes } from "react-router";
// Importa o contexto compartilhado, que fornece estado e ações à tela; esses valores conectam a página ao AuthContext.
import { AuthProvider } from "./contexts/AuthContext";
// Importa um componente reutilizável da interface; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import { ToastProvider } from "./components/Toast";
// Importa um componente reutilizável da interface; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import { RouteTransition } from "./components/RouteTransition";
// Importa as primitivas React usadas para estado, efeitos e composição da interface; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import { lazy, Suspense } from "react";
// Declara valor HotDog3D, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
const HotDog3D = lazy(() => import("./components/HotDog3D").then((m) => ({ default: m.HotDog3D })));
// Importa o módulo ./routes/RotaProtegida, que fornece dependências usadas neste arquivo; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import { RotaProtegida } from "./routes/RotaProtegida";
// Importa o módulo ./pages/Login, que fornece dependências usadas neste arquivo; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import Login from "./pages/Login";
// Importa o módulo ./pages/garcom/GarcomLista, que fornece dependências usadas neste arquivo; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import GarcomLista from "./pages/garcom/GarcomLista";
// Importa o módulo ./pages/garcom/GarcomNovo, que fornece dependências usadas neste arquivo; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import GarcomNovo from "./pages/garcom/GarcomNovo";
// Importa o módulo ./pages/garcom/GarcomPedido, que fornece dependências usadas neste arquivo; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import GarcomPedido from "./pages/garcom/GarcomPedido";
// Importa o módulo ./pages/Cozinha, que fornece dependências usadas neste arquivo; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import Cozinha from "./pages/Cozinha";
// Importa o módulo ./pages/AdminPedidos, que fornece dependências usadas neste arquivo; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import AdminPedidos from "./pages/AdminPedidos";
// Importa o módulo ./pages/AdminHistorico, que fornece dependências usadas neste arquivo; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import AdminHistorico from "./pages/AdminHistorico";
// Importa o módulo ./pages/cliente/Cliente, que fornece dependências usadas neste arquivo; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import Cliente from "./pages/cliente/Cliente";
// Importa o módulo ./pages/pagamento/Pagamento, que fornece dependências usadas neste arquivo; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import Pagamento from "./pages/pagamento/Pagamento";

// Declara função App, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
export default function App() {
  // Retorna o resultado/renderização desta etapa ao componente ou chamador que coordena o fluxo.
  return (
    <AuthProvider>
      <ToastProvider>
        <RouteTransition>
        <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/garcom"
          element={
            <RotaProtegida>
              <GarcomLista />
            </RotaProtegida>
          }
        />
        <Route
          path="/garcom/novo"
          element={
            <RotaProtegida>
              <GarcomNovo />
            </RotaProtegida>
          }
        />
        <Route
          path="/garcom/pedidos/:id"
          element={
            <RotaProtegida>
              <GarcomPedido />
            </RotaProtegida>
          }
        />
        <Route
          path="/cozinha"
          element={
            <RotaProtegida>
              <Cozinha />
            </RotaProtegida>
          }
        />
        <Route
          path="/admin"
          element={
            <RotaProtegida>
              <AdminPedidos />
            </RotaProtegida>
          }
        />
        <Route
          path="/admin/historico"
          element={
            <RotaProtegida>
              <AdminHistorico />
            </RotaProtegida>
          }
        />
        <Route
          path="/cliente"
          element={
            <RotaProtegida>
              <Cliente />
            </RotaProtegida>
          }
        />
        <Route
          path="/pagamento"
          element={
            <RotaProtegida>
              <Pagamento />
            </RotaProtegida>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
        </RouteTransition>
        <Suspense fallback={null}>
          <HotDog3D />
        </Suspense>
      </ToastProvider>
    </AuthProvider>
  );
}
