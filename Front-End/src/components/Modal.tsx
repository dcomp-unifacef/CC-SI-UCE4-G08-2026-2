import { createPortal } from "react-dom";
import { useEffect } from "react";

interface ModalProps {
  children: React.ReactNode;
  onFechar: () => void;
  /** Quando true, fecha ao clicar fora do conteúdo (backdrop). */
  fecharAoClicarFora?: boolean;
}

export function Modal({
  children,
  onFechar,
  fecharAoClicarFora = true,
}: ModalProps) {
  // Fecha com a tecla Esc
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onFechar();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onFechar]);

  return createPortal(
    <>
      <div
        className="modal-backdrop fade show"
        onClick={fecharAoClicarFora ? onFechar : undefined}
      />
      <div
        className="modal fade show"
        style={{ display: "block" }}
        role="dialog"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">{children}</div>
        </div>
      </div>
    </>,
    document.body,
  );
}
