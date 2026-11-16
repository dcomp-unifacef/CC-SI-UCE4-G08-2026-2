// Ponto de inicialização: carrega estilos e monta App no DOM dentro do modo estrito e do roteador do React.
// Importa as primitivas React usadas para estado, efeitos e composição da interface; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import { StrictMode } from "react";
// Importa o módulo react-dom/client, que fornece dependências usadas neste arquivo; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import { createRoot } from "react-dom/client";
// Importa o roteador React para navegação e acesso às rotas; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import { BrowserRouter } from "react-router";
// Importa os estilos aplicados à interface; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import "bootstrap/dist/css/bootstrap.min.css";
// Importa os estilos aplicados à interface; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import "./index.css";
// Importa o módulo ./App.tsx, que fornece dependências usadas neste arquivo; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
