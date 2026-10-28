import { useEffect, useRef } from 'react';

const AVATAR_SRC = '/particle-avatar.webp';
const RESET_DELAY = 2000;

export default function ParticleHero() {
  const mountRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d', { alpha: true, desynchronized: true });
    if (!mount || !canvas || !ctx) return undefined;

    const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const sampler = document.createElement('canvas');
    const sampleCtx = sampler.getContext('2d', { willReadFrequently: true });
    const image = new Image();

    let width = 1;
    let height = 1;
    let dpr = 1;
    let particles = [];
    let animationFrame = 0;
    let resizeObserver;
    let intersectionObserver;
    let inView = true;
    let disposed = false;
    let ready = false;
    let lastTime = 0;
    let pulseUntil = 0;

    const pointer = { x: -1000, y: -1000, lastMove: -RESET_DELAY - 1, down: false };
    const random = (min, max) => min + Math.random() * (max - min);

    const canvasPoint = event => {
      const rect = canvas.getBoundingClientRect();
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    };

    const disturb = (x, y, strength = 1.2) => {
      const now = performance.now();
      pointer.x = x;
      pointer.y = y;
      pointer.lastMove = now;
      pulseUntil = now + 500;
      mount.dataset.state = 'disrupted';

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const dx = p.x - x;
        const dy = p.y - y;
        const distance = Math.hypot(dx, dy);
        const radius = coarsePointer ? 76 : 96;
        if (distance > radius) continue;
        const force = Math.pow(1 - distance / radius, 1.8) * strength;
        const safeDistance = Math.max(distance, 0.001);
        const direction = p.seed % 2 ? 1 : -1;
        p.vx += (dx / safeDistance) * force * random(2.5, 5.2) + (-dy / safeDistance) * force * 1.5 * direction;
        p.vy += (dy / safeDistance) * force * random(2.5, 5.2) + (dx / safeDistance) * force * 1.5 * direction;
      }
    };

    const sampleAvatar = () => {
      if (!sampleCtx || !image.naturalWidth || !image.naturalHeight) return;
      const sourceWidth = image.naturalWidth;
      const sourceHeight = image.naturalHeight;
      sampler.width = sourceWidth;
      sampler.height = sourceHeight;
      sampleCtx.clearRect(0, 0, sourceWidth, sourceHeight);
      sampleCtx.drawImage(image, 0, 0, sourceWidth, sourceHeight);

      let pixels;
      try {
        pixels = sampleCtx.getImageData(0, 0, sourceWidth, sourceHeight).data;
      } catch {
        mount.dataset.avatarFallback = 'true';
        return;
      }

      const stride = 1;
      const sampled = [];
      let seed = 1;
      for (let y = 1; y < sourceHeight; y += stride) {
        for (let x = 1; x < sourceWidth; x += stride) {
          const index = (y * sourceWidth + x) * 4;
          const alpha = pixels[index + 3] / 255;
          if (alpha < 0.22 || Math.random() > 0.96) continue;

          // Small, deliberate color quantization keeps the portrait feeling like a game avatar.
          const quantize = channel => Math.min(255, Math.round(channel / 24) * 24);
          const r = quantize(pixels[index]);
          const g = quantize(pixels[index + 1]);
          const b = quantize(pixels[index + 2]);
          const brightness = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 255;
          sampled.push({
            nx: x / sourceWidth,
            ny: y / sourceHeight,
            r, g, b,
            alpha: Math.min(1, alpha * 1.15),
            size: random(0.78, brightness > 0.78 ? 1.52 : 1.25),
            depth: random(-1, 1),
            seed: seed++,
            x: 0, y: 0, vx: 0, vy: 0,
          });
        }
      }
      particles = sampled;
      ready = true;
      mount.dataset.particleCount = String(particles.length);
    };

    const resize = () => {
      const rect = mount.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      dpr = Math.min(window.devicePixelRatio || 1, coarsePointer ? 1.35 : 1.8);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const onPointerMove = event => {
      const pos = canvasPoint(event);
      // Slightly soften continuous mouse motion; taps and firm movement trigger a brighter burst.
      pointer.x = pos.x;
      pointer.y = pos.y;
      pointer.lastMove = performance.now();
      if (event.pointerType === 'touch') disturb(pos.x, pos.y, 1.8);
    };

    const onPointerDown = event => {
      if (event.button !== undefined && event.button !== 0) return;
      const pos = canvasPoint(event);
      pointer.down = true;
      disturb(pos.x, pos.y, event.pointerType === 'touch' ? 2.25 : 1.9);
      try { canvas.setPointerCapture(event.pointerId); } catch {}
    };

    const onPointerUp = event => {
      pointer.down = false;
      pointer.lastMove = performance.now();
      try { canvas.releasePointerCapture(event.pointerId); } catch {}
    };

    const onPointerCancel = () => {
      pointer.down = false;
      pointer.lastMove = performance.now();
    };

    const onKeyDown = event => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      disturb(width * 0.5, height * 0.47, 2.1);
    };

    canvas.addEventListener('pointermove', onPointerMove, { passive: true });
    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointercancel', onPointerCancel);
    mount.addEventListener('keydown', onKeyDown);

    image.onerror = () => { mount.dataset.avatarFallback = 'true'; };

    resize();
    resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(mount);
    intersectionObserver = new IntersectionObserver(entries => {
      inView = entries[0]?.isIntersecting ?? true;
    }, { threshold: 0.02 });
    intersectionObserver.observe(mount);

    const render = now => {
      if (disposed) return;
      animationFrame = requestAnimationFrame(render);
      if (!inView || document.visibilityState === 'hidden') return;

      const elapsed = lastTime ? Math.min((now - lastTime) / 16.667, 2.5) : 1;
      lastTime = now;
      ctx.clearRect(0, 0, width, height);

      if (!ready || !particles.length) {
        const cx = width * 0.5;
        const cy = height * 0.48;
        for (let i = 0; i < 34; i++) {
          const angle = (i / 34) * Math.PI * 2 + now * 0.00012;
          const radius = 18 + (i % 7) * 5;
          ctx.fillStyle = 'rgba(109,129,150,.55)';
          ctx.beginPath();
          ctx.arc(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius, 1.4, 0, Math.PI * 2);
          ctx.fill();
        }
        return;
      }

      const scale = Math.min((width * 0.91) / image.naturalWidth, (height * 0.94) / image.naturalHeight);
      const drawWidth = image.naturalWidth * scale;
      const drawHeight = image.naturalHeight * scale;
      const left = (width - drawWidth) * 0.5;
      const top = (height - drawHeight) * 0.5 + 5;
      const idle = performance.now() - pointer.lastMove < RESET_DELAY;
      const age = performance.now();
      let disturbedCount = 0;

      if (!idle && mount.dataset.state !== 'formed') {
        mount.dataset.state = 'formed';
      }

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const depthShiftX = reducedMotion ? 0 : p.depth * pointer.x / Math.max(width, 1) * 4;
        const depthShiftY = reducedMotion ? 0 : p.depth * pointer.y / Math.max(height, 1) * 4;
        const targetX = left + p.nx * drawWidth + depthShiftX;
        const targetY = top + p.ny * drawHeight + depthShiftY;

        if (idle) {
          const dx = p.x - pointer.x;
          const dy = p.y - pointer.y;
          const distance = Math.hypot(dx, dy);
          const radius = coarsePointer ? 76 : 96;
          if (distance < radius) {
            const falloff = Math.pow(1 - distance / radius, 1.6);
            const safeDistance = Math.max(distance, 0.001);
            const twist = Math.sin(age * 0.003 + p.seed) * 0.6;
            p.vx += (dx / safeDistance * 2.2 + -dy / safeDistance * twist) * falloff * elapsed;
            p.vy += (dy / safeDistance * 2.2 + dx / safeDistance * twist) * falloff * elapsed;
          }
        }

        const spring = idle ? 0.012 : 0.085;
        p.vx += (targetX - p.x) * spring * elapsed;
        p.vy += (targetY - p.y) * spring * elapsed;
        p.vx *= Math.pow(idle ? 0.9 : 0.79, elapsed);
        p.vy *= Math.pow(idle ? 0.9 : 0.79, elapsed);
        p.x += p.vx * elapsed;
        p.y += p.vy * elapsed;
        p.vx = Math.max(-24, Math.min(24, p.vx));
        p.vy = Math.max(-24, Math.min(24, p.vy));

        if (!idle) {
          const displacement = Math.hypot(p.x - targetX, p.y - targetY);
          if (displacement > 2.5) disturbedCount++;
        }

        const shimmer = reducedMotion ? 0 : Math.sin(now * 0.0018 + p.seed * 0.27) * 0.08;
        const glow = age < pulseUntil ? (pulseUntil - age) / 500 : 0;
        const brightness = 1 + shimmer + glow * 0.35;
        const radius = Math.max(0.55, p.size * (0.84 + Math.abs(p.depth) * 0.25) * (1 + glow * 0.16));
        const alpha = Math.max(0.15, Math.min(1, p.alpha * (0.76 + glow * 0.24)));

        ctx.fillStyle = `rgba(${Math.min(255, p.r * brightness)},${Math.min(255, p.g * brightness)},${Math.min(255, p.b * brightness)},${alpha})`;
        if (p.seed % 7 === 0) {
          ctx.fillRect(p.x - radius * 0.5, p.y - radius * 0.5, radius * 1.35, radius * 1.35);
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      mount.dataset.disturbed = String(disturbedCount);
    };

    // Start particles at their actual targets once the source image has been sampled.
    const initPositions = () => {
      if (!ready) return;
      const scale = Math.min((width * 0.91) / image.naturalWidth, (height * 0.94) / image.naturalHeight);
      const left = (width - image.naturalWidth * scale) * 0.5;
      const top = (height - image.naturalHeight * scale) * 0.5 + 5;
      for (const p of particles) {
        p.x = left + p.nx * image.naturalWidth * scale;
        p.y = top + p.ny * image.naturalHeight * scale;
      }
    };
    image.addEventListener('load', () => { sampleAvatar(); initPositions(); }, { once: true });
    image.src = AVATAR_SRC;

    render(0);

    return () => {
      disposed = true;
      cancelAnimationFrame(animationFrame);
      resizeObserver?.disconnect();
      intersectionObserver?.disconnect();
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointercancel', onPointerCancel);
      mount.removeEventListener('keydown', onKeyDown);
      sampler.width = 1;
      sampler.height = 1;
      image.onload = null;
      image.onerror = null;
    };
  }, []);

  return (
    <div
      className="particle-avatar-mount"
      ref={mountRef}
      role="button"
      tabIndex={0}
      aria-label="Interactive game-style particle avatar. Move your cursor or touch the portrait to scatter the dots; they reform after two seconds. Press Enter or Space to trigger a burst."
    >
      <canvas className="particle-avatar-canvas" ref={canvasRef} aria-hidden="true" />
      <div className="particle-avatar-hud" aria-hidden="true">
        <span className="particle-avatar-status"><i /> POINT CLOUD / AVATAR 01</span>
        <span>MOVE TO SCATTER <b>·</b> REFORM IN 2 SEC</span>
      </div>
      <div className="particle-avatar-reticle" aria-hidden="true"><i /><i /><i /><i /></div>
    </div>
  );
}
