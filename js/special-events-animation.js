/* --------------------------------------------------------------------------
   SPECIAL DAYS - CHOREOGRAPHY (GSAP)
   Gate:   the site dims, a wax seal rises with today's date, hearts start falling
   Reveal: the seal breaks → a whisper or two → the love galaxy fades in and
           starts turning (a starlight heart on a swirling disc, one turntable,
           photos orbiting it) → the words arrive
   Exit:   everything drifts toward the viewer and fades
   Reduced motion keeps the same story with crossfades only (the galaxy stays
   still, turned only by hand).
   Without GSAP the finished layout is simply shown (CSS .se-static).
   -------------------------------------------------------------------------- */

const SpecialEventsAnimation = (function () {
  'use strict';

  // Seconds
  const T = {
    dimIn: 1.0,
    gateAt: 0.35,
    gateIn: 0.9,
    gateStagger: 0.14,
    controlsAt: 1.1,
    controlsIn: 0.6,
    sealBreak: 0.7,
    gateOut: 0.5,
    wordIn: 0.7,
    wordStagger: 0.07,
    holdPerChar: 0.03,
    holdMin: 1.0,
    holdMax: 1.8,
    lineOut: 0.5,
    lineGap: 0.2,
    galaxyIn: 1.1,
    moonStagger: 0.1,
    contentAt: 0.4,
    contentIn: 0.9,
    contentStagger: 0.12,
    minReadTime: 7,
    exitContent: 0.7,
    exitFade: 0.9
  };

  const STATIC_EXIT_MS = 600;

  function wrap(gsap, timeline, targets) {
    return {
      pause: () => timeline.pause(),
      resume: () => timeline.resume(),
      kill: () => {
        timeline.kill();
        gsap.killTweensOf(targets);
      }
    };
  }

  // ── Gate ────────────────────────────────────────────────────────────────

  /**
   * @param {object} view from SpecialEventsRenderer.render()
   * @param {{ reducedMotion: boolean }} options
   * @returns {{ pause: Function, resume: Function, kill: Function }}
   */
  function playGate(view, { reducedMotion }) {
    const gsap = window.gsap;
    if (!gsap) {
      view.root.classList.add('se-static');
      return { pause() {}, resume() {}, kill() {} };
    }

    const galaxyItems = view.galaxy ? [view.galaxy, ...view.moons] : [];
    gsap.set([view.controls, view.stage, ...view.gateItems, ...view.preludeLines, ...view.contentItems, ...galaxyItems], { autoAlpha: 0 });

    const rise = reducedMotion ? 0 : 16;
    const tl = gsap.timeline();
    tl.to(view.root, { opacity: 1, duration: T.dimIn, ease: 'power1.inOut' }, 0);
    tl.fromTo(view.gateItems,
      { autoAlpha: 0, y: rise },
      { autoAlpha: 1, y: 0, duration: T.gateIn, ease: 'power2.out', stagger: T.gateStagger, clearProps: 'transform' },
      T.gateAt);
    tl.to(view.controls, { autoAlpha: 1, duration: T.controlsIn }, T.controlsAt);
    return wrap(gsap, tl, view.gateItems);
  }

  // ── Reveal ──────────────────────────────────────────────────────────────

  /**
   * @param {{ reducedMotion: boolean, duration: number|null, onBurst: Function, onGalaxyStart: Function, onAutoEnd: Function }} options
   *   duration in seconds; onBurst(anchorElement)
   */
  function playReveal(view, options) {
    const gsap = window.gsap;
    if (!gsap) return playStaticReveal(view, options);

    const { reducedMotion, onBurst } = options;
    const tl = gsap.timeline();

    // The seal may be tapped before the gate finished fading in
    tl.to(view.root, { opacity: 1, duration: 0.3 }, 0);
    tl.to(view.controls, { autoAlpha: 1, duration: 0.3 }, 0);
    if (!reducedMotion) {
      tl.to(view.seal, { scale: 1.35, autoAlpha: 0, duration: T.sealBreak, ease: 'power2.out' }, 0);
      tl.call(onBurst, [view.seal], 0.05);
    }
    tl.to(view.gateItems, { autoAlpha: 0, y: reducedMotion ? 0 : -12, duration: T.gateOut, stagger: 0.05, ease: 'power1.in' }, 0.1);
    tl.set(view.gate, { autoAlpha: 0 });

    let t = addPrelude(tl, view.preludeLines, T.sealBreak, reducedMotion);
    tl.set(view.stage, { autoAlpha: 1 }, t);
    t = addGalaxyReveal(tl, view, t, options.onGalaxyStart);
    const revealEnd = addContent(tl, view.contentItems, t, reducedMotion);
    addAutoEnd(tl, view, revealEnd, options);

    return wrap(gsap, tl, view.galaxy ? [view.galaxy, ...view.moons] : []);
  }

  // Each line arrives word by word (blur → sharp), holds for a reading time based on its length, then leaves
  function addPrelude(tl, lines, t, reducedMotion) {
    const blur = reducedMotion ? 0 : 8;
    const rise = reducedMotion ? 0 : 10;

    lines.forEach(line => {
      const words = line.querySelectorAll('.se-word');
      tl.set(line, { autoAlpha: 1 }, t);
      tl.fromTo(words,
        { autoAlpha: 0, y: rise, filter: `blur(${blur}px)` },
        { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: T.wordIn, ease: 'power2.out', stagger: T.wordStagger },
        t);
      t += T.wordIn + T.wordStagger * (words.length - 1) + readingTime(line.textContent);
      tl.to(line, { autoAlpha: 0, y: -rise / 2, duration: T.lineOut, ease: 'power1.in' }, t);
      t += T.lineOut + T.lineGap;
    });
    // The photos start arriving while the last line is still fading
    return lines.length ? t - T.lineGap - T.lineOut / 2 : t;
  }

  function readingTime(text) {
    return Math.min(T.holdMax, Math.max(T.holdMin, text.length * T.holdPerChar));
  }

  // The galaxy fades in as a whole, its photos arriving with a light stagger;
  // the scene itself (turntable, swirl, orbits) is started by onGalaxyStart.
  function addGalaxyReveal(tl, view, t, onGalaxyStart) {
    if (!view.galaxy) return t;

    tl.to(view.galaxy, { autoAlpha: 1, duration: T.galaxyIn, ease: 'power2.out' }, t);
    if (view.moons.length) {
      tl.to(view.moons, {
        autoAlpha: 1, duration: T.galaxyIn, ease: 'power2.out', stagger: T.moonStagger
      }, t + 0.2);
    }
    tl.call(onGalaxyStart, null, t);
    return t + T.contentAt;
  }

  function addContent(tl, items, t, reducedMotion) {
    if (!items.length) return t;
    tl.fromTo(items,
      { autoAlpha: 0, y: reducedMotion ? 0 : 18 },
      { autoAlpha: 1, y: 0, duration: T.contentIn, ease: 'power2.out', stagger: T.contentStagger, clearProps: 'transform' },
      t);
    return t + T.contentIn + T.contentStagger * (items.length - 1);
  }

  // The reader always gets at least minReadTime with the full message on screen
  function addAutoEnd(tl, view, revealEnd, { duration, onAutoEnd }) {
    if (!duration) return;
    const total = Math.max(duration, revealEnd + T.minReadTime);
    if (view.progressFill) {
      tl.fromTo(view.progressFill, { scaleX: 0 }, { scaleX: 1, duration: total, ease: 'none' }, 0);
    }
    tl.call(onAutoEnd, null, total);
  }

  function playStaticReveal(view, { duration, onGalaxyStart, onAutoEnd }) {
    view.root.classList.add('se-opened');
    if (view.galaxy) onGalaxyStart();
    const timer = duration ? setTimeout(onAutoEnd, duration * 1000) : null;
    return {
      pause() {},
      resume() {},
      kill() { clearTimeout(timer); }
    };
  }

  // ── Exit ────────────────────────────────────────────────────────────────

  /**
   * Starts from whatever state the gate/reveal reached, so skipping mid-way is smooth.
   * @returns {{ kill: Function }}
   */
  function playExit(view, { reducedMotion }, onComplete) {
    const gsap = window.gsap;
    if (!gsap) {
      view.root.classList.add('se-leaving');
      const timer = setTimeout(onComplete, STATIC_EXIT_MS);
      return { kill() { clearTimeout(timer); } };
    }

    const tl = gsap.timeline({ onComplete });
    if (!reducedMotion) {
      tl.to([view.card, view.gate, view.prelude], {
        autoAlpha: 0, scale: 1.04, filter: 'blur(6px)', duration: T.exitContent, ease: 'power2.in'
      }, 0);
    }
    tl.to(view.root, { opacity: 0, duration: T.exitFade, ease: 'power1.inOut' }, reducedMotion ? 0 : T.exitContent * 0.4);
    return tl;
  }

  return { playGate, playReveal, playExit };
})();
