export function dispararConfetti() {
  const cores = ["#c62828", "#ffc107", "#ff5f52", "#fff350", "#2e7d32"];
  const container = document.createElement("div");
  container.style.cssText =
    "position:fixed;inset:0;pointer-events:none;z-index:9999;overflow:hidden;";
  document.body.appendChild(container);

  const total = 80;
  for (let i = 0; i < total; i++) {
    const el = document.createElement("div");
    const cor = cores[Math.floor(Math.random() * cores.length)];
    const left = Math.random() * 100;
    const delay = Math.random() * 0.3;
    const dur = 1.8 + Math.random() * 1.2;
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

  if (!document.getElementById("confetti-style")) {
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
