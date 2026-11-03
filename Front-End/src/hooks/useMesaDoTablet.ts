import { useState } from "react";
import { resolverMesa } from "../lib/mesa";

export function useMesaDoTablet() {
  const [mesa, setMesa] = useState<number | null>(() =>
    resolverMesa(
      typeof window !== "undefined" ? window.location.search : "",
      typeof window !== "undefined" ? window.localStorage.getItem("chicdog.mesa") : null,
    ),
  );

  function configurarMesa(valor: number) {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("chicdog.mesa", String(valor));
    }
    setMesa(valor);
  }

  return { mesa, configurarMesa };
}
