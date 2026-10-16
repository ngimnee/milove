/* --------------------------------------------------------------------------
   FLOATING HEARTS PARTICLES CANVAS ENGINE
   Each heart is a pre-rendered sprite (glow baked in), so a frame is only
   drawImage calls: no shadowBlur per heart per frame. Driven by AmbientLoop.
   -------------------------------------------------------------------------- */

const HeartsEngine = (function() {
  'use strict';

  const HEART_COLORS = ['#ff69b4', '#ff2a70', '#ffb6c1', '#9b51e0', '#ffffff'];
  const SPRITE_SIZE = 40;                 // heart size inside the sprite (px)
  const SPRITE_PAD = 16;                  // room around it for the glow
  const SPRITE_PX = SPRITE_SIZE + SPRITE_PAD * 2;
  const GLOW_BLUR = 12 * 0.9;
  const SMALL_SCREEN_QUERY = '(max-width: 768px)';
  const SMALL_SCREEN_DENSITY = 0.6;

  let canvas, ctx;
  let width, height;
  let hearts = [];
  let sprites = [];                       // per colour: { crisp, glow }
  const heartCount = 180; // High density romantic ambient hearts

  function init() {
    canvas = document.getElementById('effects-canvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    if (!ctx) return;

    sprites = HEART_COLORS.map(color => ({
      crisp: createSprite(color, false),
      glow: createSprite(color, true)
    }));

    resize();
    createHearts();

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

  function createHearts() {
    hearts = [];
    const density = window.matchMedia(SMALL_SCREEN_QUERY).matches ? SMALL_SCREEN_DENSITY : 1;
    const count = Math.round(heartCount * density);

    for (let i = 0; i < count; i++) {
      const colorIndex = Math.floor(Math.random() * HEART_COLORS.length);
      hearts.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 14 + 8,
        speedY: Math.random() * 1.2 + 0.4,
        speedX: (Math.random() - 0.5) * 0.8,
        opacity: Math.random() * 0.7 + 0.2,
        colorIndex,
        swing: Math.random() * Math.PI * 2,
        swingSpeed: Math.random() * 0.03 + 0.01,
        blur: Math.random() > 0.6
      });
    }
  }

  // The heart's outline, drawn once per colour. Its top-centre notch sits at (x, PAD).
  function createSprite(color, glow) {
    const sprite = document.createElement('canvas');
    sprite.width = sprite.height = SPRITE_PX;
    const c = sprite.getContext('2d');
    const size = SPRITE_SIZE;
    c.translate(SPRITE_PX / 2, SPRITE_PAD);
    c.fillStyle = color;
    if (glow) {
      c.shadowBlur = GLOW_BLUR;
      c.shadowColor = color;
    }

    c.beginPath();
    const topCurveHeight = size * 0.3;
    c.moveTo(0, topCurveHeight);
    // Left curve
    c.bezierCurveTo(0, 0, -size / 2, 0, -size / 2, topCurveHeight);
    c.bezierCurveTo(-size / 2, (size + topCurveHeight) / 2, 0, size * 0.8, 0, size);
    // Right curve
    c.bezierCurveTo(0, size * 0.8, size / 2, (size + topCurveHeight) / 2, size / 2, topCurveHeight);
    c.bezierCurveTo(size / 2, 0, 0, 0, 0, topCurveHeight);
    c.closePath();
    c.fill();
    return sprite;
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    for (const h of hearts) {
      const scale = h.size / SPRITE_SIZE;
      const sprite = h.blur ? sprites[h.colorIndex].glow : sprites[h.colorIndex].crisp;
      ctx.globalAlpha = h.opacity;
      ctx.drawImage(sprite, h.x - (SPRITE_PX / 2) * scale, h.y - SPRITE_PAD * scale, SPRITE_PX * scale, SPRITE_PX * scale);
    }
    ctx.globalAlpha = 1;
  }

  function step(dt) {
    const f = dt * 60; // 1 = one 60 fps frame

    hearts.forEach(h => {
      h.swing += h.swingSpeed * f;
      h.x += Math.sin(h.swing) * h.speedX * f;
      h.y -= h.speedY * f;

      // Wrap around top to bottom
      if (h.y < -30) {
        h.y = height + 30;
        h.x = Math.random() * width;
      }
      if (h.x < -30) h.x = width + 30;
      if (h.x > width + 30) h.x = -30;
    });

    draw();
  }

  return {
    init
  };
})();
