/* --------------------------------------------------------------------------
   FIREWORKS & HEART CONFETTI CELEBRATION ENGINE
   -------------------------------------------------------------------------- */

const FireworksEngine = (function() {
  'use strict';

  let canvas, ctx;
  let width, height;
  let particles = [];   // Firework spark particles
  let heartBursts = []; // Heart shape particles
  let animationFrameId = null;

  function init() {
    canvas = document.getElementById('fireworks-canvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    resize();
    window.addEventListener('resize', resize);
  }

  function resize() {
    if (!canvas) return;
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  // Draw a heart shape at (cx, cy) with given size, color and alpha
  function drawHeart(cx, cy, size, color, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.shadowBlur = 18;
    ctx.shadowColor = color;
    ctx.beginPath();
    ctx.moveTo(cx, cy + size * 0.3);
    ctx.bezierCurveTo(cx, cy, cx - size * 0.5, cy, cx - size * 0.5, cy + size * 0.3);
    ctx.bezierCurveTo(cx - size * 0.5, cy + size * 0.65, cx, cy + size * 0.9, cx, cy + size);
    ctx.bezierCurveTo(cx, cy + size * 0.9, cx + size * 0.5, cy + size * 0.65, cx + size * 0.5, cy + size * 0.3);
    ctx.bezierCurveTo(cx + size * 0.5, cy, cx, cy, cx, cy + size * 0.3);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // Trigger Grand Fireworks + Heart Explosion Sequence
  function launchSequence() {
    // Re-sync canvas dimensions before launching
    resize();

    AudioEngine.playSound('fireworks');

    // Trigger Canvas Confetti Heart Shower if confetti library available
    if (typeof confetti !== 'undefined') {
      confetti({
        particleCount: 140,
        spread: 120,
        origin: { y: 0.6 },
        colors: ['#ff69b4', '#ff2a70', '#9b51e0', '#00f2fe', '#ffd700']
      });
      setTimeout(() => {
        confetti({ particleCount: 70, angle: 60,  spread: 80, origin: { x: 0, y: 0.65 }, colors: ['#ff69b4', '#ff2a70', '#ffd1dc'] });
        confetti({ particleCount: 70, angle: 120, spread: 80, origin: { x: 1, y: 0.65 }, colors: ['#9b51e0', '#00f2fe', '#ff69b4'] });
      }, 500);
      setTimeout(() => {
        confetti({ particleCount: 90, spread: 140, origin: { y: 0.5 }, colors: ['#ff69b4', '#ffd700', '#ffffff'] });
      }, 1100);
    }

    // Launch canvas firework bursts across screen
    // NOTE: createBurst/createHeartBurst each call ensureAnimating() internally
    for (let i = 0; i < 9; i++) {
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
    ];
    heartOrigins.forEach((origin, idx) => {
      setTimeout(() => createHeartBurst(origin.x, origin.y), idx * 420 + 150);
    });
  }

  function createBurst(x, y) {
    const count = 80;
    const colors = ['#ff69b4', '#ff2a70', '#9b51e0', '#00f2fe', '#ffd700', '#ffffff'];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 / count) * i;
      const speed = Math.random() * 8 + 2;
      particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 3 + 2,
        alpha: 1,
        decay: Math.random() * 0.02 + 0.01,
        gravity: 0.08
      });
    }
    ensureAnimating(); // restart loop if it already stopped
  }

  function createHeartBurst(x, y) {
    const count = 28;
    const colors = ['#ff69b4', '#ff2a70', '#ff90cc', '#ffb3de', '#ff4080', '#ffffff'];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 / count) * i + Math.random() * 0.3;
      const speed = Math.random() * 7 + 3;
      heartBursts.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        color: colors[Math.floor(Math.random() * colors.length)],
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
      animationFrameId = requestAnimationFrame(animate);
    }
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    // Draw firework sparks
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.alpha -= p.decay;
      if (p.alpha <= 0) { particles.splice(i, 1); continue; }
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.shadowBlur = 10;
      ctx.shadowColor = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Draw heart burst particles
    for (let i = heartBursts.length - 1; i >= 0; i--) {
      const h = heartBursts[i];
      h.x += h.vx;
      h.y += h.vy;
      h.vy += h.gravity;
      h.vx *= 0.98;
      h.alpha -= h.decay;
      if (h.alpha <= 0) { heartBursts.splice(i, 1); continue; }
      drawHeart(h.x - h.size / 2, h.y - h.size / 2, h.size, h.color, h.alpha);
    }

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
