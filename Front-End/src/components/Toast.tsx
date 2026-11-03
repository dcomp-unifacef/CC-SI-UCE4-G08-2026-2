import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

type Tipo = "success" | "error" | "info" | "warning";

interface ToastItem {
  id: number;
  tipo: Tipo;
  mensagem: string;
}

interface ToastCtx {
  mostrar: (mensagem: string, tipo?: Tipo) => void;
}

const Ctx = createContext<ToastCtx | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const mostrar = useCallback((mensagem: string, tipo: Tipo = "info") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, tipo, mensagem }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }, []);

  const cores: Record<Tipo, string> = {
    success: "text-bg-success",
    error: "text-bg-danger",
    info: "text-bg-info",
    warning: "text-bg-warning",
  };

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

export function useToast() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useToast fora do provider");
  return v;
}
