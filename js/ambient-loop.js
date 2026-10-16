/* --------------------------------------------------------------------------
   AMBIENT LOOP - one animation clock for the background effects
   (galaxy, floating hearts, sakura petals, meteors).
     - Frame-rate independent: every effect gets the elapsed seconds, so a
       120 Hz screen no longer runs it twice as fast as a 60 Hz one
     - Pausable: while something nearly opaque covers the whole screen (the
       letter) the background stops drawing instead of burning battery unseen
     - Reduced motion: effects draw one still frame and never join the loop
   -------------------------------------------------------------------------- */

const AmbientLoop = (function () {
  'use strict';

  const MAX_FRAME_SECONDS = 0.05; // no jump after a hidden tab or a pause
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const steps = new Set();
  const holds = new Set();
  let rafId = null;
  let lastTime = 0;

  /**
   * @param {(dt: number) => void} step runs every frame, dt = seconds since the last one
   */
  function add(step) {
    if (reducedMotion) return;
    steps.add(step);
    wake();
  }

  function frame(now) {
    const dt = Math.min(Math.max(0, now - lastTime) / 1000, MAX_FRAME_SECONDS);
    lastTime = now;
    steps.forEach(step => {
      try {
        step(dt);
      } catch (err) {
        // A broken effect is dropped instead of throwing (and logging) every frame
        console.error('[AmbientLoop] Effect removed after an error:', err);
        steps.delete(step);
      }
    });
    rafId = requestAnimationFrame(frame);
  }

  function wake() {
    if (rafId !== null || holds.size > 0 || steps.size === 0) return;
    lastTime = performance.now();
    rafId = requestAnimationFrame(frame);
  }

  /**
   * Stops drawing until every hold has been released.
   * @param {string} reason
   */
  function hold(reason) {
    holds.add(reason);
    cancelAnimationFrame(rafId);
    rafId = null;
  }

  /** @param {string} reason the same one given to hold() */
  function release(reason) {
    holds.delete(reason);
    wake();
  }

  return {
    add,
    hold,
    release,
    isRunning: () => rafId !== null,
    reducedMotion
  };
})();
