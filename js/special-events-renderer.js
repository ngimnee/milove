/* --------------------------------------------------------------------------
   SPECIAL DAYS - RENDERER
   Builds the shared layout from an event config and hands back element
   references for the animation module:
     gate  — a wax seal (the envelope's own motif) waiting to be tapped
     card  — a love galaxy (a floating particle heart over a swirling disc,
             photos along its rim, stepping out and in — drawn by SpecialEventsHeart), beside a
             letter-paper card
   Config text is only ever assigned through textContent.
   Images: keys in ImageData (js/encrypted-data.js, and js/encrypted-special-data.js
   on a special day) go through ImageProvider, which decrypts only the photos
   asked for while the loading screen shows; anything else is treated as a
   relative asset path.
   -------------------------------------------------------------------------- */

const SpecialEventsRenderer = (function () {
  'use strict';

  const ROOT_ID = 'special-event';
  const GATE_TITLE_ID = 'special-event-gate-title';
  const TITLE_ID = 'special-event-title';
  const MAX_PHOTOS = 8;
  const YEARS_TOKEN = /\{years\}/g;       // 1 → "1"
  const YEARS_2_TOKEN = /\{years2\}/g;    // 1 → "01"
  const DAYS_TOKEN = /\{days\}/g;

  const PILL = `
    <p class="se-pill"><i class="fas fa-heart" aria-hidden="true"></i><span class="se-stamp"></span><i class="fas fa-heart" aria-hidden="true"></i></p>
  `;

  const TEMPLATE = `
    <div class="se-backdrop" aria-hidden="true"></div>
    <div class="se-halo" aria-hidden="true"></div>
    <canvas class="se-particles" aria-hidden="true"></canvas>

    <section class="se-gate">
      ${PILL}
      <p class="se-gate-title" id="${GATE_TITLE_ID}"></p>
      <button type="button" class="se-seal" aria-label="Mở món quà của hôm nay">
        <i class="fas fa-heart" aria-hidden="true"></i>
      </button>
      <p class="se-gate-hint">
        <span class="se-gate-hint-pulse"><i class="fas fa-hand-pointer" aria-hidden="true"></i> <span class="se-gate-hint-text"></span></span>
      </p>
    </section>

    <div class="se-prelude" aria-hidden="true"></div>

    <div class="se-stage">
      <article class="se-card" aria-labelledby="${TITLE_ID}">
        <div class="se-content">
          <p class="se-label"></p>
          <h2 class="se-title" id="${TITLE_ID}"></h2>
          <span class="se-divider" aria-hidden="true"></span>
          <div class="se-letter">
            <i class="fas fa-quote-left se-letter-quote" aria-hidden="true"></i>
            <div class="se-message"></div>
          </div>
          <button type="button" class="btn-romantic se-action">
            <span class="se-action-text"></span>
            <i class="fas fa-arrow-right-long" aria-hidden="true"></i>
          </button>
        </div>
      </article>
    </div>

    <div class="se-progress" aria-hidden="true"><span class="se-progress-fill"></span></div>
    <div class="se-controls">
      <button type="button" class="se-control se-sound" data-audio-toggle aria-label="Bật/tắt nhạc">
        <i class="fas fa-music" aria-hidden="true"></i>
      </button>
      <button type="button" class="se-control se-skip" aria-label="Bỏ qua lời chúc">
        Bỏ qua <i class="fas fa-forward" aria-hidden="true"></i>
      </button>
    </div>
  `;

  // ── Images ──────────────────────────────────────────────────────────────

  // A bare name (no "/" or ".") is an encrypted photo's key (in ImageData), not a file path
  const isPhotoKey = src => !/[/.]/.test(src);

  function resolveSource(ref) {
    return isPhotoKey(ref) ? ImageProvider.get(ref) : Promise.resolve(ref);
  }

  /**
   * The encrypted-photo keys among the entries (file paths and empty entries left out)
   * @param {Array<string|{src: string}|null|undefined>} entries
   * @returns {string[]}
   */
  function photoKeys(entries) {
    return (entries || [])
      .filter(Boolean)
      .map(entry => (typeof entry === 'string' ? entry : entry.src))
      .filter(src => src && isPhotoKey(src));
  }

  // A key with no encrypted photo behind it (a placeholder waiting for its photo) has nothing to
  // show: leave it out instead of requesting a file that does not exist. While the special-day data
  // file is still downloading every key may yet turn up there, so none is dropped before it arrives.
  function hasImage(src) {
    if (!isPhotoKey(src)) return true;
    const available = ImageProvider.has(src);
    if (!available) console.info(`[SpecialEvents] Skipped "${src}": no encrypted image in js/encrypted-data.js or js/encrypted-special-data.js yet.`);
    return available;
  }

  /**
   * Creates the <img> elements as soon as the event is known, so the files
   * are loading/decoded long before the reveal needs them.
   * @param {Array<string|{src: string, caption?: string}>} entries
   * @param {{ skip?: string|{src: string} }} options skip: an image to leave out (the featured one is not repeated on the ring)
   * @returns {{ img: HTMLImageElement, caption: string, ready: Promise<void> }[]}
   *   ready settles once the photo has loaded or failed (it never rejects), for the loading screen
   */
  function prepareImages(entries, { skip } = {}) {
    const skipSrc = skip && (typeof skip === 'string' ? skip : skip.src);
    return (entries || [])
      .filter(entry => entry && (typeof entry === 'string' ? entry : entry.src) !== skipSrc)
      .filter(entry => hasImage(typeof entry === 'string' ? entry : entry.src))
      .slice(0, MAX_PHOTOS)
      .map(entry => {
      const { src, caption = '', focus = null } = typeof entry === 'string' ? { src: entry } : entry;
      const img = new Image();
      img.alt = caption;
      img.decoding = 'async';
      const ready = new Promise(resolve => {
        img.addEventListener('load', () => {
          applyFocus(img, focus);
          img.classList.add('is-loaded');
          resolve();
        }, { once: true });
        // A missing file just leaves the moon's soft placeholder showing
        img.addEventListener('error', () => {
          console.warn(`[SpecialEvents] Image not found: "${src}"`);
          img.remove();
          resolve();
        }, { once: true });
        resolveSource(src)
          .then(url => { img.src = url; })
          .catch(err => {
            console.warn(`[SpecialEvents] Image "${src}" could not be decoded:`, err);
            img.remove();
            resolve();
          });
      });
      return { img, caption, focus, ready };
    });
  }

  // A photo is shown in a round (square) frame with object-fit: cover, which keeps the middle and cuts the
  // rest. With a focus point [x, y] (0–1, the centre of the subject) the visible square is centred on it
  // instead (and kept inside the photo), so a face near the top or edge of a tall or wide photo stays in view.
  function applyFocus(img, focus) {
    if (!Array.isArray(focus) || !img.naturalWidth || !img.naturalHeight) return;
    const [fx, fy] = focus;
    const { naturalWidth: w, naturalHeight: h } = img;
    const toPercent = (center, size, visible) => {
      const spare = size - visible;
      if (spare <= 0) return 50;
      const offset = Math.min(spare, Math.max(0, center * size - visible / 2));
      return (offset / spare) * 100;
    };
    const visible = Math.min(w, h);
    img.style.objectPosition = `${toPercent(fx, w, visible)}% ${toPercent(fy, h, visible)}%`;
  }

  // ── DOM ─────────────────────────────────────────────────────────────────

  /**
   * @param {{ event: object, stamp: { day: number, month: number }, years: number|null, days: number|null }} occurrence
   * @param {{ img: HTMLImageElement, caption: string }[]} photos from prepareImages()
   * @param {{ img: HTMLImageElement, caption: string }|null} feature the day's featured photo, if any
   */
  function render(occurrence, photos, feature) {
    const { event } = occurrence;
    const content = event.content;
    const days = occurrence.days === null ? '' : occurrence.days.toLocaleString('vi-VN');   // 1000 → "1.000"
    // {years} → "1", {years2} → "01" (same number, two digits); the day count keeps its thousands separator
    const years = occurrence.years === null ? "" : String(occurrence.years);
    const years2 = years.padStart(2, "0");
    const fill = text => (text || "").replace(YEARS_2_TOKEN, years2).replace(YEARS_TOKEN, years).replace(DAYS_TOKEN, days);

    const root = document.createElement('div');
    root.id = ROOT_ID;
    root.className = `special-event se-theme-${event.theme}`;
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-modal', 'true');
    root.setAttribute('aria-labelledby', GATE_TITLE_ID);
    root.setAttribute('data-lenis-prevent', '');   // let the stage scroll natively while Lenis is stopped
    root.tabIndex = -1;
    root.innerHTML = TEMPLATE;

    const q = selector => root.querySelector(selector);
    const card = q('.se-card');

    root.querySelectorAll('.se-stamp').forEach(stamp => { stamp.textContent = formatStamp(occurrence.stamp); });
    q('.se-gate-title').textContent = fill(content.gate);
    q('.se-gate-hint-text').textContent = fill(content.hint);
    const label = setText(q('.se-label'), fill(content.label));
    q('.se-title').textContent = fill(content.title);
    renderParagraphs(q('.se-message'), fill(content.message));
    q('.se-action-text').textContent = fill(content.action);

    const preludeLines = content.prelude.map(line => createPreludeLine(fill(line)));
    q('.se-prelude').append(...preludeLines);

    const galaxy = photos.length || feature ? createGalaxy(photos, feature) : null;
    if (galaxy) {
      card.insertBefore(galaxy.panel, q('.se-content'));
    } else {
      card.classList.add('se-card--text-only');
    }

    const progress = q('.se-progress');
    if (!event.duration) progress.remove();

    if (typeof AudioEngine !== 'undefined' && AudioEngine.isMuted()) {
      q('.se-sound i').className = 'fas fa-volume-mute';
    }

    document.body.appendChild(root);

    return {
      root,
      halo: q('.se-halo'),
      canvas: q('.se-particles'),
      gate: q('.se-gate'),
      gateItems: [...q('.se-gate').children],
      seal: q('.se-seal'),
      prelude: q('.se-prelude'),
      preludeLines,
      stage: q('.se-stage'),
      card,
      galaxy: galaxy ? galaxy.panel : null,
      moons: galaxy ? galaxy.moons : [],
      hero: galaxy ? galaxy.hero : null,
      heroFocus: galaxy ? galaxy.heroFocus : null,
      galaxyCanvas: galaxy ? galaxy.canvas : null,
      contentItems: [label, q('.se-title'), q('.se-divider'), q('.se-letter'), q('.se-action')].filter(Boolean),
      action: q('.se-action'),
      progressFill: event.duration ? progress.querySelector('.se-progress-fill') : null,
      controls: q('.se-controls'),
      skip: q('.se-skip')
    };
  }

  // ── The love galaxy: the CSS disc, one canvas for the heart and the photos as
  // real elements. SpecialEventsHeart draws the canvas and places the photos on
  // their ring every frame.

  /**
   * @param {{ img: HTMLImageElement, caption: string }[]} photos
   * @param {{ img: HTMLImageElement, caption: string }|null} feature
   * @returns {{ panel: HTMLElement, canvas: HTMLCanvasElement, moons: HTMLElement[], hero: HTMLImageElement|null }}
   */
  function createGalaxy(photos, feature) {
    const panel = document.createElement('div');
    panel.className = 'se-galaxy';
    panel.setAttribute('aria-hidden', 'true');
    panel.innerHTML = `
      <div class="se-pedestal">
        <span class="se-orbit-path"></span>
        <div class="se-galaxy-vortex"></div>
        <div class="se-galaxy-disc"></div>
        <div class="se-galaxy-core"></div>
      </div>
    `;

    const canvas = document.createElement('canvas');
    canvas.className = 'se-galaxy-canvas';
    panel.appendChild(canvas);

    const moons = photos.map(createMoon);
    panel.append(...moons);

    // The featured photo is painted into the heart's canvas, so only its image is handed over
    return { panel, canvas, moons, hero: feature ? feature.img : null, heroFocus: feature ? feature.focus : null };
  }

  function createMoon({ img, caption }) {
    const orbit = document.createElement('span');
    orbit.className = 'se-moon-orbit';

    const inner = document.createElement('span');
    inner.className = 'se-moon-inner';
    const moon = document.createElement('span');
    moon.className = 'se-moon';
    moon.appendChild(img);
    inner.appendChild(moon);
    if (caption) {
      const label = document.createElement('span');
      label.className = 'se-moon-caption';
      label.textContent = caption;
      inner.appendChild(label);
    }
    orbit.appendChild(inner);
    return orbit;
  }

  // Empty optional text removes its element instead of leaving a gap
  function setText(element, text) {
    if (!text) {
      element.remove();
      return null;
    }
    element.textContent = text;
    return element;
  }

  function renderParagraphs(container, text) {
    text.split('\n').filter(line => line.trim()).forEach(line => {
      const paragraph = document.createElement('p');
      paragraph.textContent = line;
      container.appendChild(paragraph);
    });
  }

  // Words are wrapped so the reveal can stagger them; spaces stay real text
  function createPreludeLine(text) {
    const line = document.createElement('p');
    line.className = 'se-prelude-line';
    text.split(/(\s+)/).forEach(part => {
      if (!part) return;
      if (/^\s+$/.test(part)) {
        line.appendChild(document.createTextNode(part));
        return;
      }
      const word = document.createElement('span');
      word.className = 'se-word';
      word.textContent = part;
      line.appendChild(word);
    });
    return line;
  }

  function formatStamp({ day, month }) {
    const pad = value => String(value).padStart(2, '0');
    return `${pad(day)} · ${pad(month)}`;
  }

  return { prepareImages, photoKeys, render };
})();
