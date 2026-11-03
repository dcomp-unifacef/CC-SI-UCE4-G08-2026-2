import { useEffect, useRef } from "react";

export function usePolling(callback: () => void | Promise<void>, intervaloMs: number) {
  const cb = useRef(callback);
  cb.current = callback;

  useEffect(() => {
    const id = setInterval(() => {
      void cb.current();
    }, intervaloMs);
    return () => clearInterval(id);
  }, [intervaloMs]);
}
