import { Navigate, Route, Routes } from "react-router";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastProvider } from "./components/Toast";
import { RouteTransition } from "./components/RouteTransition";
import { lazy, Suspense } from "react";
const HotDog3D = lazy(() => import("./components/HotDog3D").then((m) => ({ default: m.HotDog3D })));
import { RotaProtegida } from "./routes/RotaProtegida";
import Login from "./pages/Login";
import GarcomLista from "./pages/garcom/GarcomLista";
import GarcomNovo from "./pages/garcom/GarcomNovo";
import GarcomPedido from "./pages/garcom/GarcomPedido";
import Cozinha from "./pages/Cozinha";
import AdminPedidos from "./pages/AdminPedidos";
import AdminHistorico from "./pages/AdminHistorico";
import Cliente from "./pages/cliente/Cliente";
import Pagamento from "./pages/pagamento/Pagamento";

export default function App() {
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
