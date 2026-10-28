import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

export default function ThreeHero() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    let renderer, animationFrame = 0, observer, intersectionObserver, disposed = false;
    let environmentTarget, pmrem, room;
    let inView = true;
    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    camera.position.set(0, 0, 7.4);

    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
        stencil: false,
        depth: true,
      });
    } catch {
      mount.dataset.webglFallback = 'true';
      return undefined;
    }

    const isCoarse = window.matchMedia('(pointer: coarse)').matches;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isCoarse ? 1.35 : 1.8));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;
    renderer.domElement.className = 'hero-webgl-canvas';
    renderer.domElement.setAttribute('aria-hidden', 'true');
    mount.appendChild(renderer.domElement);

    pmrem = new THREE.PMREMGenerator(renderer);
    pmrem.compileEquirectangularShader();
    room = new RoomEnvironment();
    environmentTarget = pmrem.fromScene(room, 0.04);
    scene.environment = environmentTarget.texture;
    room.dispose();

    scene.add(new THREE.AmbientLight(0xffffe3, 1.25));

    const key = new THREE.DirectionalLight(0xffffe3, 3.5);
    key.position.set(4.5, 5.4, 6);
    scene.add(key);

    const rimBlue = new THREE.PointLight(0x6d8196, 26, 16, 2);
    rimBlue.position.set(-3.2, 1.2, 2.2);
    scene.add(rimBlue);

    const rimSilver = new THREE.PointLight(0xcbcbcb, 20, 14, 2);
    rimSilver.position.set(2.7, -2.3, -2);
    scene.add(rimSilver);

    const pointerLight = new THREE.PointLight(0x9eb5c9, 0, 7, 2);
    scene.add(pointerLight);

    const sculpture = new THREE.Group();
    sculpture.rotation.set(-0.18, 0.2, -0.1);
    scene.add(sculpture);

    const coreMat = new THREE.MeshPhysicalMaterial({
      color: 0x272d35,
      metalness: 0.96,
      roughness: 0.16,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
      emissive: 0x18232e,
      emissiveIntensity: 0.5,
    });
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.7, 72, 72), coreMat);
    sculpture.add(core);

    const innerMat = new THREE.MeshPhysicalMaterial({
      color: 0x9eb5c9,
      metalness: 0.82,
      roughness: 0.19,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
      emissive: 0x2b4359,
      emissiveIntensity: 0.58,
    });
    const innerCore = new THREE.Mesh(new THREE.SphereGeometry(0.34, 48, 48), innerMat);
    innerCore.scale.set(1, 1, 0.82);
    sculpture.add(innerCore);

    const blueMat = new THREE.MeshPhysicalMaterial({
      color: 0x6d8196,
      metalness: 0.78,
      roughness: 0.17,
      clearcoat: 1,
      clearcoatRoughness: 0.07,
      emissive: 0x263b4f,
      emissiveIntensity: 0.48,
    });
    const knot = new THREE.Mesh(
      new THREE.TorusKnotGeometry(0.66, 0.13, 280, 24, 2, 5),
      blueMat,
    );
    knot.rotation.set(0.48, 0.16, 0.4);
    sculpture.add(knot);

    const chromeMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffe3,
      metalness: 0.98,
      roughness: 0.14,
      clearcoat: 1,
      clearcoatRoughness: 0.06,
    });
    const orbitA = new THREE.Mesh(new THREE.TorusGeometry(1.22, 0.023, 16, 240), chromeMat);
    orbitA.rotation.set(1.02, 0.45, 0.28);
    sculpture.add(orbitA);

    const orbitB = new THREE.Mesh(new THREE.TorusGeometry(1.51, 0.014, 12, 240), blueMat);
    orbitB.rotation.set(0.32, 1.08, 0.68);
    sculpture.add(orbitB);

    const orbitC = new THREE.Mesh(new THREE.TorusGeometry(1.04, 0.012, 12, 200), chromeMat);
    orbitC.rotation.set(1.25, 0.15, 1.04);
    sculpture.add(orbitC);

    const orbitD = new THREE.Mesh(
      new THREE.TorusGeometry(1.75, 0.008, 8, 220, Math.PI * 1.28),
      new THREE.MeshBasicMaterial({ color: 0x6d8196, transparent: true, opacity: 0.76 }),
    );
    orbitD.rotation.set(0.75, 0.1, -0.48);
    sculpture.add(orbitD);

    const wire = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.72, 2),
      new THREE.MeshBasicMaterial({
        color: 0xcbcbcb,
        wireframe: true,
        transparent: true,
        opacity: 0.12,
      }),
    );
    sculpture.add(wire);

    const satellites = [];
    const satelliteGeometry = new THREE.SphereGeometry(0.047, 20, 20);
    const satelliteMats = [
      new THREE.MeshPhysicalMaterial({ color: 0xffffe3, metalness: 0.96, roughness: 0.13 }),
      new THREE.MeshPhysicalMaterial({ color: 0x6d8196, metalness: 0.8, roughness: 0.2, emissive: 0x263b4f, emissiveIntensity: 0.35 }),
    ];
    for (let i = 0; i < 7; i++) {
      const satellite = new THREE.Mesh(satelliteGeometry, satelliteMats[i % satelliteMats.length]);
      satellites.push({
        mesh: satellite,
        angle: (i / 7) * Math.PI * 2,
        radius: 1.38 + (i % 3) * 0.13,
        tilt: 0.42 + (i % 4) * 0.24,
        speed: (i % 2 ? -1 : 1) * (0.18 + (i % 3) * 0.035),
      });
      sculpture.add(satellite);
    }

    const particleCount = isCoarse ? 720 : 1450;
    const basePositions = new Float32Array(particleCount * 3);
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const directions = new Float32Array(particleCount * 3);
    const colorBlue = new THREE.Color(0x6d8196);
    const colorSilver = new THREE.Color(0xcbcbcb);
    const colorInk = new THREE.Color(0x4a4a4a);

    for (let i = 0; i < particleCount; i++) {
      const radius = 1.88 + Math.pow(Math.random(), 0.8) * 2.2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const x = Math.sin(phi) * Math.cos(theta);
      const y = Math.sin(phi) * Math.sin(theta);
      const z = Math.cos(phi);
      const j = i * 3;
      basePositions[j] = positions[j] = radius * x;
      basePositions[j + 1] = positions[j + 1] = radius * y;
      basePositions[j + 2] = positions[j + 2] = radius * z;
      directions[j] = x;
      directions[j + 1] = y;
      directions[j + 2] = z;

      const color = Math.random() > 0.82 ? colorBlue : Math.random() > 0.43 ? colorSilver : colorInk;
      colors[j] = color.r;
      colors[j + 1] = color.g;
      colors[j + 2] = color.b;
    }

    const particleGeometry = new THREE.BufferGeometry();
    const positionAttribute = new THREE.BufferAttribute(positions, 3);
    positionAttribute.setUsage(THREE.DynamicDrawUsage);
    particleGeometry.setAttribute('position', positionAttribute);
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particles = new THREE.Points(
      particleGeometry,
      new THREE.PointsMaterial({
        size: isCoarse ? 0.021 : 0.019,
        vertexColors: true,
        transparent: true,
        opacity: 0.88,
        sizeAttenuation: true,
        depthWrite: false,
      }),
    );
    scene.add(particles);

    const halo = new THREE.Mesh(
      new THREE.RingGeometry(1.98, 2.005, 200),
      new THREE.MeshBasicMaterial({
        color: 0x6d8196,
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    );
    halo.position.z = -1.15;
    scene.add(halo);

    const pulseRings = [];
    for (let i = 0; i < 3; i++) {
      const ringMat = new THREE.MeshBasicMaterial({
        color: i === 1 ? 0xffffe3 : 0x6d8196,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const ring = new THREE.Mesh(new THREE.RingGeometry(0.985, 1.015, 160), ringMat);
      ring.position.z = 0.25 - i * 0.015;
      ring.visible = false;
      scene.add(ring);
      pulseRings.push({ mesh: ring, material: ringMat, delay: i * 0.13 });
    }

    const raycaster = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const pointerPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0.3);
    const pointerHit = new THREE.Vector3();
    const pointer = { x: 0, y: 0, tx: 0, ty: 0, worldX: 0, worldY: 0 };
    const dragRotation = { x: 0, y: 0 };
    let dragging = false;
    let dragStart = { x: 0, y: 0, lastX: 0, lastY: 0, moved: false };
    let lastPulse = -100;
    let pulseCount = 0;
    const clock = new THREE.Clock();

    const triggerPulse = () => {
      lastPulse = clock.getElapsedTime();
      pulseCount += 1;
      mount.dataset.pulse = String(pulseCount);
    };

    const updateNdc = event => {
      const rect = mount.getBoundingClientRect();
      const x = (event.clientX - rect.left) / Math.max(rect.width, 1);
      const y = (event.clientY - rect.top) / Math.max(rect.height, 1);
      ndc.set(x * 2 - 1, 1 - y * 2);
      pointer.tx = ndc.x;
      pointer.ty = ndc.y;
    };

    const onMove = event => {
      updateNdc(event);
      if (dragging) {
        const dx = event.clientX - dragStart.lastX;
        const dy = event.clientY - dragStart.lastY;
        if (Math.abs(event.clientX - dragStart.x) + Math.abs(event.clientY - dragStart.y) > 7) {
          dragStart.moved = true;
        }
        if (dragStart.moved) {
          dragRotation.y += dx * 0.008;
          dragRotation.x += dy * 0.006;
          dragRotation.x = THREE.MathUtils.clamp(dragRotation.x, -1.25, 1.25);
        }
        dragStart.lastX = event.clientX;
        dragStart.lastY = event.clientY;
      }
    };

    const onPointerDown = event => {
      if (event.button !== undefined && event.button !== 0) return;
      dragging = true;
      dragStart = {
        x: event.clientX,
        y: event.clientY,
        lastX: event.clientX,
        lastY: event.clientY,
        moved: false,
      };
      mount.classList.add('is-dragging');
      try { mount.setPointerCapture(event.pointerId); } catch {}
    };

    const onPointerUp = event => {
      if (!dragging) return;
      dragging = false;
      mount.classList.remove('is-dragging');
      try { mount.releasePointerCapture(event.pointerId); } catch {}
      if (!dragStart.moved) triggerPulse();
    };

    const onPointerCancel = () => {
      dragging = false;
      mount.classList.remove('is-dragging');
    };

    const onLeave = () => {
      if (!dragging) {
        pointer.tx = 0;
        pointer.ty = 0;
      }
    };

    const onKeyDown = event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        triggerPulse();
      }
      if (event.key === 'ArrowLeft') dragRotation.y -= 0.16;
      if (event.key === 'ArrowRight') dragRotation.y += 0.16;
      if (event.key === 'ArrowUp') dragRotation.x = THREE.MathUtils.clamp(dragRotation.x - 0.12, -1.25, 1.25);
      if (event.key === 'ArrowDown') dragRotation.x = THREE.MathUtils.clamp(dragRotation.x + 0.12, -1.25, 1.25);
    };

    mount.addEventListener('pointermove', onMove, { passive: true });
    mount.addEventListener('pointerdown', onPointerDown);
    mount.addEventListener('pointerup', onPointerUp);
    mount.addEventListener('pointercancel', onPointerCancel);
    mount.addEventListener('pointerleave', onLeave);
    mount.addEventListener('keydown', onKeyDown);

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
      if (document.visibilityState === 'hidden' || !inView) {
        animationFrame = requestAnimationFrame(render);
        return;
      }

      animationFrame = requestAnimationFrame(render);
      const t = clock.getElapsedTime();
      const idle = reducedMotion ? 0 : 1;
      pointer.x += (pointer.tx - pointer.x) * 0.045;
      pointer.y += (pointer.ty - pointer.y) * 0.045;

      raycaster.setFromCamera(ndc, camera);
      raycaster.ray.intersectPlane(pointerPlane, pointerHit);
      pointer.worldX += (pointerHit.x - pointer.worldX) * 0.08;
      pointer.worldY += (pointerHit.y - pointer.worldY) * 0.08;
      pointerLight.position.set(pointer.worldX, pointer.worldY, 1.1);
      pointerLight.intensity = THREE.MathUtils.lerp(pointerLight.intensity, 5 + Math.min(Math.abs(pointer.x) + Math.abs(pointer.y), 1) * 6, 0.05);

      sculpture.rotation.y = 0.2 + t * 0.105 * idle + pointer.x * 0.18 + dragRotation.y;
      sculpture.rotation.x = -0.18 + Math.sin(t * 0.24) * 0.07 * idle - pointer.y * 0.13 + dragRotation.x;
      sculpture.rotation.z = -0.1 + Math.sin(t * 0.17) * 0.045 * idle;
      sculpture.position.x += (pointer.x * 0.12 - sculpture.position.x) * 0.035;
      sculpture.position.y += (-pointer.y * 0.08 + (reducedMotion ? 0 : Math.sin(t * 0.75) * 0.07) - sculpture.position.y) * 0.04;

      knot.rotation.x = 0.48 + t * 0.16 * idle;
      knot.rotation.y = 0.16 + t * 0.13 * idle;
      orbitA.rotation.z = 0.28 + t * 0.09 * idle;
      orbitB.rotation.x = 0.32 - t * 0.12 * idle;
      orbitC.rotation.y = 0.15 + t * 0.11 * idle;
      orbitD.rotation.z = -0.48 - t * 0.13 * idle;
      wire.rotation.set(t * 0.035 * idle, -t * 0.05 * idle, t * 0.025 * idle);
      particles.rotation.y = t * 0.014 * idle;
      particles.rotation.x = Math.sin(t * 0.11) * 0.025 * idle;
      halo.rotation.z = t * -0.035 * idle;

      satellites.forEach(({ mesh, angle, radius, tilt, speed }, i) => {
        const a = angle + t * speed * idle + dragRotation.y * 0.18;
        mesh.position.set(
          Math.cos(a) * radius,
          Math.sin(a * 1.06) * radius * Math.sin(tilt),
          Math.sin(a) * radius * Math.cos(tilt),
        );
        mesh.scale.setScalar(1 + Math.sin(t * 1.5 + i) * 0.12 * idle);
      });

      const pulseAge = t - lastPulse;
      const pulseStrength = pulseAge >= 0 && pulseAge < 1.2 ? 1 - pulseAge / 1.2 : 0;
      const pulseEnvelope = pulseStrength * pulseStrength;
      core.scale.setScalar(1 + (reducedMotion ? 0 : Math.sin(t * 1.2) * 0.012) + pulseEnvelope * 0.15);
      innerCore.scale.set(1 + pulseEnvelope * 0.22, 1 + pulseEnvelope * 0.22, 0.82 + pulseEnvelope * 0.15);
      knot.scale.setScalar(1 + pulseEnvelope * 0.09);
      rimBlue.intensity = 26 + pulseEnvelope * 24;
      rimSilver.intensity = 20 + pulseEnvelope * 14;

      for (let i = 0; i < particleCount; i++) {
        const j = i * 3;
        const bx = basePositions[j];
        const by = basePositions[j + 1];
        const bz = basePositions[j + 2];
        const dx = bx - pointer.worldX;
        const dy = by - pointer.worldY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const influence = Math.max(0, 1 - distance / 1.45);
        const push = influence * influence * 0.42;
        const drift = reducedMotion ? 0 : Math.sin(t * 0.65 + i * 0.013) * 0.018;
        const burst = pulseEnvelope * (0.45 + (i % 11) * 0.015);
        positions[j] = bx + directions[j] * burst + (distance > 0.001 ? dx / distance * push : 0);
        positions[j + 1] = by + directions[j + 1] * burst + (distance > 0.001 ? dy / distance * push : 0) + drift;
        positions[j + 2] = bz + directions[j + 2] * burst;
      }
      positionAttribute.needsUpdate = true;

      pulseRings.forEach(({ mesh, material, delay }) => {
        const age = pulseAge - delay;
        if (age < 0 || age > 1.12) {
          mesh.visible = false;
          return;
        }
        mesh.visible = true;
        const p = age / 1.12;
        const scale = 0.15 + p * 2.8;
        mesh.scale.setScalar(scale);
        material.opacity = (1 - p) * 0.8;
      });

      const bounds = mount.getBoundingClientRect();
      const fit = Math.min(bounds.width / 560, 1.12);
      sculpture.scale.setScalar(Math.max(0.76, fit));
      renderer.render(scene, camera);
    };

    intersectionObserver = new IntersectionObserver(entries => {
      inView = entries[0]?.isIntersecting ?? true;
    }, { threshold: 0.02 });
    intersectionObserver.observe(mount);
    render();

    return () => {
      disposed = true;
      cancelAnimationFrame(animationFrame);
      observer?.disconnect();
      intersectionObserver?.disconnect();
      mount.removeEventListener('pointermove', onMove);
      mount.removeEventListener('pointerdown', onPointerDown);
      mount.removeEventListener('pointerup', onPointerUp);
      mount.removeEventListener('pointercancel', onPointerCancel);
      mount.removeEventListener('pointerleave', onLeave);
      mount.removeEventListener('keydown', onKeyDown);
      mount.classList.remove('is-dragging');
      scene.traverse(object => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          (Array.isArray(object.material) ? object.material : [object.material]).forEach(material => material.dispose());
        }
      });
      satelliteGeometry.dispose();
      satelliteMats.forEach(material => material.dispose());
      environmentTarget?.dispose();
      pmrem?.dispose();
      renderer?.dispose();
      renderer?.domElement.remove();
    };
  }, []);

  return (
    <div
      className="hero-webgl-mount"
      ref={mountRef}
      aria-label="Interactive 3D sculpture. Drag to rotate; click, tap, or press Enter to trigger a pulse. Use arrow keys to rotate."
      role="button"
      tabIndex={0}
    >
      <div className="hero-3d-hud" aria-hidden="true">
        <span className="hero-3d-hud-label"><i /> INTERACTIVE OBJECT / 001</span>
        <span className="hero-3d-hud-instruction">DRAG TO ORBIT <b>·</b> TAP TO PULSE</span>
      </div>
      <div className="hero-3d-crosshair" aria-hidden="true"><i /><i /></div>
    </div>
  );
}
