// Componente decorativo 3D baseado em Three.js, carregado de forma assíncrona pelo componente raiz.
// Importa as primitivas React usadas para estado, efeitos e composição da interface; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import { useEffect, useRef } from "react";
// Importa a biblioteca de renderização 3D; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import * as THREE from "three";
// Importa a biblioteca de renderização 3D; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

// Declara função HotDog3D, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
export function HotDog3D() {
  // Declara valor canvasRef, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Sincroniza efeitos externos (API, temporizadores ou navegação) com o ciclo de vida do componente.
  useEffect(() => {
    // Declara valor canvas, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
    const canvas = canvasRef.current;
    // Verifica a condição do fluxo para decidir se os dados e a navegação devem seguir por este ramo.
    if (!canvas) return;

    // Declara valor renderer, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(260, 200);

    // Declara valor scene, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
    const scene = new THREE.Scene();
    // Declara valor camera, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
    const camera = new THREE.PerspectiveCamera(40, 260 / 200, 0.1, 100);
    camera.position.set(0, 1.2, 6);

    // Declara valor ambient, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
    const ambient = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambient);
    // Declara valor dir, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
    const dir = new THREE.DirectionalLight(0xffffff, 1.0);
    dir.position.set(3, 5, 4);
    scene.add(dir);
    // Declara valor warm, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
    const warm = new THREE.DirectionalLight(0xffc107, 0.5);
    warm.position.set(-3, 2, -2);
    scene.add(warm);

    // Declara valor group, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
    const group = new THREE.Group();
    scene.add(group);

    // Declara valor loader, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
    const loader = new GLTFLoader();
    loader.load("/hotdog.glb", (gltf) => {
      // Declara valor model, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
      const model = gltf.scene;
      // centralizar e escalar
      const box = new THREE.Box3().setFromObject(model);
      // Declara valor size, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
      const size = box.getSize(new THREE.Vector3());
      // Declara valor maxDim, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
      const maxDim = Math.max(size.x, size.y, size.z);
      // Declara valor scale, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
      const scale = 2.2 / maxDim;
      model.scale.setScalar(scale);
      // Declara valor center, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
      const center = box.getCenter(new THREE.Vector3());
      model.position.sub(center.multiplyScalar(scale));
      group.add(model);
    });

    // Declara estado mutável raf, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
    let raf = 0;
    // Declara valor clock, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
    const clock = new THREE.Clock();
    // Declara valor animate, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
    const animate = () => {
      raf = requestAnimationFrame(animate);
      // Declara valor t, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
      const t = clock.getElapsedTime();
      group.rotation.y = t * 0.6;
      group.position.y = Math.sin(t * 1.2) * 0.15;
      renderer.render(scene, camera);
    };
    animate();

    // Retorna o resultado/renderização desta etapa ao componente ou chamador que coordena o fluxo.
    return () => {
      cancelAnimationFrame(raf);
      renderer.dispose();
    };
  }, []);

  // Retorna o resultado/renderização desta etapa ao componente ou chamador que coordena o fluxo.
  return (
    <div className="hotdog3d" aria-hidden="true">
      <div className="hotdog3d__title">Chic Dog</div>
      <canvas
        ref={canvasRef}
        className="hotdog3d-canvas"
        width={260}
        height={200}
      />
    </div>
  );
}
