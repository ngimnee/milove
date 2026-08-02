/* --------------------------------------------------------------------------
   LENIS SMOOTH SCROLLING & GSAP INTEGRATION
   -------------------------------------------------------------------------- */

const SmoothScrollEngine = (function() {
  'use strict';

  let lenis = null;

  function init() {
    // Check if Lenis smooth scroll library is present
    if (typeof Lenis !== 'undefined') {
      lenis = new Lenis({
        duration: 1.4,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothTouch: false
      });

      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);

      // Connect with GSAP ScrollTrigger if available
      if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add((time) => {
          lenis.raf(time * 1000);
        });
        gsap.ticker.lagSmoothing(0);
      }
    }
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
    scrollTo
  };
})();
