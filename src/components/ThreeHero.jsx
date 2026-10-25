import { useEffect, useRef } from 'react';
import * as THREE from 'three';

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function makeTextTargets(count) {
  const canvas = document.createElement('canvas');
  canvas.width = 720;
  canvas.height = 300;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new Float32Array(count * 2);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '700 170px "Space Grotesk", Arial, sans-serif';
  ctx.fillText('VIRESH', canvas.width / 2, canvas.height / 2, 670);

  const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  const samples = [];
  for (let y = 0; y < canvas.height; y += 2) {
    for (let x = 0; x < canvas.width; x += 2) {
      if (pixels[(y * canvas.width + x) * 4 + 3] > 100) samples.push([x, y]);
    }
  }

  const targets = new Float32Array(count * 2);
  for (let i = 0; i < count; i++) {
    const sample = samples[Math.floor(Math.random() * samples.length)] || [360, 150];
    targets[i * 2] = (sample[0] / canvas.width - 0.5) * 5.55;
    targets[i * 2 + 1] = (0.5 - sample[1] / canvas.height) * 2.15;
  }
  return targets;
}

export default function ThreeHero() {
  const mountRef = useRef(null);
  const waveActionRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    let renderer;
    let animationFrame = 0;
    let observer;
    let disposed = false;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(39, 1, 0.1, 80);
    camera.position.set(0, 0, 8.7);
    camera.lookAt(0, 0, 0);

    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
    } catch {
      mount.dataset.webglFallback = 'true';
      return undefined;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.className = 'hero-webgl-canvas';
    renderer.domElement.setAttribute('aria-hidden', 'true');
    renderer.domElement.setAttribute('role', 'presentation');
    mount.appendChild(renderer.domElement);

    const smallScreen = window.matchMedia('(max-width: 650px)').matches;
    const columns = smallScreen ? 58 : 82;
    const rows = smallScreen ? 38 : 54;
    const count = columns * rows;
    const base = new Float32Array(count * 3);
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const textTargets = makeTextTargets(count);

    const ink = new THREE.Color(0x4a4a4a);
    const slate = new THREE.Color(0x6d8196);
    const dust = new THREE.Color(0xcbcbcb);

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        const i = row * columns + col;
        const offset = i * 3;
        const x = (col / (columns - 1) - 0.5) * 6.2;
        const y = (0.5 - row / (rows - 1)) * 4.25;
        const z =
          Math.sin(x * 1.5 + y * 0.8) * 0.19 +
          Math.cos(y * 2.2 - x * 0.45) * 0.15 +
          Math.sin(x * 0.7 + y * 1.7) * 0.1;

        base[offset] = x;
        base[offset + 1] = y;
        base[offset + 2] = z;
        positions[offset] = x;
        positions[offset + 1] = y;
        positions[offset + 2] = z;

        const pick = Math.random();
        const color = pick > 0.79 ? slate : pick > 0.68 ? dust : ink;
        colors[offset] = color.r;
        colors[offset + 1] = color.g;
        colors[offset + 2] = color.b;
      }
    }

    const particleGeometry = new THREE.BufferGeometry();
    const pointPositions = new THREE.BufferAttribute(positions, 3);
    pointPositions.setUsage(THREE.DynamicDrawUsage);
    particleGeometry.setAttribute('position', pointPositions);
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const points = new THREE.Points(
      particleGeometry,
      new THREE.PointsMaterial({
        size: 0.036,
        vertexColors: true,
        transparent: true,
        opacity: 0.88,
        sizeAttenuation: true,
        depthWrite: false,
      }),
    );
    scene.add(points);

    // A sparse, animated wire trace makes the particles read as a sculpted surface.
    const edges = [];
    for (let row = 0; row < rows; row += 3) {
      for (let col = 0; col < columns - 1; col++) {
        edges.push(row * columns + col, row * columns + col + 1);
      }
    }
    for (let col = 0; col < columns; col += 5) {
      for (let row = 0; row < rows - 1; row++) {
        edges.push(row * columns + col, (row + 1) * columns + col);
      }
    }

    const linePositions = new Float32Array((edges.length / 2) * 6);
    const lineGeometry = new THREE.BufferGeometry();
    const lineAttribute = new THREE.BufferAttribute(linePositions, 3);
    lineAttribute.setUsage(THREE.DynamicDrawUsage);
    lineGeometry.setAttribute('position', lineAttribute);
    const traces = new THREE.LineSegments(
      lineGeometry,
      new THREE.LineBasicMaterial({
        color: 0x6d8196,
        transparent: true,
        opacity: 0.19,
        depthWrite: false,
      }),
    );
    scene.add(traces);

    const raycaster = new THREE.Raycaster();
    const interactionPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const pointerNdc = new THREE.Vector2();
    const pointerHit = new THREE.Vector3();
    const pointer = { x: 0, y: 0, tx: 0, ty: 0, inside: false, dragging: false };
    const ripples = [];
    let pointerDown = null;
    let morph = 0;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const clock = new THREE.Clock();

    const addRipple = (x, y) => {
      ripples.push({ x, y, start: clock.getElapsedTime() });
      if (ripples.length > 4) ripples.shift();
    };
    waveActionRef.current = () => addRipple(0, 0);

    const updatePointerWorld = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointerNdc.x = ((event.clientX - rect.left) / Math.max(rect.width, 1)) * 2 - 1;
      pointerNdc.y = -(((event.clientY - rect.top) / Math.max(rect.height, 1)) * 2 - 1);
      raycaster.setFromCamera(pointerNdc, camera);
      if (raycaster.ray.intersectPlane(interactionPlane, pointerHit)) {
        pointer.tx = pointerHit.x;
        pointer.ty = pointerHit.y;
        pointer.inside = true;
      }
    };

    const onPointerMove = (event) => updatePointerWorld(event);
    const onPointerLeave = () => {
      if (!pointer.dragging) pointer.inside = false;
    };
    const onPointerDown = (event) => {
      if (event.button !== 0 && event.pointerType === 'mouse') return;
      pointer.dragging = true;
      pointerDown = { x: event.clientX, y: event.clientY };
      updatePointerWorld(event);
      try {
        renderer.domElement.setPointerCapture(event.pointerId);
      } catch {
        // Pointer capture is optional on older mobile browsers.
      }
    };
    const onPointerUp = (event) => {
      if (!pointerDown) {
        pointer.dragging = false;
        return;
      }
      const distance = Math.hypot(event.clientX - pointerDown.x, event.clientY - pointerDown.y);
      if (distance < 9) addRipple(pointer.tx, pointer.ty);
      pointerDown = null;
      pointer.dragging = false;
    };
    const onPointerCancel = () => {
      pointerDown = null;
      pointer.dragging = false;
    };

    renderer.domElement.addEventListener('pointermove', onPointerMove, { passive: true });
    renderer.domElement.addEventListener('pointerleave', onPointerLeave, { passive: true });
    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointerup', onPointerUp);
    renderer.domElement.addEventListener('pointercancel', onPointerCancel);

    const hero = mount.closest('.hero');
    const resize = () => {
      const width = Math.max(1, mount.clientWidth);
      const height = Math.max(1, mount.clientHeight);
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
      if (document.visibilityState === 'hidden') return;

      const time = clock.getElapsedTime();
      pointer.x += (pointer.tx - pointer.x) * 0.085;
      pointer.y += (pointer.ty - pointer.y) * 0.085;

      let targetMorph = 0;
      if (hero) {
        const bottom = hero.getBoundingClientRect().bottom;
        targetMorph = clamp(
          (window.innerHeight * 0.93 - bottom) / (window.innerHeight * 0.72),
          0,
          1,
        );
      }
      morph += (targetMorph - morph) * (reducedMotion ? 1 : 0.045);

      for (let i = ripples.length - 1; i >= 0; i--) {
        if (time - ripples[i].start > 3.1) ripples.splice(i, 1);
      }

      for (let i = 0; i < count; i++) {
        const offset = i * 3;
        const baseX = base[offset];
        const baseY = base[offset + 1];
        const baseZ = base[offset + 2];
        const textX = textTargets[i * 2];
        const textY = textTargets[i * 2 + 1];
        const x0 = baseX + (textX - baseX) * morph;
        const y0 = baseY + (textY - baseY) * morph;

        const flow = reducedMotion
          ? 0
          : (Math.sin(baseX * 1.2 + time * 0.62) * 0.12 +
            Math.cos(baseY * 1.8 - time * 0.48) * 0.1 +
            Math.sin((baseX + baseY) * 1.25 + time * 0.23) * 0.055) * (1 - morph);

        let x = x0;
        let y = y0;
        let z = baseZ * (1 - morph) + flow + Math.sin(baseX * 3 + baseY * 4) * morph * 0.035;

        if (pointer.inside) {
          const dx = x0 - pointer.x;
          const dy = y0 - pointer.y;
          const distance = Math.max(0.001, Math.hypot(dx, dy));
          const radius = pointer.dragging ? 1.75 : 1.28;
          const influence = Math.max(0, 1 - distance / radius);
          const push = influence * influence;
          const pushScale = pointer.dragging ? 0.48 : 0.19;
          x += (dx / distance) * push * pushScale;
          y += (dy / distance) * push * pushScale;
          z += push * (pointer.dragging ? 0.39 : 0.22);
        }

        for (let r = 0; r < ripples.length; r++) {
          const ripple = ripples[r];
          const age = time - ripple.start;
          const distance = Math.hypot(x0 - ripple.x, y0 - ripple.y);
          const front = age * 2.35;
          const delta = distance - front;
          const envelope = Math.exp(-Math.abs(delta) * 2.15) * Math.exp(-age * 0.95);
          z += Math.sin(delta * 7.2) * envelope * 0.31;
        }

        positions[offset] = x;
        positions[offset + 1] = y;
        positions[offset + 2] = z;
      }
      pointPositions.needsUpdate = true;

      let cursor = 0;
      for (let i = 0; i < edges.length; i += 2) {
        const a = edges[i] * 3;
        const b = edges[i + 1] * 3;
        linePositions[cursor++] = positions[a];
        linePositions[cursor++] = positions[a + 1];
        linePositions[cursor++] = positions[a + 2];
        linePositions[cursor++] = positions[b];
        linePositions[cursor++] = positions[b + 1];
        linePositions[cursor++] = positions[b + 2];
      }
      lineAttribute.needsUpdate = true;
      renderer.render(scene, camera);
    };
    render();

    return () => {
      disposed = true;
      waveActionRef.current = null;
      cancelAnimationFrame(animationFrame);
      observer?.disconnect();
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      renderer.domElement.removeEventListener('pointerleave', onPointerLeave);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
      renderer.domElement.removeEventListener('pointercancel', onPointerCancel);
      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          (Array.isArray(object.material) ? object.material : [object.material]).forEach((material) => material.dispose());
        }
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <div
      className="hero-webgl-mount particle-field"
      ref={mountRef}
      role="group"
      aria-label="Interactive particle field. Move your pointer to repel particles, click or tap to create a wave, and drag to sculpt the field. Scrolling gradually forms the name Viresh."
    >
      <span className="particle-instructions" aria-hidden="true">MOVE TO DISTORT · DRAG TO SCULPT</span>
      <button
        className="particle-wave-control"
        type="button"
        onClick={() => waveActionRef.current?.()}
        aria-label="Create a wave in the particle field"
      >
        CREATE A WAVE <span aria-hidden="true">↗</span>
      </button>
    </div>
  );
}
