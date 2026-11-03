import { Navigate, Route, Routes } from "react-router";
import { AuthProvider } from "./contexts/AuthContext";
import { RotaProtegida } from "./routes/RotaProtegida";
import Login from "./pages/Login";
import GarcomLista from "./pages/garcom/GarcomLista";
import GarcomNovo from "./pages/garcom/GarcomNovo";
import GarcomPedido from "./pages/garcom/GarcomPedido";
import Cozinha from "./pages/Cozinha";
import Cliente from "./pages/cliente/Cliente";

export default function App() {
  return (
    <AuthProvider>
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
          path="/cliente"
          element={
            <RotaProtegida>
              <Cliente />
            </RotaProtegida>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  );
}
