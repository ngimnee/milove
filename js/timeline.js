/* --------------------------------------------------------------------------
   LOVE JOURNEY STORY TIMELINE CONTROLLER
   -------------------------------------------------------------------------- */

const TimelineController = (function() {
  'use strict';

  function init() {
    const items = document.querySelectorAll('.timeline-item');
    if (!items.length) return;

    // Use IntersectionObserver as high-performance smooth scroll trigger
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          AudioEngine.playSound('typing');
        }
      });
    }, {
      threshold: 0.25,
      rootMargin: '0px 0px -50px 0px'
    });

    items.forEach(item => observer.observe(item));
  }

  return {
    init
  };
})();
