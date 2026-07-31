/* ==========================================================================
   CINEMATIC INTRO CONTROLLER
   ========================================================================== */

const IntroController = (function() {
  'use strict';

  let introSection = null;
  let lines = [];
  let enterBtn = null;

  function init(onFinishedCallback) {
    introSection = document.getElementById('intro-section');
    lines = document.querySelectorAll('.intro-text-line');
    enterBtn = document.getElementById('intro-enter-btn');

    if (!introSection) return;

    // Show Intro Screen
    introSection.classList.add('active');

    // Sequential line reveals
    lines.forEach((line, index) => {
      setTimeout(() => {
        line.classList.add('show');
        AudioEngine.playSound('typing');
      }, (index + 1) * 1400);
    });

    // Reveal Enter Button
    setTimeout(() => {
      if (enterBtn) {
        enterBtn.classList.add('show');
      }
    }, (lines.length + 1) * 1400);

    // Bind Enter Button Click
    if (enterBtn) {
      enterBtn.addEventListener('click', () => {
        AudioEngine.playSound('click');
        dismissIntro(onFinishedCallback);
      });
    }
  }

  function dismissIntro(onFinished) {
    if (!introSection) return;
    introSection.classList.add('fade-out');

    setTimeout(() => {
      introSection.classList.remove('active');
      introSection.style.display = 'none';
      if (typeof onFinished === 'function') {
        onFinished();
      }
    }, 1500);
  }

  return {
    init
  };
})();
