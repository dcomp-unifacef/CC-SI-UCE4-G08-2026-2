// Efeito visual de comemoração acionado pela interface em situações de sucesso.
// Declara função dispararConfetti, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
export function dispararConfetti() {
  // Declara valor cores, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
  const cores = ["#c62828", "#ffc107", "#ff5f52", "#fff350", "#2e7d32"];
  // Declara valor container, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
  const container = document.createElement("div");
  container.style.cssText =
    "position:fixed;inset:0;pointer-events:none;z-index:9999;overflow:hidden;";
  document.body.appendChild(container);

  // Declara valor total, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
  const total = 80;
  // Repete o processamento para os dados do fluxo atual.
  for (let i = 0; i < total; i++) {
    // Declara valor el, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
    const el = document.createElement("div");
    // Declara valor cor, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
    const cor = cores[Math.floor(Math.random() * cores.length)];
    // Declara valor left, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
    const left = Math.random() * 100;
    // Declara valor delay, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
    const delay = Math.random() * 0.3;
    // Declara valor dur, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
    const dur = 1.8 + Math.random() * 1.2;
    // Declara valor size, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
    const size = 6 + Math.random() * 8;
    el.style.cssText = `
      position:absolute;
      left:${left}%;
      top:-20px;
      width:${size}px;
      height:${size}px;
      background:${cor};
      border-radius:${Math.random() > 0.5 ? "50%" : "2px"};
      opacity:0.9;
      animation: confettiFall ${dur}s ease-in ${delay}s forwards;
    `;
    container.appendChild(el);
  }

  // Verifica a condição do fluxo para decidir se os dados e a navegação devem seguir por este ramo.
  if (!document.getElementById("confetti-style")) {
    // Declara valor style, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
    const style = document.createElement("style");
    style.id = "confetti-style";
    style.textContent = `
      @keyframes confettiFall {
        0% { transform: translateY(0) rotate(0deg); opacity: 1; }
        100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }

  setTimeout(() => container.remove(), 3500);
}
