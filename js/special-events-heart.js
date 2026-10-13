/* --------------------------------------------------------------------------
   SPECIAL DAYS - FLOATING HEART (one canvas, one turntable)
   A heart made of thousands of tiny glowing points hovers over the swirling
   disc: a dense puffy shell, shimmering and twinkling, with streaks of light
   running along its contour, sparks diffusing off its edge, a halo of rings
   under its tip and a heartbeat pulse. The photos fly out of the heart on
   reveal and land along the disc's rim (stepping out and in), each on a small
   ring of light; the one nearest the viewer takes the spotlight. Everything
   is one rigid turntable: it turns by itself around the vertical axis, and
   dragging left/right spins it by hand.

   Points are projected by hand (turn around Y → tilt toward the camera →
   perspective) and drawn as pre-rendered glow sprites with additive blending,
   so no depth sorting is needed and a frame is only drawImage calls. Photos
   stay real <img> elements, placed each frame from the same projection and
   layered behind / in front of the canvas by depth. Colours come from the
   theme's --se-heart-* tokens.
   Reduced motion: no turning, shimmer or streaks — one still frame that only
   redraws while the viewer drags it by hand.
   -------------------------------------------------------------------------- */

const SpecialEventsHeart = (function () {
  'use strict';

  const TAU = Math.PI * 2;
  const SMALL_SCREEN_QUERY = '(max-width: 768px)';
  const SMALL_SCREEN_DENSITY = 0.55;
  const MAX_PIXEL_RATIO = { small: 1.5, large: 2 };
  const MAX_FRAME_SECONDS = 0.05;
  const SPRITE_PX = 32;
  const SPRITE_SPREAD = 3;             // a sprite is drawn 3× its core size: the rest is glow
  const REFERENCE_UNIT_PX = 94;        // particle sizes below are in px at this scene size

  // World units, y up. The CSS disc (radius 1) lies on y = 0 at FLOOR_SHARE of
  // the panel's height; UNIT_SHARE = disc radius as a share of the panel width.
  const FLOOR_SHARE = 0.615;
  const UNIT_SHARE = 0.325;
  const CAMERA = { tilt: 0.56, distance: 7 };   // tilt ≈ 32°: sin = 0.53, the disc's squash
  const HEART = { scale: 0.68, lift: 1.1, depth: 0.34, centerY: 0.05, beat: 0.04, beatEvery: 1.35 };
  const HEART_TIP_Y = HEART.lift - 0.89 * HEART.scale;
  // The photos sit along the disc's rim, evenly spaced, stepping out past the
  // edge, onto it and in over the disc in a repeating out / in / rim beat.
  // A beat of three (not two) keeps eight photos from reading as a square
  // when seen from above: the pattern never lines up with the ring's symmetry.
  const RING = { radii: [1.1, 0.92, 1], lift: 0.2 };
  // The photo nearest the viewer takes the spotlight: it grows, rises a little,
  // glows, gets a beam of light and its caption. As the turntable turns, the
  // spotlight passes smoothly from one photo to the next.
  const SPOTLIGHT = { from: 0.86, grow: 0.42, rise: 0.1 };
  // On reveal the photos fly out of the heart one by one, trailing sparks,
  // and land on their place with a ripple of light.
  const ARRIVAL = { delay: 0.35, stagger: 0.14, duration: 1.2, arc: 0.35, trail: 8, ripple: 0.7 };
  // A small ring of light under each photo, so it sits on the disc instead of floating
  const PAD = { radius: 0.13, points: 14, beam: 5, spin: 0.8 };
  // The day's featured photo is the heart's own body: cut to the heart's shape,
  // turning and beating with it. The shell of particles wraps it; the particles
  // that would sit over the photo thin out to a veil (HERO.veil of their glow, a
  // few stay as glints) so the whole picture stays visible, with the light still
  // playing over it. It fades in just after the ring has landed.
  // fill: how far out to the contour the photo reaches (1 = right up to it); the shell's rim
  // particles (s ≥ veilTo) never thin out, so the edge keeps glowing over the photo's border.
  // bias: how much of the photo's spare height is cut from the bottom rather than the top (0.5 = even),
  // so a portrait keeps its head and loses the part under the heart's tip.
  const HERO = { delay: 0.6, fade: 1.8, fill: 0.97, veilTo: 0.9, bias: 0.35, veil: 0.12, glints: 0.1 };
  const HALOS = [
    { radius: 0.5, count: 150, speed: 0.6 },
    { radius: 0.7, count: 110, speed: -0.45 }
  ];
  const SPIN = {
    auto: TAU / 20,        // rad/s, one turn every 20 s when nobody touches it
    turnsPerWidth: 0.6,    // dragging across the whole panel turns it ~216°
    settle: 1.1,           // s for a flick to ease back to the auto speed
    max: TAU * 1.5,
    staleMs: 100           // letting go after holding still is not a flick
  };
  const TRAIL = 6;
  const EDGE_FADE_PX = 14;
  const BRIGHTNESS = 0.78;             // overall glow: additive blending piles up fast, keep it soft

  const rand = (min, max) => min + Math.random() * (max - min);
  const pick = list => list[Math.floor(Math.random() * list.length)];
  const clamp01 = value => Math.max(0, Math.min(1, value));
  const smoothstep = (from, to, value) => {
    const t = clamp01((value - from) / (to - from));
    return t * t * (3 - 2 * t);
  };
  const easeOutCubic = t => 1 - (1 - t) ** 3;

  // ── Sprites ─────────────────────────────────────────────────────────────

  let colorProbe = null;
  function toRgb(color) {
    colorProbe = colorProbe || document.createElement('canvas').getContext('2d');
    colorProbe.fillStyle = '#000';
    colorProbe.fillStyle = color;               // the browser normalizes any CSS color
    const value = colorProbe.fillStyle;
    if (value[0] === '#') return [1, 3, 5].map(i => parseInt(value.slice(i, i + 2), 16));
    return (value.match(/[\d.]+/g) || [255, 255, 255]).slice(0, 3).map(Number);
  }

  // A bright core, the colour, then a soft falloff
  function createSprite(color) {
    const sprite = document.createElement('canvas');
    sprite.width = sprite.height = SPRITE_PX;
    const ctx = sprite.getContext('2d');
    const [r, g, b] = toRgb(color);
    const half = SPRITE_PX / 2;
    const gradient = ctx.createRadialGradient(half, half, 0, half, half, half);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
    gradient.addColorStop(0.18, `rgba(${r}, ${g}, ${b}, 0.95)`);
    gradient.addColorStop(0.45, `rgba(${r}, ${g}, ${b}, 0.28)`);
    gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, SPRITE_PX, SPRITE_PX);
    return sprite;
  }

  // A wide, faint haze behind the heart
  function createBloomSprite(color) {
    const sprite = document.createElement('canvas');
    sprite.width = sprite.height = SPRITE_PX * 4;
    const ctx = sprite.getContext('2d');
    const [r, g, b] = toRgb(color);
    const half = sprite.width / 2;
    const gradient = ctx.createRadialGradient(half, half, 0, half, half, half);
    gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.3)`);
    gradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, 0.1)`);
    gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, sprite.width, sprite.height);
    return sprite;
  }

  // ── The heart's shape ───────────────────────────────────────────────────

  // The classic heart curve, normalized to roughly x ∈ [-1, 1], y ∈ [-0.89, 0.9]
  function curve(t) {
    return {
      x: Math.sin(t) ** 3,
      y: (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) / 16 + 0.17
    };
  }

  // The same contour resampled at equal arc-length steps: sampling the curve's
  // own parameter bunches points at the cleft and the tip (a bright streak).
  const CONTOUR_STEPS = 512;
  const CONTOUR = (function () {
    const fine = Array.from({ length: CONTOUR_STEPS * 4 + 1 }, (_, i) => curve((i / (CONTOUR_STEPS * 4)) * TAU));
    const lengths = [0];
    for (let i = 1; i < fine.length; i++) {
      lengths.push(lengths[i - 1] + Math.hypot(fine[i].x - fine[i - 1].x, fine[i].y - fine[i - 1].y));
    }
    const total = lengths[lengths.length - 1];
    let j = 0;
    return Array.from({ length: CONTOUR_STEPS }, (_, i) => {
      while (lengths[j + 1] < (i / CONTOUR_STEPS) * total) j++;
      return fine[j];
    });
  }());

  // u ∈ [0, 1) walks once round the contour at an even pace
  function outline(u) {
    const position = (((u % 1) + 1) % 1) * CONTOUR_STEPS;
    const i = Math.floor(position);
    const a = CONTOUR[i];
    const b = CONTOUR[(i + 1) % CONTOUR_STEPS];
    const f = position - i;
    return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f };
  }

  // A point at `u` round the contour, `s` of the way out from the centre
  // (1 = on the contour). `side` ∈ [-1, 1] puts it on the front or back face of
  // the pillow-shaped shell: thick at the middle, thin at the edge.
  function onHeart(u, s, side) {
    const o = outline(u);
    const dx = o.x;
    const dy = o.y - HEART.centerY;
    const length = Math.hypot(dx, dy) || 1;
    const thickness = HEART.depth * Math.sqrt(Math.max(0, 1 - s * s));
    return {
      x: dx * s * HEART.scale,
      y: HEART.lift + (HEART.centerY + dy * s) * HEART.scale,
      z: side * thickness * HEART.scale,
      nx: dx / length,
      ny: dy / length
    };
  }

  // The shell: a bright rim, two dense faces and a loose volume between them.
  // Brighter, whiter points toward the edge; deeper red toward the middle.
  function buildHeart(density, sprites) {
    const n = count => Math.round(count * density);
    const points = [];
    const add = (s, side, size, alpha, palette) => {
      const p = onHeart(Math.random(), s, side);
      p.size = size;
      p.alpha = alpha;
      p.sprite = pick(palette);
      p.phase = Math.random() * TAU;
      p.rate = rand(1.2, 3.2);
      p.overPhoto = s < HERO.veilTo && Math.random() > HERO.glints;   // sits over the photo's area
      points.push(p);
    };
    for (let i = 0; i < n(560); i++) add(rand(0.95, 1.02), rand(-0.05, 0.05), rand(1.5, 2.8), rand(0.6, 0.9), sprites.light);
    for (let i = 0; i < n(2400); i++) {
      const s = Math.sqrt(Math.random()) * 0.97;
      const palette = s > 0.8 ? sprites.light : s > 0.45 ? sprites.mid : sprites.deep;
      add(s, (Math.random() < 0.5 ? -1 : 1) * rand(0.85, 1), rand(1.1, 2.2), rand(0.25, 0.6), palette);
    }
    for (let i = 0; i < n(520); i++) add(Math.sqrt(Math.random()) * 0.9, rand(-0.8, 0.8), rand(1, 2), rand(0.2, 0.5), sprites.deep);
    return points;
  }

  // Streaks of light running round the contour, each with a fading tail
  function buildRunners(density, sprites) {
    return Array.from({ length: Math.round(64 * density) }, () => ({
      t: Math.random(),
      speed: (Math.random() < 0.5 ? -1 : 1) * rand(0.05, 0.12),   // laps per second
      s: pick([1, 0.9, 0.78, 0.62]),
      side: rand(-0.7, 0.7),
      size: rand(2, 3.4),
      alpha: rand(0.6, 1),
      sprite: pick(sprites.light)
    }));
  }

  // Sparks leaving the edge, drifting outward and fading
  function buildSparks(density, sprites) {
    return Array.from({ length: Math.round(150 * density) }, () => ({
      t: Math.random(),
      side: rand(-0.5, 0.5),
      phase: Math.random(),
      rate: rand(0.16, 0.38),
      size: rand(1.2, 2.6),
      sprite: pick(sprites.light)
    }));
  }

  // Rings of light under the heart's tip, like the pedestal of a hologram
  function buildHalos(density, sprites) {
    return HALOS.flatMap(({ radius, count, speed }) => {
      const total = Math.round(count * density);
      return Array.from({ length: total }, (_, i) => ({
        angle: (i / total) * TAU,
        radius,
        speed,
        size: rand(1.2, 2.4),
        alpha: rand(0.45, 0.95),
        sprite: pick(sprites.mid)
      }));
    });
  }

  // The photos: equal moons spaced evenly round the rim, stepping out and in
  function buildPhotos(elements) {
    return elements.map((root, index) => {
      const phi = (index / elements.length) * TAU;
      const radius = RING.radii[index % RING.radii.length];
      return {
        root,
        inner: root.querySelector('.se-moon-inner'),
        caption: root.querySelector('.se-moon-caption'),
        arrivesAt: ARRIVAL.delay + index * ARRIVAL.stagger,
        radius,
        x: radius * Math.cos(phi),
        z: radius * Math.sin(phi),
        front: 0
      };
    });
  }

  // Depth should read, but the photos stay close to one size (about ±12%) so
  // they look like a matched set rather than big and small ones
  function photoScale(perspective, front) {
    return (0.9 + 0.1 * front) * (1 + (perspective - 1) * 0.5);
  }

  // Lub-dub: two quick pulses, then a rest
  function heartbeat(time) {
    const phase = (time % HEART.beatEvery) / HEART.beatEvery;
    const pulse = (center, width) => Math.exp(-(((phase - center) / width) ** 2));
    return pulse(0.08, 0.05) + 0.6 * pulse(0.26, 0.06);
  }

  // ── Scene ───────────────────────────────────────────────────────────────

  /**
   * @param {HTMLElement} panel the .se-galaxy element (also the drag target)
   * @param {{ canvas: HTMLCanvasElement, moons: HTMLElement[], hero?: HTMLImageElement|null, reducedMotion: boolean }} options
   * @returns {{ start: Function, destroy: Function }}
   */
  function create(panel, { canvas, moons, hero = null, reducedMotion }) {
    const ctx = panel && canvas ? canvas.getContext('2d') : null;
    if (!ctx) return { start() {}, destroy() {} };

    const isSmallScreen = window.matchMedia(SMALL_SCREEN_QUERY).matches;
    const density = isSmallScreen ? SMALL_SCREEN_DENSITY : 1;
    const style = getComputedStyle(panel);
    const token = (name, fallback) => style.getPropertyValue(name).trim() || fallback;
    const rose = token('--se-heart-1', '#ff2a70');
    const pink = token('--se-heart-2', '#ff6f9c');
    const core = token('--se-heart-core', '#fff2f6');
    const make = colors => colors.map(createSprite);
    const sprites = {
      light: make([pink, pink, '#ffc2d6', core]),
      mid: make([pink, rose, pink]),
      deep: make([rose, '#d4144b', rose]),
      bloom: createBloomSprite(rose)
    };

    const heart = buildHeart(density, sprites);
    const runners = buildRunners(density, sprites);
    const sparks = buildSparks(density, sprites);
    const halos = buildHalos(density, sprites);
    const photos = buildPhotos(moons);
    const heroStart = ARRIVAL.delay + Math.max(0, photos.length - 1) * ARRIVAL.stagger + ARRIVAL.duration + HERO.delay;

    const cosT = Math.cos(CAMERA.tilt);
    const sinT = Math.sin(CAMERA.tilt);
    let cosA = 1;
    let sinA = 0;

    let width = 0;
    let height = 0;
    let pixelRatio = 1;
    let unit = 1;
    let sizeScale = 1;
    let moonHalf = 0;

    let angle = 0;
    let velocity = reducedMotion ? 0 : SPIN.auto;
    let time = 0;
    let lastFrame = 0;
    let rafId = null;
    let started = false;

    let dragging = false;
    let lastX = 0;
    let lastMove = 0;

    const out = { x: 0, y: 0, z: 0, d: 0, k: 1 };
    // Turn around Y by the turntable angle, tilt toward the camera, then perspective.
    // Writes CSS-px screen coordinates into `out` (z > 0 = toward the viewer;
    // d = depth across the turntable only, < 0 = behind the heart's middle).
    function project(x, y, z) {
      return projectView(x * cosA + z * sinA, y, -x * sinA + z * cosA);
    }

    // The same from view space (already turned): xr across, zr toward the viewer
    function projectView(xr, y, zr) {
      const y2 = y * cosT - zr * sinT;
      const z2 = y * sinT + zr * cosT;
      const k = CAMERA.distance / (CAMERA.distance - z2);
      out.x = width / 2 + xr * k * unit;
      out.y = height * FLOOR_SHARE - y2 * k * unit;
      out.z = z2;
      out.d = zr;
      out.k = k;
      return out;
    }

    function plot(x, y, z, size, alpha, sprite) {
      project(x, y, z);
      const d = size * sizeScale * out.k * SPRITE_SPREAD * pixelRatio;
      // Fade toward the canvas edge instead of being cut off by it
      const edge = Math.min(out.x, out.y, width - out.x, height - out.y) / EDGE_FADE_PX;
      ctx.globalAlpha = alpha * BRIGHTNESS * Math.min(1, 0.55 + 0.45 * out.k) * clamp01(edge);
      ctx.drawImage(sprite, out.x * pixelRatio - d / 2, out.y * pixelRatio - d / 2, d, d);
    }

    function layout() {
      width = panel.clientWidth;
      height = panel.clientHeight;
      if (!width || !height) return;
      const maxRatio = isSmallScreen ? MAX_PIXEL_RATIO.small : MAX_PIXEL_RATIO.large;
      pixelRatio = Math.min(window.devicePixelRatio || 1, maxRatio);
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      unit = width * UNIT_SHARE;
      sizeScale = unit / REFERENCE_UNIT_PX;
      moonHalf = photos.length ? photos[0].root.offsetWidth / 2 : 0;
    }

    // 0 → 1 as a photo flies from the heart to its place (always 1 with reduced motion)
    function arrival(photo) {
      return reducedMotion ? 1 : easeOutCubic(clamp01((time - photo.arrivesAt) / ARRIVAL.duration));
    }

    // Where a photo is `e` of the way along its flight: out of the heart, up over an arc, down onto its place
    function flightPoint(photo, e, rise) {
      return {
        x: photo.x * e,
        y: HEART.lift + (RING.lift - HEART.lift) * e + Math.sin(Math.PI * e) * ARRIVAL.arc + rise,
        z: photo.z * e
      };
    }

    // Photos ride the ring; the nearest takes the spotlight, the far ones fade back
    function placePhotos() {
      photos.forEach(photo => {
        project(photo.x, RING.lift, photo.z);
        const front = clamp01((out.d / photo.radius + 1) / 2);   // 0 = far side, 1 = nearest
        const e = arrival(photo);
        const focus = smoothstep(SPOTLIGHT.from, 1, front) * (e >= 1 ? 1 : 0);
        const at = flightPoint(photo, e, SPOTLIGHT.rise * focus);

        project(at.x, at.y, at.z);
        const scale = photoScale(out.k, front) * (1 + SPOTLIGHT.grow * focus) * (0.3 + 0.7 * e);
        photo.root.style.transform =
          `translate3d(${(out.x - moonHalf).toFixed(1)}px, ${(out.y - moonHalf).toFixed(1)}px, 0) scale(${scale.toFixed(3)})`;
        // The canvas sits at z-index 20: photos behind the heart go under it, the rest over it
        photo.root.style.zIndex = String((out.d < 0 ? 1 : 21) + Math.round(front * 8) + Math.round(focus * 4));
        photo.root.style.setProperty('--focus', focus.toFixed(2));
        photo.inner.style.opacity = ((0.5 + 0.5 * front) * clamp01(e * 1.6)).toFixed(2);
        if (photo.caption) photo.caption.style.opacity = focus.toFixed(2);

        if (e < 1) drawTrail(photo, e);
        else drawPad(photo, front, focus);
      });
    }

    // Sparks left behind a photo in flight
    function drawTrail(photo, e) {
      if (e <= 0) return;
      for (let k = 1; k <= ARRIVAL.trail; k++) {
        const behind = e - k * 0.04;
        if (behind <= 0) break;
        const p = flightPoint(photo, behind, 0);
        const fade = 1 - k / ARRIVAL.trail;
        plot(p.x, p.y, p.z, 2.4 * fade + 0.6, 0.9 * fade, sprites.light[k % sprites.light.length]);
      }
    }

    // The ring of light under a landed photo, its landing ripple, and the spotlight's beam
    function drawPad(photo, front, focus) {
      const glow = (0.25 + 0.75 * front) * (0.45 + 0.55 * focus);
      const landed = reducedMotion ? 1 : clamp01((time - photo.arrivesAt - ARRIVAL.duration) / ARRIVAL.ripple);
      const turn = reducedMotion ? 0 : time * PAD.spin;
      for (let i = 0; i < PAD.points; i++) {
        const a = (i / PAD.points) * TAU + turn;
        const r = PAD.radius * (0.4 + 0.6 * easeOutCubic(landed));
        plot(photo.x + r * Math.cos(a), 0.01, photo.z + r * Math.sin(a), 1.3, 0.75 * glow, sprites.light[i % sprites.light.length]);
        if (landed < 1) {
          const wave = PAD.radius * (1 + 1.6 * landed);
          plot(photo.x + wave * Math.cos(a), 0.01, photo.z + wave * Math.sin(a), 1.6, 0.9 * (1 - landed), sprites.mid[i % sprites.mid.length]);
        }
      }
      if (focus <= 0.01) return;
      const top = RING.lift - moonHalf / unit;
      for (let j = 1; j <= PAD.beam; j++) {
        plot(photo.x, 0.01 + (top - 0.01) * (j / (PAD.beam + 1)), photo.z, 1.4, 0.55 * focus * (1 - j / (PAD.beam + 2)), sprites.light[j % sprites.light.length]);
      }
    }

    // ── The featured photo ────────────────────────────────────────────────

    // 0 → 1 while it fades in (with reduced motion it is simply there)
    function heroFade() {
      if (!hero) return 0;
      return reducedMotion ? 1 : clamp01((time - heroStart) / HERO.fade);
    }

    // The photo's plane in view space, for telling which particles are in front of it
    function heroPlane() {
      return { sin: Math.sin(angle), cos: cosA, sign: Math.sign(cosA) || 1 };
    }

    // The heart's particles, optionally only the ones in front of / behind the photo's plane
    function drawHeart(beat, plane, front, photoFade) {
      for (const p of heart) {
        const shimmer = reducedMotion ? 0 : 0.014 * Math.sin(time * p.rate + p.phase);
        const hx = (p.x + p.nx * shimmer) * beat;
        const hy = HEART.lift + (p.y - HEART.lift + p.ny * shimmer) * beat;
        const hz = p.z * beat;
        if (plane) {
          const xr = hx * cosA + hz * sinA;
          const zr = -hx * sinA + hz * cosA;
          const side = (plane.sin * xr + plane.cos * zr) * plane.sign > 0;
          if (side !== front) continue;
        }
        const twinkle = reducedMotion ? 0.75 : 0.6 + 0.4 * Math.sin(time * p.rate * 1.3 + p.phase);
        const veil = p.overPhoto ? 1 - (1 - HERO.veil) * photoFade : 1;
        plot(hx, hy, hz, p.size, p.alpha * twinkle * veil, p.sprite);
      }
    }

    // The photo's outline: the heart's contour, pulled in to HERO.fill (unit space: x across, v down)
    const photoOutline = Array.from({ length: 128 }, (_, i) => {
      const c = CONTOUR[i * (CONTOUR_STEPS / 128)];
      return { x: c.x * HERO.fill, v: -(HEART.centerY + (c.y - HEART.centerY) * HERO.fill) };
    });

    // The heart's bounding box in the same unit space (x across, v down): the photo covers all of it
    const BOX_TOP = -Math.max(...CONTOUR.map(c => c.y));
    const BOX_BOTTOM = -Math.min(...CONTOUR.map(c => c.y));
    const BOX_ASPECT = 2 / (BOX_BOTTOM - BOX_TOP);

    // Cover the box with the whole photo (no square crop): crop only what overflows the box's shape
    function drawHeroImage() {
      const w = hero.naturalWidth;
      const h = hero.naturalHeight;
      let sw = w;
      let sh = h;
      if (w / h > BOX_ASPECT) sw = h * BOX_ASPECT;
      else sh = w / BOX_ASPECT;
      ctx.drawImage(hero, (w - sw) / 2, (h - sh) * HERO.bias, sw, sh, -1, BOX_TOP, 2, BOX_BOTTOM - BOX_TOP);
    }

    function tracePhotoOutline() {
      ctx.beginPath();
      photoOutline.forEach((p, i) => (i ? ctx.lineTo(p.x, p.v) : ctx.moveTo(p.x, p.v)));
      ctx.closePath();
    }

    // A soft rose glow behind the photo, the same haze the heart has
    function drawHeroGlow(fade) {
      project(0, HEART.lift, 0);
      const size = HEART.scale * 2.4 * unit * out.k * pixelRatio;
      ctx.globalAlpha = 0.55 * fade;
      ctx.drawImage(sprites.bloom, out.x * pixelRatio - size / 2, out.y * pixelRatio - size / 2, size, size);
    }

    // The photo in the heart's plane: unit space = the heart's own coordinates, mapped onto
    // the plane's projected axes, so it turns, tilts and beats exactly like the particles around it
    function drawHeroPhoto(fade, beat) {
      const unitLength = HEART.scale * beat * (0.94 + 0.06 * easeOutCubic(fade));   // eases up to full size while fading in
      const c = projectView(0, HEART.lift, 0);
      const cx = c.x;
      const cy = c.y;
      const px = projectView(unitLength * cosA, HEART.lift, -unitLength * sinA);
      const ax = px.x - cx;
      const ay = px.y - cy;
      const py = projectView(0, HEART.lift + unitLength, 0);
      const bx = py.x - cx;
      const by = py.y - cy;
      const mirror = cosA < 0 ? -1 : 1;                     // show the print the right way round from behind too
      const pr = pixelRatio;
      const shine = reducedMotion ? 1 : 0.97 + 0.03 * Math.sin(time * 2.1);

      ctx.save();
      ctx.setTransform(mirror * ax * pr, mirror * ay * pr, -bx * pr, -by * pr, cx * pr, cy * pr);
      ctx.globalCompositeOperation = 'source-over';
      tracePhotoOutline();
      ctx.save();
      ctx.clip();
      ctx.globalAlpha = fade * shine;
      ctx.fillStyle = '#1e1030';
      ctx.fillRect(-1, -1, 2, 2);
      if (hero.complete && hero.naturalWidth) drawHeroImage();
      // Only the very edge takes the heart's rose, where the photo meets the particle shell
      const vignette = ctx.createRadialGradient(0, -0.05, 0.72, 0, -0.05, 1.02);
      vignette.addColorStop(0, 'rgba(255, 42, 112, 0)');
      vignette.addColorStop(1, 'rgba(255, 42, 112, 0.4)');
      ctx.fillStyle = vignette;
      ctx.fillRect(-1, -1, 2, 2);
      ctx.restore();

      // A soft rim of light along the outline, where the photo turns into the shell
      ctx.globalCompositeOperation = 'lighter';
      tracePhotoOutline();
      ctx.lineJoin = 'round';
      ctx.strokeStyle = rose;
      ctx.globalAlpha = 0.22 * fade;
      ctx.lineWidth = 0.14;
      ctx.stroke();
      ctx.strokeStyle = pink;
      ctx.globalAlpha = 0.5 * fade;
      ctx.lineWidth = 0.04;
      ctx.stroke();
      ctx.restore();
    }

    function draw() {
      if (!width) return;
      cosA = Math.cos(angle);
      sinA = Math.sin(angle);

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'lighter';

      const pulse = reducedMotion ? 0 : heartbeat(time);
      const fade = heroFade();
      const beat = 1 + HEART.beat * pulse;

      project(0, HEART.lift, 0);
      const bloom = HEART.scale * 2 * unit * out.k * pixelRatio;
      ctx.globalAlpha = 0.7 + 0.3 * pulse;
      ctx.drawImage(sprites.bloom, out.x * pixelRatio - bloom / 2, out.y * pixelRatio - bloom / 2, bloom, bloom);

      for (const p of halos) {
        const a = p.angle + p.speed * time;
        plot(p.radius * Math.cos(a), HEART_TIP_Y - 0.08, p.radius * Math.sin(a), p.size, p.alpha, p.sprite);
      }

      if (fade > 0) {
        // Inside the heart: the particles behind the photo, the photo, then the particles in front of it
        const plane = heroPlane();
        drawHeroGlow(fade);
        drawHeart(beat, plane, false, fade);
        drawHeroPhoto(fade, beat);
        drawHeart(beat, plane, true, fade);
      } else {
        drawHeart(beat, null, true, 0);
      }

      if (!reducedMotion) {
        for (const p of runners) {
          for (let k = 0; k < TRAIL; k++) {
            const q = onHeart(p.t + p.speed * time - Math.sign(p.speed) * k * 0.008, p.s, p.side);
            plot(q.x * beat, HEART.lift + (q.y - HEART.lift) * beat, q.z * beat,
              p.size * (1 - k / TRAIL * 0.6), p.alpha * (1 - k / TRAIL) ** 1.6, p.sprite);
          }
        }
        for (const p of sparks) {
          const u = (time * p.rate + p.phase) % 1;
          const q = onHeart(p.t, 1 + 0.4 * u, p.side * (1 - u));
          plot(q.x, q.y, q.z + p.side * u * 0.2, p.size * (1 - 0.5 * u), 0.85 * Math.sin(Math.PI * u), p.sprite);
        }
      }

      placePhotos();
    }

    function advance(dt) {
      time += dt;
      if (dragging) return;
      velocity += (SPIN.auto - velocity) * (1 - Math.exp(-dt / SPIN.settle));
      angle += velocity * dt;
    }

    function frame(now) {
      advance(Math.min((now - lastFrame) / 1000, MAX_FRAME_SECONDS));
      lastFrame = now;
      draw();
      rafId = requestAnimationFrame(frame);
    }

    // Reduced motion: no loop, just one redraw per change
    function requestDraw() {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        draw();
      });
    }

    function onResize() {
      layout();
      if (reducedMotion) requestDraw();
    }

    // ── Drag to turn ──────────────────────────────────────────────────────

    function onDown(e) {
      if (e.button) return; // left mouse button / touch / pen only
      dragging = true;
      velocity = 0;          // grabbing a turntable stops it
      lastX = e.clientX;
      lastMove = performance.now();
      try { panel.setPointerCapture(e.pointerId); } catch (err) { /* capture is a nice-to-have */ }
      panel.classList.add('is-grabbing');
    }

    function onMove(e) {
      if (!dragging) return;
      const now = performance.now();
      const delta = ((e.clientX - lastX) / Math.max(1, width)) * TAU * SPIN.turnsPerWidth;
      angle += delta;
      const raw = delta / (Math.max(8, now - lastMove) / 1000);
      velocity = Math.max(-SPIN.max, Math.min(SPIN.max, raw));
      lastX = e.clientX;
      lastMove = now;
      if (reducedMotion) requestDraw();
    }

    function onUp(e) {
      if (!dragging) return;
      dragging = false;
      panel.classList.remove('is-grabbing');
      try { panel.releasePointerCapture(e.pointerId); } catch (err) { /* already released */ }
      if (reducedMotion || performance.now() - lastMove > SPIN.staleMs) velocity = reducedMotion ? 0 : SPIN.auto;
    }

    const resizeObserver = typeof ResizeObserver === 'function' ? new ResizeObserver(onResize) : null;

    function start() {
      if (started) return;
      started = true;
      layout();
      panel.addEventListener('pointerdown', onDown);
      panel.addEventListener('pointermove', onMove);
      panel.addEventListener('pointerup', onUp);
      panel.addEventListener('pointercancel', onUp);
      if (resizeObserver) resizeObserver.observe(panel);
      else window.addEventListener('resize', onResize);

      if (reducedMotion) {
        draw();
      } else {
        lastFrame = performance.now();
        rafId = requestAnimationFrame(frame);
      }
    }

    function destroy() {
      cancelAnimationFrame(rafId);
      rafId = null;
      panel.removeEventListener('pointerdown', onDown);
      panel.removeEventListener('pointermove', onMove);
      panel.removeEventListener('pointerup', onUp);
      panel.removeEventListener('pointercancel', onUp);
      if (resizeObserver) resizeObserver.disconnect();
      else window.removeEventListener('resize', onResize);
      panel.classList.remove('is-grabbing');
      canvas.width = canvas.height = 0;
    }

    return { start, destroy };
  }

  return { create };
})();
