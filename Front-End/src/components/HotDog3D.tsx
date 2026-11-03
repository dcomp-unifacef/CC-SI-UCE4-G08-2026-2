import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export function HotDog3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(260, 200);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 260 / 200, 0.1, 100);
    camera.position.set(0, 1.2, 6);

    const ambient = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambient);
    const dir = new THREE.DirectionalLight(0xffffff, 1.0);
    dir.position.set(3, 5, 4);
    scene.add(dir);
    const warm = new THREE.DirectionalLight(0xffc107, 0.5);
    warm.position.set(-3, 2, -2);
    scene.add(warm);

    const group = new THREE.Group();
    scene.add(group);

    const loader = new GLTFLoader();
    loader.load("/hotdog.glb", (gltf) => {
      const model = gltf.scene;
      // centralizar e escalar
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 2.2 / maxDim;
      model.scale.setScalar(scale);
      const center = box.getCenter(new THREE.Vector3());
      model.position.sub(center.multiplyScalar(scale));
      group.add(model);
    });

    let raf = 0;
    const clock = new THREE.Clock();
    const animate = () => {
      raf = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      group.rotation.y = t * 0.6;
      group.position.y = Math.sin(t * 1.2) * 0.15;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      renderer.dispose();
    };
  }, []);

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
