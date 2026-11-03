import { useLocation } from "react-router";
import { useEffect, useState } from "react";

export function RouteTransition({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    setTransitioning(true);
    const t = setTimeout(() => {
      setDisplayChildren(children);
      setTransitioning(false);
    }, 120);
    return () => clearTimeout(t);
  }, [location.pathname]);

  return (
    <div className={transitioning ? "route-fade-out" : "route-fade-in"}>
      {displayChildren}
    </div>
  );
}
