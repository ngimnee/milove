/* --------------------------------------------------------------------------
   SPECIAL DAYS - CONTROLLER
   Lifecycle of the one-day experience, played right after the loading screen
   and before the intro:

     init()   detect today's event, start loading its photos
     start()  lock page → gate (a wax seal waiting to be tapped, hearts falling)
     open()   the tap is the user gesture: special music starts, reveal plays
     exit()   exit sequence + special music hands back to the background music
     destroy  kill timelines, particles & listeners, remove DOM, unlock page,
              then hand over to the intro

   On a normal day start() calls back immediately and nothing else happens.
   -------------------------------------------------------------------------- */

const SpecialEventsController = (function () {
  'use strict';

  const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
  // Everything behind the overlay: not focusable or clickable while it is open
  const BACKGROUND_SELECTORS = ['#main-content', '#floating-utilities-dock'];
  const BURST_SPREAD = { x: 0.9, y: 0.3 };
  const HELD_CLASS = 'se-held';
  const PAGE_OPEN_CLASS = 'special-event-open';

  const BURSTS = {
    fireworks: (x, y, colors) => FireworksEngine.createBurst(x, y, colors),
    hearts: (x, y, colors) => FireworksEngine.createHeartBurst(x, y, colors)
  };

  let occurrence = null;
  let preparedPhotos = [];
  let preparedFeature = null;
  let hasStarted = false;
  let session = null; // non-null only while the experience is on screen

  function init() {
    try {
      occurrence = SpecialEventsDetector.detect();
    } catch (err) {
      // A typo in the hand-edited config must never keep the letter from opening
      console.error('[SpecialEvents] Skipped today: please check js/special-events-data.js', err);
      occurrence = null;
    }
    if (occurrence) {
      const { images, feature } = occurrence.event;
      preparedFeature = feature ? SpecialEventsRenderer.prepareImages([feature])[0] : null;
      preparedPhotos = SpecialEventsRenderer.prepareImages(images, { skip: feature });
    }
  }

  /**
   * @param {Function} onComplete runs once the page is back to normal (or right away on a normal day)
   */
  function start(onComplete) {
    const done = typeof onComplete === 'function' ? onComplete : () => {};
    if (!occurrence || hasStarted) {
      done();
      return;
    }
    hasStarted = true;

    const { event } = occurrence;
    const reducedMotion = window.matchMedia(REDUCED_MOTION_QUERY).matches;
    const view = SpecialEventsRenderer.render(occurrence, preparedPhotos, preparedFeature);
    preparedPhotos = [];
    preparedFeature = null;

    const s = {
      event,
      view,
      reducedMotion,
      onComplete: done,
      listeners: new AbortController(),
      effect: reducedMotion ? null : SpecialEventsEffects.create(view.canvas, event.particles),
      galaxy: view.galaxy
        ? SpecialEventsHeart.create(view.galaxy, { canvas: view.galaxyCanvas, moons: view.moons, hero: view.hero, reducedMotion })
        : null,
      sequence: null,
      exitSequence: null,
      isOpened: false,
      autoEnd: true,
      isExiting: false
    };
    session = s;

    lockPage();
    bindListeners(s);
    if (s.effect) s.effect.start();
    s.sequence = SpecialEventsAnimation.playGate(view, { reducedMotion });
    view.root.focus({ preventScroll: true });
  }

  // The seal tap is a real user gesture, so the special music may start here
  function open() {
    const s = session;
    if (!s || s.isOpened || s.isExiting) return;
    s.isOpened = true;

    const { event, view } = s;
    if (event.music) AudioEngine.playSpecialMusic(event.music);
    AudioEngine.unlockAudio(); // no-op if already unlocked; otherwise starts the track just chosen

    s.sequence.kill();
    s.sequence = SpecialEventsAnimation.playReveal(view, {
      reducedMotion: s.reducedMotion,
      duration: event.duration ? event.duration / 1000 : null,
      onBurst: anchor => fireBurst(event.burst, anchor, view.root),
      onGalaxyStart: () => { if (s.galaxy) s.galaxy.start(); },
      onAutoEnd: () => { if (s.autoEnd) exit(); }
    });
    view.root.focus({ preventScroll: true });
  }

  function exit() {
    const s = session;
    if (!s || s.isExiting) return;
    s.isExiting = true;

    s.sequence.kill();
    AudioEngine.stopSpecialMusic();
    s.exitSequence = SpecialEventsAnimation.playExit(s.view, { reducedMotion: s.reducedMotion }, () => destroy(s));
  }

  function destroy(s) {
    if (session !== s) return;
    session = null;

    s.listeners.abort();
    s.sequence.kill();
    if (s.exitSequence) s.exitSequence.kill();
    if (s.effect) s.effect.destroy();
    if (s.galaxy) s.galaxy.destroy();
    s.view.root.remove();

    unlockPage();
    s.onComplete();
  }

  // ── Listeners (all removed at once through the AbortController) ─────────

  function bindListeners(s) {
    const { signal } = s.listeners;
    const { view } = s;

    view.gate.addEventListener('click', open, { signal });
    view.skip.addEventListener('click', exit, { signal });
    view.action.addEventListener('click', exit, { signal });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        exit();
      }
    }, { signal });

    // Paused with the tab hidden, so nothing plays out (or auto-closes) unseen
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        s.sequence.pause();
      } else {
        s.sequence.resume();
      }
    }, { signal });

    // Touching or scrolling the card means she is reading: stop the automatic close
    const holdOpen = () => {
      if (!s.autoEnd) return;
      s.autoEnd = false;
      view.root.classList.add(HELD_CLASS);
    };
    view.stage.addEventListener('pointerdown', holdOpen, { signal });
    view.stage.addEventListener('wheel', holdOpen, { signal, passive: true });
  }

  // ── Page state ──────────────────────────────────────────────────────────

  function lockPage() {
    SmoothScrollEngine.lock();
    setBackgroundInert(true);
    document.body.classList.add(PAGE_OPEN_CLASS);
  }

  function unlockPage() {
    document.body.classList.remove(PAGE_OPEN_CLASS);
    setBackgroundInert(false);
    SmoothScrollEngine.unlock();
  }

  function setBackgroundInert(isInert) {
    BACKGROUND_SELECTORS.forEach(selector => {
      const element = document.querySelector(selector);
      if (element) element.inert = isInert;
    });
  }

  // The breaking seal bursts on the site's fireworks canvas (it already sits above every overlay)
  // The burst wears the day's own colours (the same --se-particles as the falling shapes)
  function fireBurst(kind, anchor, root) {
    const burst = BURSTS[kind];
    if (!burst || !anchor) return;
    const rect = anchor.getBoundingClientRect();
    const x = rect.left + rect.width / 2 + (Math.random() - 0.5) * rect.width * BURST_SPREAD.x;
    const y = rect.top + rect.height * (BURST_SPREAD.y - Math.random() * BURST_SPREAD.y);
    const colors = getComputedStyle(root).getPropertyValue('--se-particles').split(',').map(c => c.trim()).filter(Boolean);
    burst(x, y, colors.length ? colors : undefined);
  }

  return { init, start };
})();
