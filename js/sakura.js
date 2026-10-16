/* --------------------------------------------------------------------------
   FALLING SAKURA (CHERRY BLOSSOM) PETALS CANVAS ENGINE
   One pre-rendered petal sprite (gradient included) drawn with a transform,
   instead of a new gradient per petal per frame. Driven by AmbientLoop.
   -------------------------------------------------------------------------- */

const SakuraEngine = (function() {
  'use strict';

  const SPRITE_SIZE = 20;                 // petal radius inside the sprite (px)
  const SPRITE_PX = SPRITE_SIZE * 2;
  const SMALL_SCREEN_QUERY = '(max-width: 768px)';
  const SMALL_SCREEN_DENSITY = 0.6;

  let canvas, ctx;
  let width, height;
  let petals = [];
  let petalSprite = null;
  const petalCount = 45;

  function init() {
    canvas = document.createElement('canvas');
    canvas.id = 'sakura-canvas';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '-7';
    document.getElementById('bg-canvas-container').appendChild(canvas);

    ctx = canvas.getContext('2d');
    if (!ctx) return;
    petalSprite = createPetalSprite();
    resize();
    createPetals();

    window.addEventListener('resize', resize);
    if (AmbientLoop.reducedMotion) {
      draw();
    } else {
      AmbientLoop.add(step);
    }
  }

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    if (AmbientLoop.reducedMotion) draw();
  }

  function createPetals() {
    petals = [];
    const density = window.matchMedia(SMALL_SCREEN_QUERY).matches ? SMALL_SCREEN_DENSITY : 1;
    const count = Math.round(petalCount * density);

    for (let i = 0; i < count; i++) {
      petals.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 10 + 8,
        speedY: Math.random() * 1.5 + 0.8,
        speedX: Math.random() * 1.2 - 0.6,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.04,
        oscillation: Math.random() * Math.PI * 2,
        oscillationSpeed: Math.random() * 0.02 + 0.01,
        opacity: Math.random() * 0.7 + 0.3
      });
    }
  }

  // Sakura pink gradient, painted once; petals are this sprite scaled to their own size
  function createPetalSprite() {
    const sprite = document.createElement('canvas');
    sprite.width = sprite.height = SPRITE_PX;
    const c = sprite.getContext('2d');
    const size = SPRITE_SIZE;
    c.translate(SPRITE_SIZE, SPRITE_SIZE);

    const gradient = c.createLinearGradient(-size, -size, size, size);
    gradient.addColorStop(0, '#ffb7c5');
    gradient.addColorStop(0.6, '#ff69b4');
    gradient.addColorStop(1, '#ff3385');
    c.fillStyle = gradient;

    c.beginPath();
    c.moveTo(0, -size);
    c.bezierCurveTo(size * 0.8, -size * 0.5, size * 0.8, size * 0.5, 0, size);
    c.bezierCurveTo(-size * 0.8, size * 0.5, -size * 0.8, -size * 0.5, 0, -size);
    c.fill();
    return sprite;
  }

  function draw() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, width, height);
    for (const p of petals) {
      const scale = p.size / SPRITE_SIZE;
      const cos = Math.cos(p.rotation) * scale;
      const sin = Math.sin(p.rotation) * scale;
      ctx.setTransform(cos, sin, -sin, cos, p.x, p.y);
      ctx.globalAlpha = p.opacity;
      ctx.drawImage(petalSprite, -SPRITE_SIZE, -SPRITE_SIZE);
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1;
  }

  function step(dt) {
    const f = dt * 60; // 1 = one 60 fps frame

    petals.forEach(p => {
      p.oscillation += p.oscillationSpeed * f;
      p.x += (Math.sin(p.oscillation) * 1.5 + p.speedX) * f;
      p.y += p.speedY * f;
      p.rotation += p.rotationSpeed * f;

      if (p.y > height + 20) {
        p.y = -20;
        p.x = Math.random() * width;
      }
      if (p.x > width + 20) p.x = -20;
      if (p.x < -20) p.x = width + 20;
    });

    draw();
  }

  return {
    init
  };
})();
