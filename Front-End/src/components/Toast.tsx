// Contexto e componentes de mensagens temporárias, disponibilizados globalmente pelo App.
// Importa as primitivas React usadas para estado, efeitos e composição da interface; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import {
  createContext,
  useCallback,
  useContext,
  useState,
  // Declara alias de tipo ReactNode, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
  type ReactNode,
} from "react";

// Declara alias de tipo Tipo, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
type Tipo = "success" | "error" | "info" | "warning";

// Declara contrato de dados ToastItem, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
interface ToastItem {
  id: number;
  tipo: Tipo;
  mensagem: string;
}

// Declara contrato de dados ToastCtx, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
interface ToastCtx {
  mostrar: (mensagem: string, tipo?: Tipo) => void;
}

// Declara valor Ctx, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
const Ctx = createContext<ToastCtx | null>(null);

// Declara função ToastProvider, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
export function ToastProvider({ children }: { children: ReactNode }) {
  // Inicializa o estado local toasts, que o componente atualiza para refletir os dados e as interacoes do usuario.
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Declara valor mostrar, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
  const mostrar = useCallback((mensagem: string, tipo: Tipo = "info") => {
    // Declara valor id, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, tipo, mensagem }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }, []);

  // Declara valor cores, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
  const cores: Record<Tipo, string> = {
    success: "text-bg-success",
    error: "text-bg-danger",
    info: "text-bg-info",
    warning: "text-bg-warning",
  };

  // Retorna o resultado/renderização desta etapa ao componente ou chamador que coordena o fluxo.
  return (
    <Ctx.Provider value={{ mostrar }}>
      {children}
      <div
        className="toast-container position-fixed bottom-0 end-0 p-3"
        style={{ zIndex: 1080 }}
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`toast show align-items-center ${cores[t.tipo]} border-0 mb-2`}
            role="alert"
          >
            <div className="d-flex">
              <div className="toast-body">{t.mensagem}</div>
              <button
                // Define a exportação pública deste módulo para integração com as demais partes da aplicação.
                type="button"
                className="btn-close btn-close-white me-2 m-auto"
                onClick={() => setToasts((x) => x.filter((y) => y.id !== t.id))}
              />
            </div>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

// Declara função useToast, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
export function useToast() {
  // Declara valor v, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
  const v = useContext(Ctx);
  // Verifica a condição do fluxo para decidir se os dados e a navegação devem seguir por este ramo.
  if (!v) throw new Error("useToast fora do provider");
  // Retorna o resultado/renderização desta etapa ao componente ou chamador que coordena o fluxo.
  return v;
}
