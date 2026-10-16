/* --------------------------------------------------------------------------
   LENIS SMOOTH SCROLLING & GSAP INTEGRATION
   -------------------------------------------------------------------------- */

const SmoothScrollEngine = (function() {
  'use strict';

  const SCROLL_LOCK_CLASS = 'scroll-locked';
  let lenis = null;

  function init() {
    // Check if Lenis smooth scroll library is present
    if (typeof Lenis !== 'undefined') {
      lenis = new Lenis({
        duration: 1.4,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothTouch: false
      });

      // Lenis works out its step from the time between two raf() calls, so exactly ONE clock may
      // drive it: two (its own requestAnimationFrame loop plus gsap.ticker) hand it alternating
      // timestamps and the page scroll stutters.
      if (typeof gsap !== 'undefined') {
        if (typeof ScrollTrigger !== 'undefined') {
          lenis.on('scroll', ScrollTrigger.update);
        }
        gsap.ticker.add((time) => {
          lenis.raf(time * 1000);
        });
        gsap.ticker.lagSmoothing(0);
      } else {
        const raf = (time) => {
          lenis.raf(time);
          requestAnimationFrame(raf);
        };
        requestAnimationFrame(raf);
      }
    }
  }

  // Freeze page scrolling while a full-screen experience owns the viewport.
  // The CSS class also covers native touch scrolling, which Lenis leaves alone.
  function lock() {
    if (lenis) lenis.stop();
    document.documentElement.classList.add(SCROLL_LOCK_CLASS);
  }

  function unlock() {
    document.documentElement.classList.remove(SCROLL_LOCK_CLASS);
    if (lenis) lenis.start();
  }

  function scrollTo(target) {
    if (lenis) {
      lenis.scrollTo(target);
    } else {
      const el = typeof target === 'string' ? document.querySelector(target) : target;
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }

  return {
    init,
    lock,
    unlock,
    scrollTo
  };
})();
