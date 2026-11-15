import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

export default function ThreeHero() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;
    let renderer, animationFrame = 0, observer, disposed = false, environmentTarget;
    const scene = new THREE.Scene();
    scene.background = null;
    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
    camera.position.set(0, 0, 7.7);

    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    } catch {
      mount.dataset.webglFallback = 'true';
      return undefined;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.65));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.domElement.className = 'hero-webgl-canvas';
    renderer.domElement.setAttribute('aria-hidden', 'true');
    mount.appendChild(renderer.domElement);

    const pmrem = new THREE.PMREMGenerator(renderer);
    pmrem.compileEquirectangularShader();
    const room = new RoomEnvironment();
    environmentTarget = pmrem.fromScene(room, 0.04);
    scene.environment = environmentTarget.texture;
    room.dispose();

    scene.add(new THREE.AmbientLight(0xffffe3, 1.3));
    const key = new THREE.DirectionalLight(0xffffe3, 3.2);
    key.position.set(4, 5, 6);
    scene.add(key);
    const limeLight = new THREE.PointLight(0x6d8196, 23, 16, 2);
    limeLight.position.set(-3.3, 1.4, 2.5);
    scene.add(limeLight);
    const lavenderLight = new THREE.PointLight(0xcbcbcb, 18, 15, 2);
    lavenderLight.position.set(2.5, -2.2, -2);
    scene.add(lavenderLight);

    const group = new THREE.Group();
    group.rotation.set(-0.18, 0.25, -0.12);
    scene.add(group);
    const coreMat = new THREE.MeshPhysicalMaterial({
      color: 0x1b1a20, metalness: 0.92, roughness: 0.2,
      clearcoat: 1, clearcoatRoughness: 0.12, emissive: 0x4a4a4a, emissiveIntensity: 0.35,
    });
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.84, 72, 72), coreMat);
    group.add(core);

    const limeMat = new THREE.MeshPhysicalMaterial({
      color: 0x6d8196, metalness: 0.68, roughness: 0.17, clearcoat: 1,
      clearcoatRoughness: 0.08, emissive: 0x2f3c47, emissiveIntensity: 0.38,
    });
    const knot = new THREE.Mesh(new THREE.TorusKnotGeometry(0.77, 0.145, 260, 22, 2, 5), limeMat);
    knot.rotation.set(0.48, 0.16, 0.4);
    group.add(knot);

    const chromeMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffe3, metalness: 0.97, roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.1,
    });
    const orbitA = new THREE.Mesh(new THREE.TorusGeometry(1.43, 0.022, 14, 220), chromeMat);
    orbitA.rotation.set(1.02, 0.45, 0.28);
    group.add(orbitA);
    const orbitB = new THREE.Mesh(new THREE.TorusGeometry(1.7, 0.014, 12, 220), limeMat);
    orbitB.rotation.set(0.32, 1.08, 0.68);
    group.add(orbitB);
    const orbitC = new THREE.Mesh(new THREE.TorusGeometry(1.22, 0.012, 12, 200), chromeMat);
    orbitC.rotation.set(1.25, 0.15, 1.04);
    group.add(orbitC);

    const wire = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.86, 2),
      new THREE.MeshBasicMaterial({ color: 0xcbcbcb, wireframe: true, transparent: true, opacity: 0.16 }),
    );
    group.add(wire);

    const count = 1250;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const lime = new THREE.Color(0x6d8196), lavender = new THREE.Color(0xcbcbcb), ink = new THREE.Color(0x4a4a4a);
    for (let i = 0; i < count; i++) {
      const radius = 2.05 + Math.random() * 3.2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
      const color = Math.random() > 0.83 ? lime : Math.random() > 0.45 ? lavender : ink;
      colors[i * 3] = color.r; colors[i * 3 + 1] = color.g; colors[i * 3 + 2] = color.b;
    }
    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const particles = new THREE.Points(particleGeometry, new THREE.PointsMaterial({
      size: 0.019, vertexColors: true, transparent: true, opacity: 0.9, sizeAttenuation: true,
    }));
    scene.add(particles);

    const halo = new THREE.Mesh(
      new THREE.RingGeometry(2.08, 2.105, 180),
      new THREE.MeshBasicMaterial({ color: 0x6d8196, transparent: true, opacity: 0.28, side: THREE.DoubleSide }),
    );
    halo.position.z = -0.9;
    halo.rotation.z = 0.1;
    scene.add(halo);

    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    const drag = {
      isDragging: false,
      previousX: 0,
      previousY: 0,
      rotationX: 0,
      rotationY: 0,
      velocityX: 0,
      velocityY: 0,
      lastMoveTime: 0,
    };

    const SENSITIVITY = 0.0055;
    const FRICTION = 0.94;
    const MAX_VELOCITY = 0.18;
    const MIN_VELOCITY = 0.0001;

    const onPointerDown = e => {
      if (e.button !== undefined && e.button !== 0 && e.pointerType === 'mouse') return;
      drag.isDragging = true;
      drag.previousX = e.clientX;
      drag.previousY = e.clientY;
      drag.velocityX = 0;
      drag.velocityY = 0;
      drag.lastMoveTime = performance.now();
      mount.classList.add('is-dragging');
      if (mount.setPointerCapture) {
        try {
          mount.setPointerCapture(e.pointerId);
        } catch (_) {}
      }
    };

    const onPointerMove = e => {
      const r = mount.getBoundingClientRect();
      pointer.tx = ((e.clientX - r.left) / Math.max(r.width, 1) - 0.5) * 2;
      pointer.ty = ((e.clientY - r.top) / Math.max(r.height, 1) - 0.5) * 2;

      if (!drag.isDragging) return;

      const deltaX = e.clientX - drag.previousX;
      const deltaY = e.clientY - drag.previousY;
      const now = performance.now();
      const dt = Math.max(1, now - drag.lastMoveTime);

      drag.rotationY += deltaX * SENSITIVITY;
      drag.rotationX = Math.max(-1.25, Math.min(1.25, drag.rotationX + deltaY * SENSITIVITY));

      const frameDelta = dt / 16.67;
      const vx = (deltaY * SENSITIVITY) / frameDelta;
      const vy = (deltaX * SENSITIVITY) / frameDelta;

      drag.velocityX = Math.max(-MAX_VELOCITY, Math.min(MAX_VELOCITY, vx));
      drag.velocityY = Math.max(-MAX_VELOCITY, Math.min(MAX_VELOCITY, vy));

      drag.previousX = e.clientX;
      drag.previousY = e.clientY;
      drag.lastMoveTime = now;
    };

    const onPointerUp = e => {
      if (!drag.isDragging) return;
      drag.isDragging = false;
      mount.classList.remove('is-dragging');
      if (performance.now() - drag.lastMoveTime > 120) {
        drag.velocityX = 0;
        drag.velocityY = 0;
      }
      if (mount.releasePointerCapture) {
        try {
          mount.releasePointerCapture(e.pointerId);
        } catch (_) {}
      }
    };

    const onPointerCancel = onPointerUp;
    const onPointerLeave = () => {
      pointer.tx = 0;
      pointer.ty = 0;
      if (!drag.isDragging) {
        mount.classList.remove('is-dragging');
      }
    };

    mount.addEventListener('pointerdown', onPointerDown);
    mount.addEventListener('pointermove', onPointerMove, { passive: true });
    mount.addEventListener('pointerup', onPointerUp);
    mount.addEventListener('pointercancel', onPointerCancel);
    mount.addEventListener('pointerleave', onPointerLeave);

    const clock = new THREE.Clock();
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const resize = () => {
      const width = Math.max(1, mount.clientWidth), height = Math.max(1, mount.clientHeight);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };
    observer = new ResizeObserver(resize);
    observer.observe(mount);
    resize();

    const render = () => {
      if (disposed) return;
      animationFrame = requestAnimationFrame(render);
      const t = clock.getElapsedTime();
      pointer.x += (pointer.tx - pointer.x) * 0.035;
      pointer.y += (pointer.ty - pointer.y) * 0.035;

      // Inertia & momentum physics
      if (!drag.isDragging) {
        if (Math.abs(drag.velocityY) > MIN_VELOCITY) {
          drag.rotationY += drag.velocityY;
          drag.velocityY *= FRICTION;
        } else {
          drag.velocityY = 0;
        }

        if (Math.abs(drag.velocityX) > MIN_VELOCITY) {
          drag.rotationX = Math.max(-1.25, Math.min(1.25, drag.rotationX + drag.velocityX));
          drag.velocityX *= FRICTION;
        } else {
          drag.velocityX = 0;
        }
      }

      if (!reduced) {
        group.rotation.y = 0.24 + t * 0.12 + pointer.x * 0.19 + drag.rotationY;
        group.rotation.x = -0.18 + Math.sin(t * 0.25) * 0.09 - pointer.y * 0.16 + drag.rotationX;
        group.rotation.z = -0.12 + Math.sin(t * 0.18) * 0.055;
        knot.rotation.x = 0.48 + t * 0.18;
        knot.rotation.y = 0.16 + t * 0.12;
        orbitA.rotation.z += 0.0018;
        orbitB.rotation.x -= 0.0014;
        particles.rotation.y = t * 0.018 + drag.rotationY * 0.4;
        particles.rotation.x = Math.sin(t * 0.12) * 0.035 + drag.rotationX * 0.3;
        halo.rotation.z = t * -0.04;
        core.scale.setScalar(1 + Math.sin(t * 1.1) * 0.018);
      } else {
        group.rotation.y = 0.24 + drag.rotationY;
        group.rotation.x = -0.18 + drag.rotationX;
      }
      const bounds = mount.getBoundingClientRect();
      const scale = Math.min(bounds.width / 590, 1.08);
      group.scale.setScalar(Math.max(0.72, scale));
      group.position.x = pointer.x * 0.12;
      group.position.y = -0.02 - pointer.y * 0.1 + (reduced ? 0 : Math.sin(t * 0.7) * 0.08);
      renderer.render(scene, camera);
    };
    render();

    return () => {
      disposed = true;
      cancelAnimationFrame(animationFrame);
      observer?.disconnect();
      mount.removeEventListener('pointerdown', onPointerDown);
      mount.removeEventListener('pointermove', onPointerMove);
      mount.removeEventListener('pointerup', onPointerUp);
      mount.removeEventListener('pointercancel', onPointerCancel);
      mount.removeEventListener('pointerleave', onPointerLeave);
      scene.traverse(obj => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) (Array.isArray(obj.material) ? obj.material : [obj.material]).forEach(m => m.dispose());
      });
      environmentTarget?.dispose();
      pmrem.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div className="hero-webgl-mount" ref={mountRef} aria-label="Interactive 3D chrome and electric-lime sculpture" role="img"/>;
}
