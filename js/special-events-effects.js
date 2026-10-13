/* --------------------------------------------------------------------------
   SPECIAL DAYS - AMBIENT PARTICLES
   One canvas, one requestAnimationFrame loop, alive only while an event is on
   screen. Several effects can share it (e.g. hearts + petals).
   Every shape is pre-rendered once into small sprites — a crisp one for near
   particles and a soft, out-of-focus one for far particles — so a frame is just
   a few dozen drawImage calls and depth comes for free (no per-frame shadowBlur).
   Colors come from the theme's --se-particles CSS variable.

   To add an effect: add an entry to EFFECTS with count / (trace | paint) / spawn / update.
   trace draws one silhouette (filled in a single colour); paint draws a small
   multi-part picture (see the birthday treats). A name in ALIASES stands for
   several effects, e.g. 'birthday' = cakes + balloons + gifts.
   -------------------------------------------------------------------------- */

const SpecialEventsEffects = (function () {
  'use strict';

  const TAU = Math.PI * 2;
  const SPRITE_PX = 64;
  const SHAPE_RADIUS = SPRITE_PX * 0.3;         // leaves room for the baked-in glow
  const SOFT_DEPTH = 0.55;                      // particles further than this use the soft sprite
  const SMALL_SCREEN_QUERY = '(max-width: 768px)';
  const SMALL_SCREEN_DENSITY = 0.55;
  const MAX_PIXEL_RATIO = { small: 1.5, large: 2 };
  const MAX_FRAME_SECONDS = 0.05;               // no jump after a hidden tab resumes
  const FADE_IN_SECONDS = 1.5;

  const rand = (min, max) => min + Math.random() * (max - min);

  const ALIASES = { birthday: ['cakes', 'balloons', 'gifts'] };
  const HIGHLIGHT = 'rgba(255, 255, 255, 0.6)';   // pale details over the theme colour
  const FLAME = '#ffe1d2';                         // a warm white, not yellow

  // Positions in CSS px, speeds in px/s, `size` = on-screen shape width.
  // `depth` 0.35 (far) … 1 (near) scales size, speed and brightness together.
  const EFFECTS = {
    hearts: {
      count: 34,
      trace: traceHeart,
      spawn(p, width, height, scatter) {
        p.depth = rand(0.35, 1);
        p.x = rand(0, width);
        p.y = scatter ? rand(-0.1 * height, height) : rand(-70, -24);
        p.size = 8 + 20 * p.depth;
        p.speed = 24 + 52 * p.depth;
        p.sway = rand(14, 32) * p.depth;
        p.phase = rand(0, TAU);
        p.swaySpeed = rand(0.6, 1.3);
        p.tilt = rand(-0.3, 0.3);
        p.alpha = 0.3 + 0.6 * p.depth;
        p.fade = 1;
      },
      update(p, dt, width, height) {
        p.phase += dt * p.swaySpeed;
        p.y += p.speed * dt;
        p.x += Math.cos(p.phase) * p.sway * dt;
        p.rotation = p.tilt + Math.sin(p.phase) * 0.35;
        return p.y < height + 40;
      }
    },

    petals: {
      count: 16,
      trace: tracePetal,
      spawn(p, width, height, scatter) {
        p.depth = rand(0.35, 1);
        p.x = rand(-0.15 * width, width);
        p.y = scatter ? rand(0, height) : -30;
        p.size = 9 + 12 * p.depth;
        p.speed = 20 + 34 * p.depth;
        p.drift = rand(8, 24);
        p.phase = rand(0, TAU);
        p.rotation = rand(0, TAU);
        p.spin = rand(-1, 1);
        p.alpha = 0.35 + 0.55 * p.depth;
        p.fade = 1;
      },
      update(p, dt, width, height) {
        p.phase += dt;
        p.y += p.speed * dt;
        p.x += (p.drift + Math.sin(p.phase) * 14) * dt;
        p.rotation += p.spin * dt;
        return p.y < height + 30 && p.x < width + 30;
      }
    },

    // Birthday treats. Cakes and gifts drift down like the hearts; balloons float up.
    cakes: {
      count: 7,
      paint: paintCake,
      spawn: spawnFalling(30, 22),
      update: updateFalling
    },

    gifts: {
      count: 6,
      paint: paintGift,
      spawn: spawnFalling(24, 16),
      update: updateFalling
    },

    balloons: {
      count: 7,
      paint: paintBalloon,
      spawn(p, width, height, scatter) {
        p.depth = rand(0.35, 1);
        p.x = rand(0.04 * width, 0.96 * width);
        p.y = scatter ? rand(0, height) : height + rand(30, 70);
        p.size = 24 + 20 * p.depth;
        p.speed = 22 + 30 * p.depth;
        p.sway = rand(10, 22) * p.depth;
        p.phase = rand(0, TAU);
        p.swaySpeed = rand(0.5, 1);
        p.tilt = 0;
        p.alpha = 0.6 + 0.4 * p.depth;
        p.fade = 1;
      },
      update(p, dt) {
        p.phase += dt * p.swaySpeed;
        p.y -= p.speed * dt;
        p.x += Math.cos(p.phase) * p.sway * dt;
        p.rotation = Math.sin(p.phase) * 0.18;
        return p.y > -80;
      }
    },

    sparkles: {
      count: 22,
      trace: traceSparkle,
      spawn(p, width, height, scatter) {
        p.depth = rand(0.6, 1);
        p.x = rand(0, width);
        p.y = rand(0, height);
        p.size = rand(6, 15);
        p.duration = rand(2.2, 4.2);
        p.life = scatter ? rand(0, p.duration) : 0;
        p.rise = rand(4, 12);
        p.rotation = rand(0, 0.8);
        p.alpha = rand(0.55, 1);
        p.fade = 0;
      },
      update(p, dt) {
        p.life += dt;
        p.y -= p.rise * dt;
        p.fade = Math.sin(Math.PI * Math.min(1, p.life / p.duration));
        return p.life < p.duration;
      }
    }
  };

  function spawnFalling(baseSize, growth) {
    return (p, width, height, scatter) => {
      p.depth = rand(0.35, 1);
      p.x = rand(0.04 * width, 0.96 * width);
      p.y = scatter ? rand(-0.1 * height, height) : rand(-90, -40);
      p.size = baseSize + growth * p.depth;
      p.speed = 22 + 40 * p.depth;
      p.sway = rand(10, 24) * p.depth;
      p.phase = rand(0, TAU);
      p.swaySpeed = rand(0.5, 1.1);
      p.tilt = rand(-0.25, 0.25);
      p.alpha = 0.6 + 0.4 * p.depth;
      p.fade = 1;
    };
  }

  function updateFalling(p, dt, width, height) {
    p.phase += dt * p.swaySpeed;
    p.y += p.speed * dt;
    p.x += Math.cos(p.phase) * p.sway * dt;
    p.rotation = p.tilt + Math.sin(p.phase) * 0.22;
    return p.y < height + 60;
  }

  // ── Shapes (drawn around 0,0 with radius r) ─────────────────────────────

  function traceHeart(ctx, r) {
    ctx.moveTo(0, r * 0.95);
    ctx.bezierCurveTo(-r * 1.3, r * 0.1, -r * 0.75, -r * 1.05, 0, -r * 0.35);
    ctx.bezierCurveTo(r * 0.75, -r * 1.05, r * 1.3, r * 0.1, 0, r * 0.95);
  }

  function tracePetal(ctx, r) {
    ctx.moveTo(0, r);
    ctx.bezierCurveTo(-r * 0.95, r * 0.35, -r * 0.7, -r * 0.8, -r * 0.12, -r);
    ctx.quadraticCurveTo(0, -r * 0.78, r * 0.12, -r);
    ctx.bezierCurveTo(r * 0.7, -r * 0.8, r * 0.95, r * 0.35, 0, r);
  }

  // Paint shapes: the theme colour is already the fillStyle; details are pale overlays
  function paintCake(ctx, r) {
    ctx.beginPath();
    ctx.roundRect(-r * 0.95, r * 0.2, r * 1.9, r * 0.75, r * 0.14);   // bottom tier
    ctx.roundRect(-r * 0.6, -r * 0.3, r * 1.2, r * 0.55, r * 0.12);   // top tier
    ctx.fill();

    ctx.fillStyle = HIGHLIGHT;                                         // icing line + candle
    ctx.fillRect(-r * 0.95, r * 0.34, r * 1.9, r * 0.1);
    ctx.fillRect(-r * 0.6, -r * 0.16, r * 1.2, r * 0.08);
    ctx.fillRect(-r * 0.07, -r * 0.78, r * 0.14, r * 0.5);

    ctx.fillStyle = FLAME;
    ctx.beginPath();
    ctx.ellipse(0, -r * 0.98, r * 0.12, r * 0.2, 0, 0, TAU);
    ctx.fill();
  }

  function paintGift(ctx, r) {
    ctx.beginPath();
    ctx.roundRect(-r * 0.8, -r * 0.05, r * 1.6, r * 0.95, r * 0.1);   // box
    ctx.roundRect(-r * 0.92, -r * 0.4, r * 1.84, r * 0.4, r * 0.1);   // lid
    ctx.fill();

    ctx.fillStyle = HIGHLIGHT;                                         // ribbon + bow
    ctx.fillRect(-r * 0.12, -r * 0.4, r * 0.24, r * 1.3);
    ctx.beginPath();
    ctx.ellipse(-r * 0.3, -r * 0.55, r * 0.3, r * 0.17, -0.5, 0, TAU);
    ctx.ellipse(r * 0.3, -r * 0.55, r * 0.3, r * 0.17, 0.5, 0, TAU);
    ctx.fill();
  }

  function paintBalloon(ctx, r) {
    ctx.beginPath();
    ctx.ellipse(0, -r * 0.2, r * 0.66, r * 0.82, 0, 0, TAU);
    ctx.moveTo(0, r * 0.58);                                           // knot
    ctx.lineTo(-r * 0.12, r * 0.78);
    ctx.lineTo(r * 0.12, r * 0.78);
    ctx.fill();

    ctx.fillStyle = HIGHLIGHT;                                         // shine
    ctx.beginPath();
    ctx.ellipse(-r * 0.25, -r * 0.5, r * 0.12, r * 0.24, 0.5, 0, TAU);
    ctx.fill();

    ctx.strokeStyle = HIGHLIGHT;                                       // string
    ctx.lineWidth = r * 0.06;
    ctx.beginPath();
    ctx.moveTo(0, r * 0.78);
    ctx.bezierCurveTo(r * 0.2, r * 0.95, -r * 0.2, r * 1.1, 0, r * 1.25);
    ctx.stroke();
  }

  function traceSparkle(ctx, r) {
    ctx.moveTo(0, -r);
    ctx.quadraticCurveTo(r * 0.12, -r * 0.12, r, 0);
    ctx.quadraticCurveTo(r * 0.12, r * 0.12, 0, r);
    ctx.quadraticCurveTo(-r * 0.12, r * 0.12, -r, 0);
    ctx.quadraticCurveTo(-r * 0.12, -r * 0.12, 0, -r);
  }

  // The soft sprite draws only the shape's shadow (shape pushed off-canvas), which
  // gives an out-of-focus look without ctx.filter (not available in every Safari).
  function createSprite(effect, color, soft) {
    const sprite = document.createElement('canvas');
    sprite.width = sprite.height = SPRITE_PX;
    const ctx = sprite.getContext('2d');
    if (effect.paint) return paintSprite(effect.paint, sprite, ctx, color, soft);
    const { trace } = effect;
    const offset = soft ? SPRITE_PX * 4 : 0;
    ctx.translate(SPRITE_PX / 2 - offset, SPRITE_PX / 2);
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = soft ? SPRITE_PX * 0.12 : SPRITE_PX * 0.16;
    ctx.shadowOffsetX = offset;
    ctx.beginPath();
    trace(ctx, soft ? SHAPE_RADIUS * 0.8 : SHAPE_RADIUS);
    ctx.fill();
    return sprite;
  }

  // Multi-part pictures can't use the shadow-only trick, so a far one is simply
  // drawn through a blur (ctx.filter is ignored where unsupported: it stays crisp)
  function paintSprite(paint, sprite, ctx, color, soft) {
    if (soft) ctx.filter = 'blur(1.2px)';
    ctx.translate(SPRITE_PX / 2, SPRITE_PX / 2);
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = SPRITE_PX * 0.12;
    paint(ctx, SHAPE_RADIUS * 0.85);
    return sprite;
  }

  function readColors(canvas) {
    const colors = getComputedStyle(canvas).getPropertyValue('--se-particles')
      .split(',')
      .map(color => color.trim())
      .filter(Boolean);
    return colors.length ? colors : ['#ffffff'];
  }

  /**
   * @param {HTMLCanvasElement} canvas
   * @param {string|string[]|null} names keys of EFFECTS
   * @returns {{ start: Function, destroy: Function } | null}
   */
  function create(canvas, names) {
    const effects = [].concat(names || [])
      .flatMap(name => ALIASES[name] || name)
      .map(name => EFFECTS[name])
      .filter(Boolean);
    const ctx = effects.length && canvas ? canvas.getContext('2d') : null;
    if (!ctx) return null;

    const isSmallScreen = window.matchMedia(SMALL_SCREEN_QUERY).matches;
    const density = isSmallScreen ? SMALL_SCREEN_DENSITY : 1;
    const colors = readColors(canvas);
    const particles = [];
    effects.forEach(effect => {
      const sprites = {
        crisp: colors.map(color => createSprite(effect, color, false)),
        soft: colors.map(color => createSprite(effect, color, true))
      };
      for (let i = 0; i < Math.round(effect.count * density); i++) {
        particles.push({ effect, sprites, color: Math.floor(Math.random() * colors.length) });
      }
    });
    const shapePx = SHAPE_RADIUS * 2;

    let width = 0;
    let height = 0;
    let pixelRatio = 1;
    let rafId = null;
    let lastTime = 0;
    let elapsed = 0;

    function resize() {
      const maxRatio = isSmallScreen ? MAX_PIXEL_RATIO.small : MAX_PIXEL_RATIO.large;
      pixelRatio = Math.min(window.devicePixelRatio || 1, maxRatio);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
    }

    function spawn(p, scatter) {
      p.effect.spawn(p, width, height, scatter);
      p.sprite = (p.depth < SOFT_DEPTH ? p.sprites.soft : p.sprites.crisp)[p.color];
    }

    function frame(now) {
      const dt = Math.min((now - lastTime) / 1000, MAX_FRAME_SECONDS);
      lastTime = now;
      elapsed += dt;
      const intensity = Math.min(1, elapsed / FADE_IN_SECONDS);

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of particles) {
        if (!p.effect.update(p, dt, width, height)) spawn(p, false);
        const scale = (p.size / shapePx) * pixelRatio;
        const cos = Math.cos(p.rotation) * scale;
        const sin = Math.sin(p.rotation) * scale;
        ctx.setTransform(cos, sin, -sin, cos, p.x * pixelRatio, p.y * pixelRatio);
        ctx.globalAlpha = p.alpha * p.fade * intensity;
        ctx.drawImage(p.sprite, -SPRITE_PX / 2, -SPRITE_PX / 2);
      }

      rafId = requestAnimationFrame(frame);
    }

    function start() {
      if (rafId !== null) return;
      resize();
      particles.forEach(p => spawn(p, true));
      window.addEventListener('resize', resize);
      lastTime = performance.now();
      rafId = requestAnimationFrame(frame);
    }

    function destroy() {
      cancelAnimationFrame(rafId);
      rafId = null;
      window.removeEventListener('resize', resize);
      particles.length = 0;
      canvas.width = canvas.height = 0;
    }

    return { start, destroy };
  }

  return { create };
})();
