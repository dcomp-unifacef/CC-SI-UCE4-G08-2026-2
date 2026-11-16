// Invólucro reutilizável de diálogo modal para confirmações e formulários das telas.
// Importa o módulo react-dom, que fornece dependências usadas neste arquivo; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import { createPortal } from "react-dom";
// Importa as primitivas React usadas para estado, efeitos e composição da interface; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import { useEffect } from "react";

// Declara contrato de dados ModalProps, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
interface ModalProps {
  children: React.ReactNode;
  onFechar: () => void;
  /** Quando true, fecha ao clicar fora do conteúdo (backdrop). */
  fecharAoClicarFora?: boolean;
}

// Declara função Modal, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
export function Modal({
  children,
  onFechar,
  fecharAoClicarFora = true,
}: ModalProps) {
  // Fecha com a tecla Esc
  useEffect(() => {
    // Declara função onKeyDown, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
    function onKeyDown(e: KeyboardEvent) {
      // Verifica a condição do fluxo para decidir se os dados e a navegação devem seguir por este ramo.
      if (e.key === "Escape") onFechar();
    }
    document.addEventListener("keydown", onKeyDown);
    // Retorna o resultado/renderização desta etapa ao componente ou chamador que coordena o fluxo.
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onFechar]);

  // Retorna o resultado/renderização desta etapa ao componente ou chamador que coordena o fluxo.
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
