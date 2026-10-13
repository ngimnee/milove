/* --------------------------------------------------------------------------
   FIREWORKS & HEART CONFETTI CELEBRATION ENGINE
   -------------------------------------------------------------------------- */

const FireworksEngine = (function() {
  'use strict';

  const MAX_SPARKS = 700;
  const MAX_HEARTS = 120;
  const SPARK_SPRITE = 32;
  const HEART_SPRITE = 96; // 64px heart + 16px glow padding each side

  let canvas, ctx;
  let width, height;
  let particles = [];   // Firework spark particles
  let heartBursts = []; // Heart shape particles
  let animationFrameId = null;
  let lastFrameTime = 0;
  let frameMs = 16.7;   // smoothed frame time, drives adaptive quality
  let lastLaunch = 0;

  // Pre-rendered glow sprites per color (avoids per-particle shadowBlur, the main cost)
  const sparkSprites = new Map();
  const heartSprites = new Map();

  function init() {
    canvas = document.getElementById('fireworks-canvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    resize();
    window.addEventListener('resize', resize);
  }

  function resize() {
    if (!canvas) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    // Resetting canvas size clears and reallocates it, so skip when unchanged
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    width = w;
    height = h;
  }

  function getSparkSprite(color) {
    let sprite = sparkSprites.get(color);
    if (sprite) return sprite;
    sprite = document.createElement('canvas');
    sprite.width = sprite.height = SPARK_SPRITE;
    const c = sprite.getContext('2d');
    const r = SPARK_SPRITE / 2;
    const g = c.createRadialGradient(r, r, 0, r, r, r);
    g.addColorStop(0, color);
    g.addColorStop(0.35, color);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = g;
    c.fillRect(0, 0, SPARK_SPRITE, SPARK_SPRITE);
    sparkSprites.set(color, sprite);
    return sprite;
  }

  function getHeartSprite(color) {
    let sprite = heartSprites.get(color);
    if (sprite) return sprite;
    sprite = document.createElement('canvas');
    sprite.width = sprite.height = HEART_SPRITE;
    const c = sprite.getContext('2d');
    const size = 64;
    const cx = HEART_SPRITE / 2;
    const cy = (HEART_SPRITE - size) / 2;
    c.fillStyle = color;
    c.shadowBlur = 18;
    c.shadowColor = color;
    c.beginPath();
    c.moveTo(cx, cy + size * 0.3);
    c.bezierCurveTo(cx, cy, cx - size * 0.5, cy, cx - size * 0.5, cy + size * 0.3);
    c.bezierCurveTo(cx - size * 0.5, cy + size * 0.65, cx, cy + size * 0.9, cx, cy + size);
    c.bezierCurveTo(cx, cy + size * 0.9, cx + size * 0.5, cy + size * 0.65, cx + size * 0.5, cy + size * 0.3);
    c.bezierCurveTo(cx + size * 0.5, cy, cx, cy, cx, cy + size * 0.3);
    c.closePath();
    c.fill();
    heartSprites.set(color, sprite);
    return sprite;
  }

  // How many particles to actually spawn: shrinks when the pool is nearly full or frames are slow
  function budget(wanted, current, max) {
    const room = Math.max(12, max - current);
    const quality = frameMs > 28 ? 0.45 : frameMs > 20 ? 0.7 : 1;
    return Math.max(8, Math.min(Math.round(wanted * quality), room));
  }

  // Trigger Grand Fireworks + Heart Explosion Sequence
  function launchSequence() {
    // Re-sync canvas dimensions before launching
    resize();

    const now = performance.now();
    const repeated = now - lastLaunch < 3500; // spammed: lighten the extras
    lastLaunch = now;

    AudioEngine.playSound('fireworks');

    // Trigger Canvas Confetti Heart Shower if confetti library available
    if (typeof confetti !== 'undefined') {
      confetti({
        particleCount: repeated ? 50 : 140,
        spread: 120,
        origin: { y: 0.6 },
        colors: ['#ff69b4', '#ff2a70', '#9b51e0', '#00f2fe', '#ffd700']
      });
      if (!repeated) {
        setTimeout(() => {
          confetti({ particleCount: 70, angle: 60,  spread: 80, origin: { x: 0, y: 0.65 }, colors: ['#ff69b4', '#ff2a70', '#ffd1dc'] });
          confetti({ particleCount: 70, angle: 120, spread: 80, origin: { x: 1, y: 0.65 }, colors: ['#9b51e0', '#00f2fe', '#ff69b4'] });
        }, 500);
        setTimeout(() => {
          confetti({ particleCount: 90, spread: 140, origin: { y: 0.5 }, colors: ['#ff69b4', '#ffd700', '#ffffff'] });
        }, 1100);
      }
    }

    // Launch canvas firework bursts across screen
    // NOTE: createBurst/createHeartBurst each call ensureAnimating() internally
    const burstCount = repeated ? 4 : 9;
    for (let i = 0; i < burstCount; i++) {
      setTimeout(() => {
        const x = Math.random() * (width * 0.8) + width * 0.1;
        const y = Math.random() * (height * 0.55) + height * 0.05;
        createBurst(x, y);
      }, i * 260);
    }

    // Launch heart explosions at 4 positions
    const heartOrigins = [
      { x: width / 2,    y: height / 2    },
      { x: width * 0.25, y: height * 0.4  },
      { x: width * 0.75, y: height * 0.4  },
      { x: width * 0.5,  y: height * 0.25 },
    ].slice(0, repeated ? 2 : 4);
    heartOrigins.forEach((origin, idx) => {
      setTimeout(() => createHeartBurst(origin.x, origin.y), idx * 420 + 150);
    });
  }

  function createBurst(x, y, colors = ['#ff69b4', '#ff2a70', '#9b51e0', '#00f2fe', '#ffd700', '#ffffff']) {
    const count = budget(80, particles.length, MAX_SPARKS);
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 / count) * i;
      const speed = Math.random() * 8 + 2;
      particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        sprite: getSparkSprite(colors[Math.floor(Math.random() * colors.length)]),
        size: Math.random() * 3 + 2,
        alpha: 1,
        decay: Math.random() * 0.02 + 0.01,
        gravity: 0.08
      });
    }
    ensureAnimating(); // restart loop if it already stopped
  }

  function createHeartBurst(x, y, colors = ['#ff69b4', '#ff2a70', '#ff90cc', '#ffb3de', '#ff4080', '#ffffff']) {
    const count = budget(28, heartBursts.length, MAX_HEARTS);
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 / count) * i + Math.random() * 0.3;
      const speed = Math.random() * 7 + 3;
      heartBursts.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        sprite: getHeartSprite(colors[Math.floor(Math.random() * colors.length)]),
        size: Math.random() * 18 + 10,
        alpha: 1,
        decay: Math.random() * 0.012 + 0.008,
        gravity: 0.12
      });
    }
    ensureAnimating(); // restart loop if it already stopped
  }

  // Kick-start the animation loop only if it's not already running
  function ensureAnimating() {
    if (!animationFrameId) {
      lastFrameTime = 0;
      animationFrameId = requestAnimationFrame(animate);
    }
  }

  // Remove dead particles in one O(n) pass instead of repeated splice()
  function compact(list) {
    let n = 0;
    for (let i = 0; i < list.length; i++) {
      if (list[i].alpha > 0) list[n++] = list[i];
    }
    list.length = n;
  }

  function animate(time) {
    // Frame-rate independent step (1 = one 60fps frame), clamped after tab stalls
    const dt = lastFrameTime ? Math.min(time - lastFrameTime, 50) : 16.7;
    lastFrameTime = time;
    frameMs = frameMs * 0.9 + dt * 0.1;
    const f = dt / 16.7;
    const drag = Math.pow(0.98, f);

    ctx.clearRect(0, 0, width, height);

    // Draw firework sparks
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx * f;
      p.y += p.vy * f;
      p.vy += p.gravity * f;
      p.alpha -= p.decay * f;
      if (p.alpha <= 0) continue;
      const d = p.size * 4;
      ctx.globalAlpha = p.alpha;
      ctx.drawImage(p.sprite, p.x - d / 2, p.y - d / 2, d, d);
    }

    // Draw heart burst particles
    for (let i = 0; i < heartBursts.length; i++) {
      const h = heartBursts[i];
      h.x += h.vx * f;
      h.y += h.vy * f;
      h.vy += h.gravity * f;
      h.vx *= drag;
      h.alpha -= h.decay * f;
      if (h.alpha <= 0) continue;
      const d = h.size * HEART_SPRITE / 64;
      ctx.globalAlpha = h.alpha;
      ctx.drawImage(h.sprite, h.x - d / 2, h.y - d / 2, d, d);
    }
    ctx.globalAlpha = 1;

    compact(particles);
    compact(heartBursts);

    if (particles.length > 0 || heartBursts.length > 0) {
      animationFrameId = requestAnimationFrame(animate);
    } else {
      animationFrameId = null;
    }
  }

  return {
    init,
    launchSequence,
    createBurst,
    createHeartBurst
  };
})();
