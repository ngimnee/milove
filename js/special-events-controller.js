/* --------------------------------------------------------------------------
   SPECIAL DAYS - CONTROLLER
   Lifecycle of the one-day experience, played right after the loading screen
   and before the intro:

     init()   detect today's event, start loading its photos
     start()  lock page → gate (a wax seal waiting to be tapped, hearts falling)
     open()   the tap is the user gesture: special music starts, reveal plays
     exit()   exit sequence + special music hands back to the background music.
            It runs when the event's duration is up, GRACE_CLOSE_MS later if she
            touched, dragged or scrolled the card meanwhile (or when she presses
            a button / Esc)
     destroy  kill timelines, particles & listeners, remove DOM, unlock page,
              then hand over to the intro

   On a normal day start() calls back immediately and nothing else happens.
   Whatever goes wrong here (a typo in the config, an old browser), the page is
   unlocked and the intro still follows: a special day may fail, the letter may not.
   -------------------------------------------------------------------------- */

const SpecialEventsController = (function () {
  'use strict';

  const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
  // Everything behind the overlay: not focusable or clickable while it is open
  const BACKGROUND_SELECTORS = ['#main-content', '#floating-utilities-dock'];
  const BURST_SPREAD = { x: 0.9, y: 0.3 };
  const HELD_CLASS = 'se-held';
  // Extra time once the event's own time is up, if she touched, dragged or scrolled the card meanwhile
  const GRACE_CLOSE_MS = 10000;
  const PAGE_OPEN_CLASS = 'special-event-open';
  const ROOT_ID = 'special-event';
  // The special-day photos, kept apart so a normal day never downloads them
  const SPECIAL_DATA_SRC = './js/encrypted-special-data.js';

  const BURSTS = {
    fireworks: (x, y, colors) => FireworksEngine.createBurst(x, y, colors),
    hearts: (x, y, colors) => FireworksEngine.createHeartBurst(x, y, colors)
  };

  let occurrence = null;
  let preparedPhotos = [];
  let preparedFeature = null;
  let hasStarted = false;
  let session = null; // non-null only while the experience is on screen

  /**
   * Detects today's event and starts loading its photos: the data file that holds them
   * (downloaded only now, on a special day) and then each photo decrypted.
   * @returns {Promise<void>[]} the work the loading screen waits for, each settled once done or failed
   *   (none on a normal day)
   */
  function init() {
    const tasks = [];
    try {
      occurrence = SpecialEventsDetector.detect();
      if (occurrence) {
        const { images = [], feature } = occurrence.event;

        // Photos not already in the main data file come from the special-days file
        const keys = SpecialEventsRenderer.photoKeys([feature, ...images]);
        if (keys.some(key => !ImageProvider.has(key))) {
          tasks.push(ImageProvider.loadData(SPECIAL_DATA_SRC).catch(err => console.warn(err.message)));
        }

        preparedFeature = feature ? SpecialEventsRenderer.prepareImages([feature])[0] || null : null;
        preparedPhotos = SpecialEventsRenderer.prepareImages(images, { skip: feature });
        tasks.push(Promise.all([preparedFeature, ...preparedPhotos].filter(Boolean).map(photo => photo.ready)));
      }
    } catch (err) {
      // A typo in the hand-edited config must never keep the letter from opening
      console.error('[SpecialEvents] Skipped today: please check js/special-events-data.js', err);
      occurrence = null;
      preparedFeature = null;
      preparedPhotos = [];
    }
    return tasks;
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

    try {
      begin(done);
    } catch (err) {
      console.error('[SpecialEvents] Could not show today\'s special day, continuing to the letter:', err);
      const s = session;
      session = null;
      if (s) {
        teardown(s);
      } else {
        const root = document.getElementById(ROOT_ID);
        if (root) root.remove();
        unlockPage();
      }
      done();
    }
  }

  function begin(done) {
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
        ? SpecialEventsHeart.create(view.galaxy, { canvas: view.galaxyCanvas, moons: view.moons, hero: view.hero, heroFocus: view.heroFocus, reducedMotion })
        : null,
      sequence: null,
      exitSequence: null,
      isOpened: false,
      autoEnd: true,           // false once she has touched the card: it then gets GRACE_CLOSE_MS extra
      lastActivityAt: 0,       // her last touch
      graceFrom: null,         // when the event's own time ran out, if she had touched the card by then
      graceTimer: null,
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

    try {
      s.sequence.kill();
      s.sequence = SpecialEventsAnimation.playReveal(view, {
        reducedMotion: s.reducedMotion,
        duration: event.duration ? event.duration / 1000 : null,
        onBurst: anchor => fireBurst(event.burst, anchor, view.root),
        onGalaxyStart: () => { if (s.galaxy) s.galaxy.start(); },
        onAutoEnd: () => onTimeUp(s)
      });
      view.root.focus({ preventScroll: true });
    } catch (err) {
      console.error('[SpecialEvents] The reveal failed, moving on to the letter:', err);
      exit();
    }
  }

  function exit() {
    const s = session;
    if (!s || s.isExiting) return;
    s.isExiting = true;

    AudioEngine.stopSpecialMusic();
    try {
      s.sequence.kill();
      s.exitSequence = SpecialEventsAnimation.playExit(s.view, { reducedMotion: s.reducedMotion }, () => destroy(s));
    } catch (err) {
      console.error('[SpecialEvents] The exit animation failed:', err);
      destroy(s);
    }
  }

  function destroy(s) {
    if (session !== s) return;
    session = null;
    teardown(s);
    s.onComplete();
  }

  // Every step on its own: one failing must never leave the page locked behind a dead overlay
  function teardown(s) {
    [
      () => s.listeners.abort(),
      () => clearTimeout(s.graceTimer),
      () => s.sequence && s.sequence.kill(),
      () => s.exitSequence && s.exitSequence.kill(),
      () => s.effect && s.effect.destroy(),
      () => s.galaxy && s.galaxy.destroy(),
      () => s.view.root.remove()
    ].forEach(step => {
      try {
        step();
      } catch (err) {
        console.error('[SpecialEvents] Cleanup step failed:', err);
      }
    });
    unlockPage();
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
      onVisibilityChange(s);
    }, { signal });

    // Touching, dragging or scrolling the card means she is reading: the event still plays for its
    // full length, but when that is up it stays GRACE_CLOSE_MS longer before closing (see onTimeUp)
    const touched = () => noteTouch(s);
    view.stage.addEventListener('pointerdown', touched, { signal });
    view.stage.addEventListener('pointerup', touched, { signal });
    view.stage.addEventListener('pointermove', (e) => { if (e.buttons) noteTouch(s); }, { signal, passive: true });
    view.stage.addEventListener('wheel', touched, { signal, passive: true });
    // Keys count too (arrow keys scroll the card), but only once the card is on screen
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape' && getComputedStyle(view.stage).visibility === 'visible') noteTouch(s);
    }, { signal });
  }

  function noteTouch(s) {
    if (!s.isOpened || s.isExiting) return;
    s.autoEnd = false;
    s.lastActivityAt = performance.now();
  }

  // The event's own time is up. Untouched, it closes now. Touched, she gets GRACE_CLOSE_MS more
  // (counted again from her last touch if she is still scrolling), then it closes too.
  // An event without a duration never gets here: it waits for her to press a button.
  function onTimeUp(s) {
    if (session !== s || s.isExiting) return;
    if (s.autoEnd) {
      exit();
      return;
    }
    s.view.root.classList.add(HELD_CLASS); // the progress bar has nothing left to show
    s.graceFrom = performance.now();
    armGraceClose(s);
  }

  // One timer, re-armed for the time that is left, instead of restarted on every pointer move
  function armGraceClose(s) {
    if (s.graceFrom === null || s.graceTimer !== null || document.hidden) return;
    const idleFor = () => performance.now() - Math.max(s.graceFrom, s.lastActivityAt);
    s.graceTimer = setTimeout(() => {
      s.graceTimer = null;
      if (session !== s || s.isExiting) return;
      if (idleFor() >= GRACE_CLOSE_MS) {
        exit();
      } else {
        armGraceClose(s);
      }
    }, Math.max(0, GRACE_CLOSE_MS - idleFor()));
  }

  // A hidden tab pauses the event and must not eat into her extra time: she gets it in full when back
  function onVisibilityChange(s) {
    if (document.hidden) {
      clearTimeout(s.graceTimer);
      s.graceTimer = null;
    } else if (s.graceFrom !== null) {
      s.graceFrom = performance.now();
      armGraceClose(s);
    }
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
